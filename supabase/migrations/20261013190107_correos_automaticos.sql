-- Correos automáticos de las reservas. La base de datos avisa a la función reservation-emails:
-- · al crear una reserva (acuse al cliente y aviso a la sala),
-- · cuando la sala la confirma (confirmación al cliente),
-- · cada media hora, para los recordatorios de la víspera.
-- El aviso solo lleva el identificador de la reserva; la función lee el resto de la tabla.
-- Un correo que no sale nunca impide reservar: la llamada va aparte y sus fallos solo quedan anotados.

-- pg_net (las llamadas HTTP desde la base de datos) estaba instalado en public; su sitio es extensions.
-- No se puede mover: se quita y se vuelve a poner. Todavía no lo usaba nada.
drop extension pg_net;
create extension pg_net with schema extensions;

-- El secreto con el que la base de datos firma sus llamadas: se genera aquí y no sale de Vault. La función
-- lo lee con la clave de servicio (reservation_emails_secret, más abajo).
select vault.create_secret(
  replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  'reservation_emails_secret',
  'Secreto que acompaña a cada llamada de la base de datos a la función reservation-emails'
);

-- La dirección de la función. Es la de este proyecto; en otro, basta cambiar este secreto.
select vault.create_secret(
  'https://ijckxnlnbdzknqybzaxe.supabase.co/functions/v1/reservation-emails',
  'reservation_emails_url',
  'Dirección de la función reservation-emails'
);

create function private.notify_reservation_emails (p_body jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url text := private.secret('reservation_emails_url');
  v_secret text := private.secret('reservation_emails_secret');
begin
  if v_url is null or v_secret is null then
    raise warning 'reservation-emails: falta la dirección o el secreto en Vault; no se avisa';
    return;
  end if;
  perform net.http_post(
    url := v_url,
    body := p_body,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', v_secret),
    timeout_milliseconds := 10000
  );
exception when others then
  -- Que no se pueda avisar no puede tumbar la reserva que lo provoca
  raise warning 'reservation-emails: no se ha podido avisar: %', sqlerrm;
end
$$;
revoke all on function private.notify_reservation_emails (jsonb) from public;

create function private.on_reservation_change ()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform private.notify_reservation_emails(jsonb_build_object('type', 'INSERT', 'table', 'reservations', 'record', jsonb_build_object('id', new.id)));
  -- Solo el paso de pendiente a confirmada: devolver a «confirmada» una mesa ya sentada no escribe a nadie
  elsif new.status = 'confirmed' and old.status = 'pending' then
    perform private.notify_reservation_emails(jsonb_build_object('type', 'UPDATE', 'table', 'reservations', 'record', jsonb_build_object('id', new.id)));
  end if;
  return null;
end
$$;
revoke all on function private.on_reservation_change () from public;

create trigger trg_res_emails
  after insert or update of status on public.reservations
  for each row execute function private.on_reservation_change ();

-- La función pide aquí su secreto. Solo con la clave de servicio: ni la web ni el panel pueden llamarla.
create function public.reservation_emails_secret ()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select private.secret('reservation_emails_secret')
$$;
revoke execute on function public.reservation_emails_secret () from public, anon, authenticated;
grant execute on function public.reservation_emails_secret () to service_role;

select cron.schedule(
  'recordatorios-de-reserva',
  '*/30 * * * *',
  $$select private.notify_reservation_emails('{"type": "reminders"}'::jsonb)$$
);
