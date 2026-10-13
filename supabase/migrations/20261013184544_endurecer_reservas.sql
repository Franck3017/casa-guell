-- Endurece la base de datos de reservas. No cambia lo que la web le pide ni lo que recibe:
-- available_slots(p_date) y create_reservation(...) conservan su firma y su respuesta.
--
-- 1. Quién puede leer y tocar las reservas: solo el personal de sala, no cualquier cuenta con sesión.
-- 2. El aforo se cuenta bien también en las últimas horas del día (22:00 y 22:30).
-- 3. create_reservation valida lo que recibe y aplica las mismas reglas que available_slots.
-- 4. «Hoy» es el día de Barcelona, no el del servidor (UTC).
-- 5. Menos permisos de los que nadie necesita, y límites en los datos que se guardan.

-- ── 1. Personal de sala ─────────────────────────────────────────────────────────────────────────────
-- Antes, las políticas dejaban leer y cambiar todo a cualquier usuario con sesión (using true). Si el alta
-- de usuarios está abierta, cualquiera que se registre con la clave pública vería nombres, teléfonos y
-- correos de los comensales. Ahora hace falta estar en esta lista.
-- Para dar de alta a otra persona: crear su usuario en Authentication y añadir su id aquí.

create schema if not exists private;
grant usage on schema private to authenticated;

create table public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
comment on table public.staff is 'Personal de sala: las cuentas que pueden ver y gestionar reservas, cierres y horario.';
alter table public.staff enable row level security;
-- Sin políticas: la lista solo se gestiona desde el panel de Supabase o con la clave de servicio.
revoke all on public.staff from anon, authenticated;

-- Quien ya tenía cuenta es quien ha estado usando el panel.
insert into public.staff (user_id) select id from auth.users;

-- Vive fuera del esquema que publica la API: no se puede llamar desde fuera, solo la usan las políticas.
create function private.is_staff ()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.staff where user_id = (select auth.uid()))
$$;
revoke all on function private.is_staff () from public;
grant execute on function private.is_staff () to authenticated;

-- Había dos políticas iguales por tabla (admin_all_* y admin_*): queda una, y pregunta por el personal.
drop policy admin_all_reservations on public.reservations;
drop policy admin_res on public.reservations;
drop policy admin_all_blocks on public.blocks;
drop policy admin_blocks on public.blocks;
drop policy admin_all_opening_hours on public.opening_hours;
-- El horario con su aforo no lo lee la web (lo usan las funciones): deja de ser público.
drop policy read_hours on public.opening_hours;

create policy staff_all on public.reservations for all to authenticated
  using ((select private.is_staff ())) with check ((select private.is_staff ()));
create policy staff_all on public.blocks for all to authenticated
  using ((select private.is_staff ())) with check ((select private.is_staff ()));
create policy staff_all on public.opening_hours for all to authenticated
  using ((select private.is_staff ())) with check ((select private.is_staff ()));

-- ── 2. Permisos ─────────────────────────────────────────────────────────────────────────────────────
-- Quien no ha iniciado sesión solo habla con la base de datos a través de las dos funciones de reserva.
revoke all on public.reservations, public.blocks, public.opening_hours from anon;
revoke truncate, references, trigger on public.reservations, public.blocks, public.opening_hours from authenticated;
revoke all on sequence public.reservation_code_seq from anon;

-- Funciones internas (un disparador y un disparador de eventos): no son para llamarlas desde la API.
-- rls_auto_enable la pone Supabase al crear el proyecto con «RLS automático»; en uno que no la tenga, se salta.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable () from public, anon, authenticated;
  end if;
end
$$;

create or replace function public.touch_updated_at ()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end
$$;
revoke execute on function public.touch_updated_at () from public, anon, authenticated;

-- ── 3. Límites en los datos ─────────────────────────────────────────────────────────────────────────
-- Los mismos del formulario de la web, para que tampoco entren por otro camino.
alter table public.reservations
  add constraint reservations_guest_name_check check (char_length(btrim(guest_name)) between 1 and 80),
  add constraint reservations_phone_check check (phone ~ '^[0-9+()[:space:].-]{9,20}$'),
  add constraint reservations_email_check check (email is null or (char_length(email) <= 120 and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')),
  add constraint reservations_notes_check check (notes is null or char_length(notes) <= 300),
  add constraint reservations_locale_check check (locale in ('ca', 'es', 'en'));

-- Un paso de cero minutos haría fallar el cálculo de las horas; un aforo de cero cerraría el día sin decirlo.
alter table public.opening_hours
  add constraint opening_hours_times_check check (open_time <= last_seating),
  add constraint opening_hours_numbers_check check (covers_per_slot > 0 and slot_minutes > 0 and seating_duration > 0);

-- El mismo cierre no se apunta dos veces (un día entero es slot nulo, y dos nulos también son iguales).
alter table public.blocks
  add constraint blocks_day_slot_key unique nulls not distinct (block_date, slot);

-- Nadie busca por estado a solas, y con seis valores un índice no ayuda.
drop index public.idx_res_status;

-- ── 4. Horas libres ─────────────────────────────────────────────────────────────────────────────────
-- Dos arreglos:
-- · Las horas se comparan como fecha y hora. Como hora sola, 22:30 más dos horas da 00:30 del mismo día,
--   la comparación fallaba y las reservas de las 22:00 y las 22:30 no contaban para el aforo.
-- · «Hoy» y «ahora» son los de Barcelona. Con la fecha del servidor (UTC), pasada la medianoche se seguían
--   ofreciendo horas del día anterior.
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
    from oh, generate_series(p_date + oh.open_time, p_date + oh.last_seating, make_interval(mins => oh.slot_minutes)) s
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

-- ── 5. Crear una reserva ────────────────────────────────────────────────────────────────────────────
-- · Valida lo que recibe (antes aceptaba nombres vacíos, textos sin límite y cualquier hora).
-- · La hora tiene que ser una de las que ofrece available_slots: así las reglas (horario, cierres de una
--   hora, antelación, aforo) están en un solo sitio y no se pueden saltar llamando a la función a mano.
-- · El cerrojo es por día y no depende de que ya haya reservas ese día: antes, con el día vacío, dos
--   reservas a la vez no se esperaban la una a la otra.
-- · El correo vacío se guarda como nulo, que es lo que espera el envío de correos.
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
  v_email text := nullif(btrim(coalesce(p_email, '')), '');
  v_notes text := nullif(btrim(coalesce(p_notes, '')), '');
  v_left integer;
  v_res public.reservations;
begin
  if p_date is null or p_time is null or p_people is null
     or p_people not between 1 and 12
     or char_length(v_name) not between 1 and 80
     or v_phone !~ '^[0-9+()[:space:].-]{9,20}$'
     or char_length(v_email) > 120
     or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
     or char_length(v_notes) > 300
  then
    raise exception 'INVALID_INPUT';
  end if;

  if p_date < v_today or p_date > v_today + 90 then
    raise exception 'DATE_OUT_OF_RANGE';
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
  return v_res;
end
$$;

-- Solo las llaman la web (sin sesión), el panel y la clave de servicio; no «cualquier rol».
revoke execute on function public.available_slots (date) from public;
revoke execute on function public.create_reservation (text, text, text, date, time, integer, text, text) from public;
grant execute on function public.available_slots (date) to anon, authenticated, service_role;
grant execute on function public.create_reservation (text, text, text, date, time, integer, text, text) to anon, authenticated, service_role;
