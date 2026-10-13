-- Tres decisiones del restaurante, ya en la base de datos:
-- 1. Se reserva para comer y para cenar, no a cualquier hora de la tarde.
-- 2. Una reserva nace pendiente: la sala la confirma (la web ya dice «te llamaremos para confirmar»).
-- 3. Límites para que no se pueda llenar el aforo con reservas falsas.
-- La web no cambia lo que pide: available_slots(p_date) y create_reservation(...) conservan su firma.

-- ── 1. Servicios ────────────────────────────────────────────────────────────────────────────────────
-- opening_hours sigue diciendo qué días se abre y con qué aforo; aquí va a qué horas se puede reservar.
-- Un día abierto sin servicios no ofrece ninguna hora. Para cambiar un turno basta tocar su fila.
create table public.service_hours (
  day public.day_of_week not null references public.opening_hours (day) on delete cascade,
  service text not null constraint service_hours_service_check check (service in ('lunch', 'dinner')),
  first_seating time not null,
  last_seating time not null,
  primary key (day, service),
  constraint service_hours_times_check check (first_seating <= last_seating)
);
comment on table public.service_hours is 'Turnos en los que se puede reservar cada día: primera y última hora a la que se da mesa.';
alter table public.service_hours enable row level security;
revoke all on public.service_hours from anon;
revoke truncate, references, trigger on public.service_hours from authenticated;
create policy staff_all on public.service_hours for all to authenticated
  using ((select private.is_staff ())) with check ((select private.is_staff ()));

-- Comida todos los días que se abre; cena todos menos el domingo, que se cierra a media tarde.
insert into public.service_hours (day, service, first_seating, last_seating)
select day, 'lunch', time '13:00', time '15:30' from public.opening_hours
union all
select day, 'dinner', time '20:00', time '22:30' from public.opening_hours where day <> 'sun';

-- La última hora de mesa vivía en opening_hours como un solo tramo de 13:00 a 22:30. Ahora la dan los
-- turnos; dejarla aquí sería tener dos sitios que dicen cosas distintas.
alter table public.opening_hours drop constraint opening_hours_times_check;
alter table public.opening_hours drop column last_seating;

-- ── 2. Estado inicial ───────────────────────────────────────────────────────────────────────────────
alter table public.reservations alter column status set default 'pending';

-- ── 3. Límites contra reservas falsas ───────────────────────────────────────────────────────────────
-- Dos topes, y los dos responden lo mismo (TOO_MANY_RESERVATIONS, «llámanos»):
-- · por teléfono: como mucho 3 reservas por venir, entre pendientes y confirmadas;
-- · por conexión: como mucho 5 reservas en una hora y 15 en un día desde la misma dirección IP.
-- De la IP solo se guarda un resumen con sal (no se puede volver a la dirección), aparte de la reserva
-- y durante dos días, que es lo que hace falta para contar.

-- Lo que hay en el almacén de secretos de Supabase (Vault), por su nombre. Solo para funciones internas.
create function private.secret (p_name text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select decrypted_secret from vault.decrypted_secrets where name = p_name
$$;
revoke all on function private.secret (text) from public;

select vault.create_secret(
  replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  'reservation_ip_salt',
  'Sal con la que se resume la IP de quien reserva; cambiarla pone a cero el recuento por conexión'
);

create table private.reservation_origins (
  reservation_id uuid primary key references public.reservations (id) on delete cascade,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index reservation_origins_ip_idx on private.reservation_origins (ip_hash, created_at);

-- Un teléfono se reconoce por sus nueve últimas cifras, se escriba como se escriba (+34 600 11 22 33, 600112233)
create index reservations_phone_digits_idx on public.reservations (right(regexp_replace(phone, '[^0-9]', '', 'g'), 9));

select cron.schedule(
  'purgar-origenes-de-reserva',
  '17 3 * * *',
  $$delete from private.reservation_origins where created_at < now() - interval '2 days'$$
);

-- ── Horas libres: de los turnos ─────────────────────────────────────────────────────────────────────
create or replace function public.available_slots (p_date date)
returns table (slot time, remaining integer)
language sql
stable
security definer
set search_path = ''
as $$
  with here as (
    select (now() at time zone 'Europe/Madrid') as local_now
  ),
  oh as (
    select *
    from public.opening_hours
    where day = (array['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'])[extract(dow from p_date)::int + 1]::public.day_of_week
  ),
  slots as (
    select s as starts_at
    from oh
    join public.service_hours sh on sh.day = oh.day
    cross join lateral generate_series(p_date + sh.first_seating, p_date + sh.last_seating, make_interval(mins => oh.slot_minutes)) s
  ),
  occ as (
    select s.starts_at, coalesce(sum(r.people), 0)::int as used
    from slots s
    cross join oh
    left join public.reservations r
      on r.res_date = p_date
     and r.status in ('pending', 'confirmed', 'seated')
     and (r.res_date + r.res_time) < s.starts_at + make_interval(mins => oh.seating_duration)
     and s.starts_at < (r.res_date + r.res_time) + make_interval(mins => oh.seating_duration)
    group by s.starts_at
  )
  select o.starts_at::time as slot, oh.covers_per_slot - o.used as remaining
  from occ o
  cross join oh
  cross join here
  where oh.covers_per_slot - o.used > 0
    and not exists (
      select 1 from public.blocks b
      where b.block_date = p_date and (b.slot is null or b.slot = o.starts_at::time)
    )
    and p_date <= here.local_now::date + 90
    and o.starts_at > here.local_now + interval '1 hour'
  order by o.starts_at
$$;

-- ── Crear una reserva: con los dos topes ────────────────────────────────────────────────────────────
create or replace function public.create_reservation (
  p_name text,
  p_phone text,
  p_email text,
  p_date date,
  p_time time,
  p_people integer,
  p_notes text default null,
  p_locale text default 'ca'
)
returns public.reservations
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Europe/Madrid')::date;
  v_name text := btrim(coalesce(p_name, ''));
  v_phone text := btrim(coalesce(p_phone, ''));
  v_digits text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_email text := nullif(btrim(coalesce(p_email, '')), '');
  v_notes text := nullif(btrim(coalesce(p_notes, '')), '');
  -- La API deja las cabeceras de la petición en este ajuste; fuera de ella (el editor SQL) no existe
  v_headers json := nullif(current_setting('request.headers', true), '')::json;
  v_ip text := nullif(btrim(coalesce(v_headers ->> 'cf-connecting-ip', split_part(v_headers ->> 'x-forwarded-for', ',', 1), '')), '');
  v_ip_hash text;
  v_left integer;
  v_res public.reservations;
begin
  if p_date is null or p_time is null or p_people is null
     or p_people not between 1 and 12
     or char_length(v_name) not between 1 and 80
     or v_phone !~ '^[0-9+()[:space:].-]{9,20}$'
     or char_length(v_digits) < 9
     or char_length(v_email) > 120
     or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
     or char_length(v_notes) > 300
  then
    raise exception 'INVALID_INPUT';
  end if;

  if p_date < v_today or p_date > v_today + 90 then
    raise exception 'DATE_OUT_OF_RANGE';
  end if;

  -- Los cerrojos se piden siempre en el mismo orden (conexión, teléfono, día) para que dos reservas a la
  -- vez no se queden esperándose la una a la otra.
  if v_ip is not null then
    v_ip_hash := encode(sha256(convert_to(coalesce(private.secret('reservation_ip_salt'), '') || v_ip, 'UTF8')), 'hex');
    perform pg_advisory_xact_lock(hashtextextended('casa-guell:origen:' || v_ip_hash, 0));
    if (select count(*) from private.reservation_origins o where o.ip_hash = v_ip_hash and o.created_at > now() - interval '1 hour') >= 5
       or (select count(*) from private.reservation_origins o where o.ip_hash = v_ip_hash and o.created_at > now() - interval '1 day') >= 15
    then
      raise exception 'TOO_MANY_RESERVATIONS';
    end if;
  end if;

  v_digits := right(v_digits, 9);
  perform pg_advisory_xact_lock(hashtextextended('casa-guell:telefono:' || v_digits, 0));
  if (select count(*) from public.reservations r
      where right(regexp_replace(r.phone, '[^0-9]', '', 'g'), 9) = v_digits
        and r.status in ('pending', 'confirmed')
        and r.res_date >= v_today) >= 3
  then
    raise exception 'TOO_MANY_RESERVATIONS';
  end if;

  -- Las reservas de un mismo día pasan de una en una
  perform pg_advisory_xact_lock(hashtextextended('casa-guell:reserva:' || p_date::text, 0));

  if not exists (
    select 1 from public.opening_hours
    where day = (array['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'])[extract(dow from p_date)::int + 1]::public.day_of_week
  ) then
    raise exception 'CLOSED_DAY';
  end if;

  if exists (select 1 from public.blocks where block_date = p_date and slot is null) then
    raise exception 'BLOCKED_DAY';
  end if;

  select s.remaining into v_left from public.available_slots(p_date) s where s.slot = p_time;
  if v_left is null or v_left < p_people then
    raise exception 'NO_AVAILABILITY';
  end if;

  insert into public.reservations (guest_name, phone, email, res_date, res_time, people, notes, locale)
  values (v_name, v_phone, v_email, p_date, p_time, p_people, v_notes, case when p_locale in ('ca', 'es', 'en') then p_locale else 'ca' end)
  returning * into v_res;

  if v_ip_hash is not null then
    insert into private.reservation_origins (reservation_id, ip_hash) values (v_res.id, v_ip_hash);
  end if;
  return v_res;
end
$$;
