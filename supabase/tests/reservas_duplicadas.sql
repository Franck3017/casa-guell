-- Pruebas de la regla de reservas duplicadas (create_reservation, migración 20261013211314).
--
-- Qué comprueba: que una persona no puede reservar dos veces el mismo día aunque cambie algún dato, y que
-- no se rechaza a quien no es la misma persona. Cada caso dice qué se espera y qué ha salido.
--
-- Cuándo lanzarlas: después de cualquier migración que toque create_reservation, private.email_key,
-- private.name_key o private.names_alike, y antes de darla por buena.
--
-- Cómo: pegar el archivo entero en el SQL Editor de Supabase, o
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/reservas_duplicadas.sql
-- Si todo va bien, la última consulta lista los casos con «pasa». Si alguno falla, el guion termina con
-- un error que dice cuál y qué devolvió la función.
--
-- Qué deja: nada. Las reservas de prueba se crean y se deshacen dentro del propio guion (no llegan a
-- enviarse correos, que salen al confirmar la transacción), en dos días libres, abiertos y sin reservas,
-- de aquí a entre uno y tres meses. La tabla de resultados es temporal y desaparece con la sesión. Lo
-- único que no se deshace es el contador de códigos: gasta cinco números, y el hueco en la numeración
-- no afecta a nada.

drop table if exists pg_temp.prueba_duplicadas;
create temp table prueba_duplicadas (n integer, caso text, esperado text, obtenido text);

do $test$
declare
  v_today date := (now() at time zone 'Europe/Madrid')::date;
  v_days date[];
  v_slots time[] := '{}';
  v_slot time;
  v_base uuid;
  v_id uuid;
  v_results jsonb := '[]';
  v_case jsonb;
  v_got text;
  -- Cada caso: quién pide mesa, desde qué conexión, qué día (1 o 2) y qué debe contestar la función.
  -- El primero es la reserva de partida; los demás se comparan con ella.
  v_cases jsonb := $json$[
    {"caso": "la reserva de partida",
     "nombre": "Jordi Puig Casals", "telefono": "600 000 101", "correo": "Prueba.Duplicadas+mesa@gmail.com", "ip": "203.0.113.1", "dia": 1, "esperado": "aceptada"},
    {"caso": "el mismo teléfono, escrito de otra forma y con otro nombre",
     "nombre": "Marta Soler Vila", "telefono": "+34 600-000-101", "correo": null, "ip": "203.0.113.2", "dia": 1, "esperado": "DUPLICATE_RESERVATION"},
    {"caso": "el mismo correo, con otras mayúsculas, sin puntos, sin alias y en googlemail",
     "nombre": "Marta Soler Vila", "telefono": "600 000 202", "correo": "pruebaduplicadas@googlemail.com", "ip": "203.0.113.2", "dia": 1, "esperado": "DUPLICATE_RESERVATION"},
    {"caso": "un nombre parecido desde la misma conexión",
     "nombre": "jordi puig", "telefono": "655 444 303", "correo": null, "ip": "203.0.113.1", "dia": 1, "esperado": "DUPLICATE_RESERVATION"},
    {"caso": "un nombre parecido con el teléfono cambiado en una cifra",
     "nombre": "Jordi Puig Casals", "telefono": "600 000 102", "correo": null, "ip": "203.0.113.3", "dia": 1, "esperado": "DUPLICATE_RESERVATION"},
    {"caso": "un nombre parecido y nada más en común: el nombre no decide solo",
     "nombre": "Jordi Puig", "telefono": "611 222 333", "correo": "otra.persona@example.com", "ip": "203.0.113.4", "dia": 1, "esperado": "aceptada"},
    {"caso": "otra persona desde la misma conexión: la conexión no decide sola",
     "nombre": "Laura Vidal Roca", "telefono": "622 333 444", "correo": null, "ip": "203.0.113.1", "dia": 1, "esperado": "aceptada"},
    {"caso": "la misma persona otro día",
     "nombre": "Jordi Puig Casals", "telefono": "600 000 101", "correo": "prueba.duplicadas@gmail.com", "ip": "203.0.113.1", "dia": 2, "esperado": "aceptada"},
    {"caso": "la misma persona el mismo día, con la primera reserva ya cancelada",
     "nombre": "Jordi Puig Casals", "telefono": "600 000 101", "correo": null, "ip": "203.0.113.5", "dia": 1, "esperado": "aceptada", "antes": "cancelar la de partida"}
  ]$json$;
begin
  -- Dos días que no toquen a nadie: abiertos, sin bloqueos y sin ninguna reserva
  select array_agg(d order by d) into v_days
  from (
    select d::date as d
    from generate_series(v_today + 30, v_today + 90, interval '1 day') d
    where exists (
        select 1 from public.opening_hours oh
        where oh.day = (array['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'])[extract(dow from d)::int + 1]::public.day_of_week
      )
      and not exists (select 1 from public.blocks b where b.block_date = d::date)
      and not exists (select 1 from public.reservations r where r.res_date = d::date)
    order by d
    limit 2
  ) free;
  if coalesce(array_length(v_days, 1), 0) < 2 then
    raise exception 'No hay dos días libres y sin reservas entre % y % para hacer las pruebas', v_today + 30, v_today + 90;
  end if;

  for i in 1..2 loop
    select s.slot into v_slot from public.available_slots(v_days[i]) s where s.remaining >= 2 order by s.slot limit 1;
    if v_slot is null then
      raise exception 'El % no tiene ninguna hora con sitio para dos', v_days[i];
    end if;
    v_slots := v_slots || v_slot;
  end loop;

  -- Todo lo que sigue se deshace al salir de este bloque: termina siempre en una excepción, y lo que se
  -- hace dentro de un bloque que acaba así no queda. Los resultados viajan en una variable.
  begin
    for v_case in select * from jsonb_array_elements(v_cases) loop
      if v_case ->> 'antes' = 'cancelar la de partida' then
        update public.reservations set status = 'cancelled' where id = v_base;
      end if;

      -- La función reconoce la conexión por esta cabecera, que en producción pone la API
      perform set_config('request.headers', jsonb_build_object('cf-connecting-ip', v_case ->> 'ip')::text, true);
      begin
        select r.id into v_id
        from public.create_reservation(
          v_case ->> 'nombre', v_case ->> 'telefono', v_case ->> 'correo',
          v_days[(v_case ->> 'dia')::int], v_slots[(v_case ->> 'dia')::int], 2
        ) r;
        v_got := 'aceptada';
        -- La primera que entra es la de partida: la que luego se cancela
        v_base := coalesce(v_base, v_id);
      exception when others then
        v_got := sqlerrm;
      end;

      v_results := v_results || jsonb_build_object('caso', v_case ->> 'caso', 'esperado', v_case ->> 'esperado', 'obtenido', v_got);
    end loop;

    raise exception 'DESHACER_PRUEBAS';
  exception when others then
    if sqlerrm <> 'DESHACER_PRUEBAS' then raise; end if;
  end;

  insert into prueba_duplicadas (n, caso, esperado, obtenido)
  select t.n, t.r ->> 'caso', t.r ->> 'esperado', t.r ->> 'obtenido'
  from jsonb_array_elements(v_results) with ordinality as t (r, n);
end
$test$;

do $check$
declare
  v_failed text;
begin
  select string_agg(format('«%s»: se esperaba %s y ha salido %s', caso, esperado, obtenido), '; ' order by n)
  into v_failed
  from prueba_duplicadas
  where obtenido is distinct from esperado;

  if v_failed is not null then
    raise exception 'Reservas duplicadas, pruebas que fallan: %', v_failed;
  end if;
end
$check$;

select caso, esperado, obtenido, 'pasa' as resultado from prueba_duplicadas order by n;
