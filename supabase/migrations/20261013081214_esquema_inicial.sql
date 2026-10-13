-- Esquema con el que nació la base de datos de reservas. Se creó a mano en el editor SQL de Supabase el 13
-- de octubre de 2026, sin migración. Este archivo lo reconstruye leyendo la base de datos, para que el
-- proyecto se pueda levantar de cero; en la base de datos real consta como aplicada sin haberse ejecutado.
-- Está tal como estaba, fallos incluidos: lo que se corrige va en las migraciones siguientes.

create extension if not exists pg_cron;
-- Sin esquema, que es como se instaló (en public); una migración posterior lo mueve
create extension if not exists pg_net;

create type public.day_of_week as enum ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
create type public.reservation_status as enum ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show');

create sequence public.reservation_code_seq;

-- Un día sin fila es un día de cierre
create table public.opening_hours (
  day public.day_of_week primary key,
  open_time time not null,
  close_time time not null,
  last_seating time not null,
  covers_per_slot integer not null default 40,
  slot_minutes integer not null default 30,
  seating_duration integer not null default 120
);

-- Cierres puntuales: de un día entero (slot nulo) o de una hora
create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  block_date date not null,
  slot time,
  reason text,
  created_at timestamptz not null default now()
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('CG-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.reservation_code_seq')::text, 4, '0')),
  guest_name text not null,
  phone text not null,
  email text,
  res_date date not null,
  res_time time not null,
  people integer not null check (people >= 1 and people <= 12),
  status public.reservation_status not null default 'confirmed',
  notes text,
  locale text not null default 'ca',
  reminded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_res_date_time on public.reservations (res_date, res_time);
create index idx_res_status on public.reservations (status);

alter table public.opening_hours enable row level security;
alter table public.blocks enable row level security;
alter table public.reservations enable row level security;

create policy read_hours on public.opening_hours for select to anon, authenticated using (true);
create policy admin_all_opening_hours on public.opening_hours for all to authenticated using (true) with check (true);
create policy admin_all_blocks on public.blocks for all to authenticated using (true) with check (true);
create policy admin_blocks on public.blocks for all to authenticated using (true) with check (true);
create policy admin_all_reservations on public.reservations for all to authenticated using (true) with check (true);
create policy admin_res on public.reservations for all to authenticated using (true) with check (true);

create function public.touch_updated_at ()
returns trigger
language plpgsql
as $$ begin new.updated_at = now(); return new; end $$;

create trigger trg_res_touch before update on public.reservations
  for each row execute function public.touch_updated_at ();

create function public.available_slots (p_date date)
returns table (slot time, remaining integer)
language sql
stable
security definer
set search_path = public
as $$
  with dow as (
    select case extract(dow from p_date)::int
      when 0 then 'sun' when 1 then 'mon' when 2 then 'tue' when 3 then 'wed'
      when 4 then 'thu' when 5 then 'fri' else 'sat' end::day_of_week as d
  ),
  oh as (select * from opening_hours where day = (select d from dow)),
  slots as (
    select s::time as slot
    from oh, generate_series(
      (p_date + oh.open_time)::timestamp,
      (p_date + oh.last_seating)::timestamp,
      make_interval(mins => oh.slot_minutes)
    ) s
  ),
  occ as (
    select s.slot, coalesce(sum(r.people), 0) as used
    from slots s
    left join reservations r
      on r.res_date = p_date
     and r.status in ('pending','confirmed','seated')
     and r.res_time < s.slot + (select seating_duration from oh) * interval '1 minute'
     and s.slot     < r.res_time + (select seating_duration from oh) * interval '1 minute'
    group by s.slot
  )
  select o.slot, (select covers_per_slot from oh) - o.used as remaining
  from occ o
  where (select covers_per_slot from oh) - o.used > 0
    and not exists (select 1 from blocks b
                    where b.block_date = p_date and (b.slot is null or b.slot = o.slot))
    and (p_date > current_date
         or (p_date = current_date
             and o.slot > (now() at time zone 'Europe/Madrid')::time + interval '1 hour'))
  order by o.slot;
$$;

create function public.create_reservation (
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
set search_path = public
as $$
declare
  v_covers int; v_dur int; v_used int; v_res public.reservations;
begin
  if p_date < current_date or p_date > current_date + 90 then
    raise exception 'DATE_OUT_OF_RANGE';
  end if;
  perform 1 from reservations where res_date = p_date for update;  -- lock del día

  select covers_per_slot, seating_duration into v_covers, v_dur
  from opening_hours
  where day = case extract(dow from p_date)::int
    when 0 then 'sun' when 1 then 'mon' when 2 then 'tue' when 3 then 'wed'
    when 4 then 'thu' when 5 then 'fri' else 'sat' end::day_of_week;
  if v_covers is null then raise exception 'CLOSED_DAY'; end if;

  if exists (select 1 from blocks where block_date = p_date and slot is null) then
    raise exception 'BLOCKED_DAY';
  end if;

  select coalesce(sum(people), 0) into v_used
  from reservations
  where res_date = p_date
    and status in ('pending','confirmed','seated')
    and res_time < p_time + v_dur * interval '1 minute'
    and p_time   < res_time + v_dur * interval '1 minute';
  if v_used + p_people > v_covers then raise exception 'NO_AVAILABILITY'; end if;

  insert into reservations (guest_name, phone, email, res_date, res_time, people, notes, locale)
  values (p_name, p_phone, p_email, p_date, p_time, p_people, p_notes, p_locale)
  returning * into v_res;
  return v_res;
end $$;

-- Miércoles y jueves, 40 cubiertos a la vez; viernes y sábado, 48; domingo, 32 y solo hasta la tarde.
-- Lunes y martes no tienen fila: cerrado.
insert into public.opening_hours (day, open_time, close_time, last_seating, covers_per_slot, slot_minutes, seating_duration) values
  ('wed', '13:00', '00:00', '22:30', 40, 30, 120),
  ('thu', '13:00', '00:00', '22:30', 40, 30, 120),
  ('fri', '13:00', '00:00', '22:30', 48, 30, 120),
  ('sat', '13:00', '00:00', '22:30', 48, 30, 120),
  ('sun', '13:00', '18:00', '16:30', 32, 30, 120);
