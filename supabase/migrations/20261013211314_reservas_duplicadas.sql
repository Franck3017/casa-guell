-- Una persona no puede tener dos reservas para el mismo día, aunque al repetir cambie un poco los datos.
-- create_reservation rechaza la nueva (DUPLICATE_RESERVATION) si para ese día ya hay una pendiente o
-- confirmada que coincide en cualquiera de estos puntos:
--   1. el mismo teléfono, se escriba como se escriba;
--   2. el mismo correo, sin contar mayúsculas, puntos ni alias con «+»;
--   3. un nombre muy parecido y, además, la misma conexión o un teléfono que cambia en una o dos cifras.
-- El nombre nunca decide solo: «Marta García» y «María García» se parecen más que «Juan Pérez García» y
-- «juan perez», así que por nombre solo se rechazaría a dos hermanas y se colarían las variantes.
-- La firma de la función no cambia.

create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;
create extension if not exists fuzzystrmatch with schema extensions;

-- El correo como buzón: «Ana.Ferrer+mesa@Gmail.com» y «anaferrer@gmail.com» son el mismo.
create function private.email_key (p_email text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_email is null or position('@' in p_email) = 0 then null
    else replace(split_part(split_part(lower(btrim(p_email)), '@', 1), '+', 1), '.', '')
      || '@'
      || case split_part(lower(btrim(p_email)), '@', 2)
           when 'googlemail.com' then 'gmail.com'
           else split_part(lower(btrim(p_email)), '@', 2)
         end
  end
$$;
revoke all on function private.email_key (text) from public;

-- El nombre sin tildes, sin mayúsculas y sin signos: solo sus letras.
create function private.name_key (p_name text)
returns text
language sql
stable
set search_path = ''
as $$
  select btrim(regexp_replace(lower(extensions.unaccent(coalesce(p_name, ''))), '[^[:alpha:]]+', ' ', 'g'))
$$;
revoke all on function private.name_key (text) from public;

-- Dos nombres que son, casi seguro, de la misma persona: uno dentro del otro («Jordi Puig i Casals» y
-- «Jordi Puig»), con una errata o abreviado («Montserrat» y «Montse»). El umbral sale de probar variantes
-- de una misma persona (todas por encima de 0,73) y parejas de personas distintas con el mismo apellido
-- (todas por debajo de 0,68).
create function private.names_alike (p_a text, p_b text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select private.name_key(p_a) <> '' and greatest(
    extensions.similarity(private.name_key(p_a), private.name_key(p_b)),
    extensions.word_similarity(private.name_key(p_a), private.name_key(p_b)),
    extensions.word_similarity(private.name_key(p_b), private.name_key(p_a))
  ) >= 0.7
$$;
revoke all on function private.names_alike (text, text) from public;

-- El resumen de la conexión se borraba a los dos días. Ahora se guarda mientras la reserva esté por venir,
-- porque hace falta para reconocer a quien repite; pasado el día de la reserva, se borra.
select cron.schedule(
  'purgar-origenes-de-reserva',
  '17 3 * * *',
  $$delete from private.reservation_origins o using public.reservations r where r.id = o.reservation_id and o.created_at < now() - interval '2 days' and r.res_date < (now() at time zone 'Europe/Madrid')::date$$
);

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
  v_email_key text;
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

  -- ¿Ya tiene mesa ese día? Se mira con el día ya bajo cerrojo: dos intentos a la vez se ven el uno al otro.
  v_email_key := private.email_key(v_email);
  if exists (
    select 1
    from public.reservations r
    left join private.reservation_origins o on o.reservation_id = r.id
    where r.res_date = p_date
      and r.status in ('pending', 'confirmed')
      and (
        right(regexp_replace(r.phone, '[^0-9]', '', 'g'), 9) = v_digits
        or (v_email_key is not null and private.email_key(r.email) = v_email_key)
        or (
          private.names_alike(r.guest_name, v_name)
          and (
            (v_ip_hash is not null and o.ip_hash = v_ip_hash)
            or extensions.levenshtein(right(regexp_replace(r.phone, '[^0-9]', '', 'g'), 9), v_digits) <= 2
          )
        )
      )
  ) then
    raise exception 'DUPLICATE_RESERVATION';
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
