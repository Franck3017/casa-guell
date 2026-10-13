import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHandler, createResendSender, type Reservation, type ReservationStore } from './handler.ts'

// Aquí solo se conecta la función con lo de fuera: las variables del entorno, la tabla de reservas y
// Resend. Lo que hace con ello está en handler.ts.
//
// La llama la propia base de datos: un disparador al crear o confirmar una reserva y una tarea
// programada para los recordatorios (migración correos_automaticos). Cada llamada trae en la cabecera
// `x-webhook-secret` un secreto que la base de datos genera y guarda en Vault; la función se lo pide al
// arrancar con la clave de servicio, así que no hay que copiarlo a mano en ningún sitio.
//
// Lo único que hay que poner en los secretos de la función:
// · RESEND_API_KEY: la clave de Resend. Sin ella no sale ningún correo (las reservas siguen funcionando).
// · RESERVATION_EMAILS_FROM (opcional): el remitente, como «Casa Güell <reservas@dominio>». Su dominio
//   tiene que estar verificado en Resend. Sin él firma el de la casa (DEFAULT_FROM en handler.ts).
// · RESERVATION_NOTIFY_EMAIL (opcional): la dirección de la sala, para avisarla de cada solicitud nueva.

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const FIELDS = 'id, email, guest_name, code, people, res_date, res_time, status, locale, phone, notes'

const store: ReservationStore = {
  async findById (id) {
    const { data, error } = await supabase.from('reservations').select(FIELDS).eq('id', id).maybeSingle()
    if (error) throw new Error(`reservations: ${error.message}`)
    return data as Reservation | null
  },

  async awaitingReminder (from, to) {
    const { data, error } = await supabase
      .from('reservations')
      .select(FIELDS)
      .eq('status', 'confirmed')
      .is('reminded_at', null)
      .gte('res_date', from)
      .lte('res_date', to)
    if (error) throw new Error(`reservations: ${error.message}`)
    return (data ?? []) as Reservation[]
  },

  async markReminded (id, at) {
    const { error } = await supabase.from('reservations').update({ reminded_at: at }).eq('id', id)
    if (error) throw new Error(`reservations: ${error.message}`)
  }
}

/** El secreto con el que la base de datos firma sus llamadas. RESERVATION_EMAILS_SECRET, si está, manda. */
async function loadSecret (): Promise<string | undefined> {
  const fromEnv = Deno.env.get('RESERVATION_EMAILS_SECRET')
  if (fromEnv) return fromEnv
  const { data, error } = await supabase.rpc('reservation_emails_secret')
  if (error) console.error('reservation-emails: no se ha podido leer el secreto:', error.message)
  return typeof data === 'string' && data !== '' ? data : undefined
}

let handler: ((req: Request) => Promise<Response>) | undefined

Deno.serve(async (req) => {
  // Si al arrancar no se pudo leer el secreto, se vuelve a intentar en la siguiente llamada
  if (handler == null) {
    const secret = await loadSecret()
    if (secret == null) return new Response('unavailable', { status: 503 })
    handler = createHandler({
      secret,
      store,
      sendEmail: createResendSender({ apiKey: Deno.env.get('RESEND_API_KEY') ?? '', from: Deno.env.get('RESERVATION_EMAILS_FROM') }),
      notifyTo: Deno.env.get('RESERVATION_NOTIFY_EMAIL') || undefined
    })
  }
  return await handler(req)
})
