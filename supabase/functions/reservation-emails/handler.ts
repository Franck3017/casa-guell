// Lo que hace la función, sin nada propio de Deno ni de Supabase: quién puede llamarla, qué correo
// sale y cuándo se da por enviado. La base de datos y el envío llegan desde fuera (index.ts los
// conecta), así que esto se prueba en tests/unit/reservationEmails.test.ts con una lista y una bandeja.

export interface Reservation {
  id: string | number
  email: string | null
  guest_name: string
  code: string
  people: number
  res_date: string
  res_time: string
  /** pending, confirmed, seated, completed, cancelled o no_show. */
  status: string
  /** El idioma en que se hizo la reserva: ca, es o en. */
  locale: string
  phone: string
  notes: string | null
}

export interface Email {
  to: string
  subject: string
  html: string
}

/** Las tres cosas que la función necesita de la tabla de reservas. Cada una falla si falla la base de datos. */
export interface ReservationStore {
  /** La reserva con ese identificador, o null si no existe. */
  findById: (id: Reservation['id']) => Promise<Reservation | null>
  /** Reservas confirmadas y sin recordatorio entre dos fechas (AAAA-MM-DD), las dos incluidas. */
  awaitingReminder: (from: string, to: string) => Promise<Reservation[]>
  markReminded: (id: Reservation['id'], at: string) => Promise<void>
}

interface HandlerOptions {
  /** El secreto que deben traer el webhook y pg_cron. Sin él, la función lo rechaza todo. */
  secret: string | undefined
  store: ReservationStore
  sendEmail: (email: Email) => Promise<void>
  /** La dirección de la sala. Si está, recibe un aviso de cada solicitud nueva; si no, nadie más que el cliente. */
  notifyTo?: string
  now?: () => Date
}

/** Cabecera en la que el webhook de la base de datos y pg_cron mandan el secreto. */
export const SECRET_HEADER = 'x-webhook-secret'

const HOUR_MS = 36e5
const DAY_MS = 864e5

// Las reservas guardan la fecha y la hora que marca el reloj del restaurante, y la función corre en UTC:
// leídas sin más, las 21:00 de Barcelona serían las 21:00 UTC, una o dos horas más tarde de lo que son.
const TIME_ZONE = 'Europe/Madrid'

const restaurantClock = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
})

/** Lo que marca el reloj del restaurante en un instante, escrito como si esa lectura fuera UTC. */
function wallClock (instant: number): number {
  const part = Object.fromEntries(restaurantClock.formatToParts(new Date(instant)).map(({ type, value }) => [type, Number(value)]))
  return Date.UTC(part.year, part.month - 1, part.day, part.hour, part.minute, part.second)
}

/** El instante en que el reloj del restaurante marca esa fecha (AAAA-MM-DD) y esa hora (HH:MM o HH:MM:SS). */
export function restaurantTime (date: string, time: string): Date {
  const reading = new Date(`${date}T${time}Z`).getTime()
  if (Number.isNaN(reading)) return new Date(Number.NaN)
  // Cuánto adelanta el reloj del restaurante a UTC depende de la fecha (horario de verano). Se mide en
  // una primera aproximación y otra vez en el instante que sale, por si entre los dos cae el cambio de hora.
  const ahead = (instant: number): number => wallClock(instant) - instant
  return new Date(reading - ahead(reading - ahead(reading)))
}

/** El día del calendario del restaurante en un instante, como AAAA-MM-DD. */
const restaurantDate = (instant: number): string => new Date(wallClock(instant)).toISOString().slice(0, 10)

/** El nombre lo escribe el cliente: sin esto, lo que ponga se interpretaría como HTML en un correo del restaurante. */
export function escapeHtml (text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const safe = (value: unknown): string => escapeHtml(String(value))

/**
 * Envío con Resend. `fetch` no falla cuando el servidor responde con un error (clave caducada, dominio
 * sin verificar, demasiados envíos): hay que mirar la respuesta, o el correo se da por enviado sin estarlo.
 */
export function createResendSender (apiKey: string, fetchImpl: typeof fetch = fetch): (email: Email) => Promise<void> {
  return async ({ to, subject, html }) => {
    if (apiKey === '') throw new Error('Falta RESEND_API_KEY')
    const response = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Casa Güell <reserves@casaguellbcn.com>', to, subject, html })
    })
    if (!response.ok) throw new Error(`Resend ha respondido ${response.status}: ${await response.text()}`)
  }
}

/** Compara sin salir antes al primer carácter distinto: el tiempo que tarda no delata cuánto se ha acertado. */
function sameSecret (given: string | null, expected: string | undefined): boolean {
  if (given == null || expected == null || expected === '') return false
  let difference = given.length ^ expected.length
  for (let i = 0; i < expected.length; i++) difference |= (given.charCodeAt(i) || 0) ^ expected.charCodeAt(i)
  return difference === 0
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

// ── Lo que se escribe ──────────────────────────────────────────────────────────────────────────────
// Tres correos al cliente, en el idioma en que reservó: el acuse de una solicitud (la reserva nace
// pendiente y la sala la confirma), la confirmación y el recordatorio de la víspera.

type Lang = 'ca' | 'es' | 'en'
type Kind = 'received' | 'confirmed' | 'reminder'

/** La reserva ya lista para escribirla: cada dato como se lee y sin nada que pueda pasar por HTML. */
interface Summary {
  name: string
  code: string
  party: string
  date: string
  time: string
}

interface Wording {
  locale: string
  party: (people: number) => string
  codeLabel: string
  subject: Record<Kind, (code: string) => string>
  body: Record<Kind, (s: Summary) => string>
}

const WORDING: Record<Lang, Wording> = {
  ca: {
    locale: 'ca-ES',
    party: (n) => n === 1 ? '1 persona' : `${n} persones`,
    codeLabel: 'Codi de reserva',
    subject: {
      received: (code) => `Hem rebut la teva sol·licitud de reserva ${code}`,
      confirmed: (code) => `Reserva ${code} confirmada`,
      reminder: (code) => `Recordatori de la teva reserva ${code}`
    },
    body: {
      received: (s) => `Hola ${s.name}, hem rebut la teva sol·licitud de taula per a ${s.party} el ${s.date} a les ${s.time}. Et trucarem per confirmar-la.`,
      confirmed: (s) => `Hola ${s.name}, la teva taula per a ${s.party} el ${s.date} a les ${s.time} està confirmada.`,
      reminder: (s) => `Hola ${s.name}, et recordem la teva taula per a ${s.party} el ${s.date} a les ${s.time}.`
    }
  },
  es: {
    locale: 'es-ES',
    party: (n) => n === 1 ? '1 persona' : `${n} personas`,
    codeLabel: 'Código de reserva',
    subject: {
      received: (code) => `Hemos recibido tu solicitud de reserva ${code}`,
      confirmed: (code) => `Reserva ${code} confirmada`,
      reminder: (code) => `Recordatorio de tu reserva ${code}`
    },
    body: {
      received: (s) => `Hola ${s.name}, hemos recibido tu solicitud de mesa para ${s.party} el ${s.date} a las ${s.time}. Te llamaremos para confirmarla.`,
      confirmed: (s) => `Hola ${s.name}, tu mesa para ${s.party} el ${s.date} a las ${s.time} está confirmada.`,
      reminder: (s) => `Hola ${s.name}, te recordamos tu mesa para ${s.party} el ${s.date} a las ${s.time}.`
    }
  },
  en: {
    locale: 'en-GB',
    party: (n) => n === 1 ? '1 guest' : `${n} guests`,
    codeLabel: 'Booking code',
    subject: {
      received: (code) => `We’ve received your booking request ${code}`,
      confirmed: (code) => `Booking ${code} confirmed`,
      reminder: (code) => `Reminder of your booking ${code}`
    },
    body: {
      received: (s) => `Hi ${s.name}, we’ve received your request for a table for ${s.party} on ${s.date} at ${s.time}. We’ll call you to confirm it.`,
      confirmed: (s) => `Hi ${s.name}, your table for ${s.party} on ${s.date} at ${s.time} is confirmed.`,
      reminder: (s) => `Hi ${s.name}, a reminder of your table for ${s.party} on ${s.date} at ${s.time}.`
    }
  }
}

/** El idioma de la reserva; si lo guardado no es ninguno de los de la web, el de la casa. */
const wordingFor = (locale: string): Wording => WORDING[locale as Lang] ?? WORDING.ca

/** «miércoles, 14 de octubre»: el día como se dice, no como se guarda (2026-10-14). */
function readableDate (date: string, locale: string): string {
  const day = new Date(`${date}T12:00:00Z`)
  if (Number.isNaN(day.getTime())) return date
  return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(day)
}

function summarize (r: Reservation, wording: Wording): Summary {
  return {
    name: safe(r.guest_name),
    code: safe(r.code),
    party: safe(wording.party(r.people)),
    date: safe(readableDate(r.res_date, wording.locale)),
    // La base de datos guarda la hora con segundos (21:00:00)
    time: safe(r.res_time.slice(0, 5))
  }
}

function guestEmail (kind: Kind, r: Reservation, to: string): Email {
  const wording = wordingFor(r.locale)
  const summary = summarize(r, wording)
  return {
    to,
    subject: wording.subject[kind](r.code),
    html: `<p>${wording.body[kind](summary)}</p><p>${wording.codeLabel}: ${summary.code}</p><p>Casa Güell</p>`
  }
}

/** Lo que la sala necesita para llamar y confirmar. Va en castellano, como el panel. */
function staffNotice (r: Reservation, to: string): Email {
  const summary = summarize(r, WORDING.es)
  const next = r.status === 'pending' ? 'Está pendiente: confírmala en el panel.' : 'Consta ya como confirmada.'
  return {
    to,
    subject: `Nueva solicitud de reserva ${r.code}`,
    html: `<p>${summary.name}, ${summary.party}, el ${summary.date} a las ${summary.time}.</p>` +
      `<p>Teléfono: ${safe(r.phone)}<br>Correo: ${r.email ? safe(r.email) : 'no ha dejado'}<br>Notas: ${r.notes ? safe(r.notes) : 'ninguna'}</p>` +
      `<p>${next}</p>`
  }
}

export function createHandler ({ secret, store, sendEmail, notifyTo, now = () => new Date() }: HandlerOptions): (req: Request) => Promise<Response> {
  // Del aviso de la base de datos solo se usa el identificador: los datos se leen de la tabla, para que el
  // correo no pueda llevar nada que no esté de verdad en una reserva.
  const load = async (record: unknown): Promise<Reservation | Response> => {
    const id = isObject(record) ? record.id : undefined
    if (typeof id !== 'string' && typeof id !== 'number') return new Response('invalid record', { status: 400 })
    return await store.findById(id) ?? new Response('not found', { status: 404 })
  }

  // Salen todos los que puedan salir: que falle el del cliente no deja a la sala sin su aviso. Si alguno
  // falla, la función lo dice (y queda en el registro) en vez de dar por bueno lo que no ha llegado.
  const sendAll = async (emails: Email[]): Promise<void> => {
    const outcomes = await Promise.allSettled(emails.map(sendEmail))
    const failures = outcomes.filter((outcome) => outcome.status === 'rejected').map((outcome) => String(outcome.reason))
    if (failures.length > 0) throw new Error(`${failures.length} de ${emails.length} correos sin enviar: ${failures.join(' | ')}`)
  }

  // Una reserva nueva: acuse al cliente si queda pendiente, confirmación si ya nace confirmada (la apunta
  // la propia sala), y aviso a la sala. En cualquier otro estado no hay nada que decir.
  const created = async (record: unknown): Promise<Response> => {
    const reservation = await load(record)
    if (reservation instanceof Response) return reservation
    if (reservation.status !== 'pending' && reservation.status !== 'confirmed') return new Response('ok')
    const emails: Email[] = []
    if (reservation.email) emails.push(guestEmail(reservation.status === 'pending' ? 'received' : 'confirmed', reservation, reservation.email))
    if (notifyTo) emails.push(staffNotice(reservation, notifyTo))
    await sendAll(emails)
    return new Response('ok')
  }

  // La sala ha cambiado el estado: solo se escribe al cliente si ha quedado confirmada. Se mira el estado
  // que tiene ahora en la tabla, no el que diga el aviso.
  const changed = async (record: unknown): Promise<Response> => {
    const reservation = await load(record)
    if (reservation instanceof Response) return reservation
    if (reservation.status === 'confirmed' && reservation.email) await sendAll([guestEmail('confirmed', reservation, reservation.email)])
    return new Response('ok')
  }

  // Recordatorio 24 h antes (lo llama pg_cron). Una reserva solo queda anotada como recordada si su correo
  // ha salido; si falla, se vuelve a intentar en la siguiente pasada y las demás siguen su curso.
  const remind = async (): Promise<Response> => {
    const current = now().getTime()
    const today = restaurantDate(current)
    const tomorrow = restaurantDate(current + DAY_MS)
    let sent = 0
    let failed = 0
    for (const reservation of await store.awaitingReminder(today, tomorrow)) {
      const hoursLeft = (restaurantTime(reservation.res_date, reservation.res_time).getTime() - current) / HOUR_MS
      if (!(hoursLeft > 0 && hoursLeft <= 24) || !reservation.email) continue
      try {
        await sendEmail(guestEmail('reminder', reservation, reservation.email))
        await store.markReminded(reservation.id, now().toISOString())
        sent++
      } catch (error) {
        failed++
        console.error(`reservation-emails: recordatorio de la reserva ${reservation.id} sin enviar o sin anotar:`, error)
      }
    }
    return Response.json({ sent, failed }, { status: failed > 0 ? 500 : 200 })
  }

  return async (req) => {
    if (!sameSecret(req.headers.get(SECRET_HEADER), secret)) return new Response('unauthorized', { status: 401 })

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return new Response('invalid json', { status: 400 })
    }
    if (!isObject(body)) return new Response('invalid body', { status: 400 })

    try {
      if (body.type === 'INSERT' && body.table === 'reservations') return await created(body.record)
      if (body.type === 'UPDATE' && body.table === 'reservations') return await changed(body.record)
      if (body.type === 'reminders') return await remind()
      return new Response('unknown', { status: 400 })
    } catch (error) {
      console.error('reservation-emails:', error)
      return new Response('error', { status: 500 })
    }
  }
}
