-- Los puntos del nombre de un correo solo dan igual en Gmail: «ana.ferrer@gmail.com» y
-- «anaferrer@gmail.com» llegan al mismo buzón. En el resto, «a.ferrer@empresa.com» y
-- «aferrer@empresa.com» pueden ser de dos personas, y hasta ahora la segunda se quedaba sin mesa el día
-- en que la primera ya había reservado. A partir de aquí los puntos solo se quitan en Gmail.
--
-- Lo demás no cambia: las mayúsculas, los espacios alrededor y los alias con «+» siguen sin contar en
-- ningún dominio (detrás de un alias está, casi siempre, la misma persona), y googlemail.com sigue
-- siendo gmail.com. La firma tampoco cambia. create_reservation calcula la clave en cada reserva: no hay
-- nada guardado que rehacer.

create or replace function private.email_key (p_email text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_email is null or position('@' in p_email) = 0 then null
    else (
      select case when m.domain = 'gmail.com' then replace(m.mailbox, '.', '') else m.mailbox end || '@' || m.domain
      from (
        select
          split_part(split_part(lower(btrim(p_email)), '@', 1), '+', 1) as mailbox,
          case split_part(lower(btrim(p_email)), '@', 2)
            when 'googlemail.com' then 'gmail.com'
            else split_part(lower(btrim(p_email)), '@', 2)
          end as domain
      ) m
    )
  end
$$;
