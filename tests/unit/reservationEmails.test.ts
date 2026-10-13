import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  createHandler,
  createResendSender,
  DEFAULT_FROM,
  escapeHtml,
  restaurantTime,
  SECRET_HEADER,
  type Email,
  type Reservation,
  type ReservationStore
} from '../../supabase/functions/reservation-emails/handler'

const SECRET = 'secreto-de-prueba'

// La función corre en UTC, y estas pruebas también, tenga el equipo la zona que tenga. Con la hora de
// Barcelona en el equipo, leer la reserva en hora local daría el resultado correcto por casualidad.
const machineZone = Intl.DateTimeFormat().resolvedOptions().timeZone
beforeAll(() => { process.env.TZ = 'UTC' })
afterAll(() => { process.env.TZ = machineZone })

/** El miércoles 14 de octubre de 2026 a las 9:00 en Barcelona: la reserva de las 21:00 queda a 12 horas. */
const NOW = new Date('2026-10-14T07:00:00Z')

const reservation = (changes: Partial<Reservation> = {}): Reservation => ({
  id: 7,
  email: 'ana@example.com',
  guest_name: 'Ana',
  code: 'CG-0007',
  people: 2,
  res_date: '2026-10-14',
  res_time: '21:00:00',
  status: 'pending',
  locale: 'es',
  phone: '600 11 22 33',
  notes: null,
  ...changes
})

/** Una función con sus dependencias de mentira: la base de datos es una lista y el correo, una bandeja. */
function setup (reservations: Reservation[] = [reservation()]) {
  const outbox: Email[] = []
  const reminded: Array<Reservation['id']> = []
  const askedFor: Array<[from: string, to: string]> = []
  const store: ReservationStore = {
    findById: async (id) => reservations.find((r) => r.id === id) ?? null,
    awaitingReminder: async (from, to) => { askedFor.push([from, to]); return reservations },
    markReminded: async (id) => { reminded.push(id) }
  }
  const sendEmail = async (email: Email): Promise<void> => { outbox.push(email) }
  return { outbox, reminded, askedFor, store, sendEmail }
}

const call = (handler: (req: Request) => Promise<Response>, body: unknown, secret: string | null = SECRET): Promise<Response> =>
  handler(new Request('https://funcion.test/reservation-emails', {
    method: 'POST',
    headers: secret == null ? {} : { [SECRET_HEADER]: secret },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  }))

const INSERTED = { type: 'INSERT', table: 'reservations', record: { id: 7 } }
const UPDATED = { type: 'UPDATE', table: 'reservations', record: { id: 7 } }

describe('quién puede llamar a la función', () => {
  it('rechaza una llamada sin el secreto y no envía nada', async () => {
    const { outbox, store, sendEmail } = setup()
    const handler = createHandler({ secret: SECRET, store, sendEmail })

    const response = await call(handler, INSERTED, null)

    expect(response.status).toBe(401)
    expect(outbox).toEqual([])
  })

  it('rechaza una llamada con un secreto que no es el suyo', async () => {
    const { outbox, store, sendEmail } = setup()
    const handler = createHandler({ secret: SECRET, store, sendEmail })

    const response = await call(handler, INSERTED, 'secreto-de-prueba-casi')

    expect(response.status).toBe(401)
    expect(outbox).toEqual([])
  })

  it('lo rechaza todo si la función no tiene un secreto configurado', async () => {
    const { outbox, store, sendEmail } = setup()
    const handler = createHandler({ secret: undefined, store, sendEmail })

    const response = await call(handler, INSERTED, '')

    expect(response.status).toBe(401)
    expect(outbox).toEqual([])
  })
})

describe('lo que se le pide', () => {
  it('responde 400 a un cuerpo que no es JSON', async () => {
    const { store, sendEmail } = setup()

    const response = await call(createHandler({ secret: SECRET, store, sendEmail }), 'esto no es JSON')

    expect(response.status).toBe(400)
  })

  it('responde 400 a un tipo de aviso que no conoce', async () => {
    const { store, sendEmail } = setup()

    const response = await call(createHandler({ secret: SECRET, store, sendEmail }), { type: 'DELETE', table: 'reservations' })

    expect(response.status).toBe(400)
  })

  it('responde 400 a una reserva nueva que llega sin identificador', async () => {
    const { outbox, store, sendEmail } = setup()

    const response = await call(createHandler({ secret: SECRET, store, sendEmail }), { type: 'INSERT', table: 'reservations' })

    expect(response.status).toBe(400)
    expect(outbox).toEqual([])
  })
})

describe('qué correo sale en cada momento', () => {
  it('una solicitud nueva (pendiente) recibe el acuse de recibo, no una confirmación', async () => {
    const { outbox, store, sendEmail } = setup()

    await call(createHandler({ secret: SECRET, store, sendEmail }), INSERTED)

    expect(outbox).toHaveLength(1)
    expect(outbox[0].subject).toBe('Hemos recibido tu solicitud de reserva CG-0007')
    expect(outbox[0].html).toContain('Te llamaremos para confirmarla')
    expect(outbox[0].html).not.toContain('está confirmada')
  })

  it('una reserva que ya nace confirmada recibe la confirmación', async () => {
    const { outbox, store, sendEmail } = setup([reservation({ status: 'confirmed' })])

    await call(createHandler({ secret: SECRET, store, sendEmail }), INSERTED)

    expect(outbox.map((email) => email.subject)).toEqual(['Reserva CG-0007 confirmada'])
  })

  it('cuando la sala la confirma, sale la confirmación', async () => {
    const { outbox, store, sendEmail } = setup([reservation({ status: 'confirmed' })])

    const response = await call(createHandler({ secret: SECRET, store, sendEmail }), UPDATED)

    expect(response.status).toBe(200)
    expect(outbox.map((email) => email.subject)).toEqual(['Reserva CG-0007 confirmada'])
    expect(outbox[0].html).toContain('está confirmada')
  })

  it('un cambio que no la deja confirmada no envía nada', async () => {
    const { outbox, store, sendEmail } = setup([reservation({ status: 'cancelled' })])

    const response = await call(createHandler({ secret: SECRET, store, sendEmail }), UPDATED)

    expect(response.status).toBe(200)
    expect(outbox).toEqual([])
  })

  it('una reserva nueva en otro estado (ya sentada, cancelada) no recibe nada', async () => {
    const { outbox, store, sendEmail } = setup([reservation({ status: 'seated' })])

    await call(createHandler({ secret: SECRET, store, sendEmail }), INSERTED)

    expect(outbox).toEqual([])
  })

  it('escribe la fecha y la hora como se leen, no como se guardan', async () => {
    const { outbox, store, sendEmail } = setup([reservation({ people: 4 })])

    await call(createHandler({ secret: SECRET, store, sendEmail }), INSERTED)

    expect(outbox[0].html).toContain('para 4 personas el miércoles, 14 de octubre a las 21:00.')
    expect(outbox[0].html).not.toContain('2026-10-14')
    expect(outbox[0].html).not.toContain('21:00:00')
  })

  it('escribe en el idioma en que se hizo la reserva', async () => {
    const subjectIn = async (locale: string): Promise<string> => {
      const { outbox, store, sendEmail } = setup([reservation({ locale })])
      await call(createHandler({ secret: SECRET, store, sendEmail }), INSERTED)
      return outbox[0].subject
    }

    expect(await subjectIn('ca')).toBe('Hem rebut la teva sol·licitud de reserva CG-0007')
    expect(await subjectIn('en')).toBe('We’ve received your booking request CG-0007')
  })

  it('si el idioma guardado no es ninguno de los de la web, escribe en catalán', async () => {
    const { outbox, store, sendEmail } = setup([reservation({ locale: 'fr' })])

    await call(createHandler({ secret: SECRET, store, sendEmail }), INSERTED)

    expect(outbox[0].subject).toBe('Hem rebut la teva sol·licitud de reserva CG-0007')
  })

  it('una sola persona va en singular', async () => {
    const { outbox, store, sendEmail } = setup([reservation({ people: 1 })])

    await call(createHandler({ secret: SECRET, store, sendEmail }), INSERTED)

    expect(outbox[0].html).toContain('para 1 persona el')
  })
})

describe('aviso a la sala de una solicitud nueva', () => {
  const NOTIFY = 'sala@example.com'

  it('escribe a la sala con lo que necesita para llamar, además del acuse al cliente', async () => {
    const { outbox, store, sendEmail } = setup([reservation({ notes: 'Una persona celíaca' })])

    await call(createHandler({ secret: SECRET, store, sendEmail, notifyTo: NOTIFY }), INSERTED)

    const notice = outbox.find((email) => email.to === NOTIFY)
    expect(outbox.map((email) => email.to).sort()).toEqual(['ana@example.com', NOTIFY])
    expect(notice?.subject).toBe('Nueva solicitud de reserva CG-0007')
    expect(notice?.html).toContain('600 11 22 33')
    expect(notice?.html).toContain('Una persona celíaca')
  })

  it('avisa a la sala aunque el cliente no haya dejado correo', async () => {
    const { outbox, store, sendEmail } = setup([reservation({ email: null })])

    await call(createHandler({ secret: SECRET, store, sendEmail, notifyTo: NOTIFY }), INSERTED)

    expect(outbox.map((email) => email.to)).toEqual([NOTIFY])
  })

  it('sin dirección configurada no escribe a nadie más que al cliente', async () => {
    const { outbox, store, sendEmail } = setup()

    await call(createHandler({ secret: SECRET, store, sendEmail }), INSERTED)

    expect(outbox.map((email) => email.to)).toEqual(['ana@example.com'])
  })

  it('no avisa cuando la sala confirma: ya lo sabe', async () => {
    const { outbox, store, sendEmail } = setup([reservation({ status: 'confirmed' })])

    await call(createHandler({ secret: SECRET, store, sendEmail, notifyTo: NOTIFY }), UPDATED)

    expect(outbox.map((email) => email.to)).toEqual(['ana@example.com'])
  })

  it('no deja pasar HTML escrito en las notas', async () => {
    const { outbox, store, sendEmail } = setup([reservation({ notes: '<img src=x onerror=alert(1)>' })])

    await call(createHandler({ secret: SECRET, store, sendEmail, notifyTo: NOTIFY }), INSERTED)

    expect(outbox.find((email) => email.to === NOTIFY)?.html).not.toContain('<img')
  })

  it('si el correo al cliente falla, el aviso a la sala sale igualmente y la función lo cuenta como fallo', async () => {
    const { outbox, store } = setup()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const sendEmail = async (email: Email): Promise<void> => {
      if (email.to === 'ana@example.com') throw new Error('Resend ha respondido 422')
      outbox.push(email)
    }

    const response = await call(createHandler({ secret: SECRET, store, sendEmail, notifyTo: NOTIFY }), INSERTED)

    expect(response.status).toBe(500)
    expect(outbox.map((email) => email.to)).toEqual([NOTIFY])
  })
})

describe('correo al cliente por una reserva nueva', () => {
  it('escribe a la dirección que consta en la base de datos, no a la que llega en el aviso', async () => {
    const { outbox, store, sendEmail } = setup()
    const forged = { type: 'INSERT', table: 'reservations', record: { id: 7, email: 'otro@example.com', guest_name: 'Otro' } }

    const response = await call(createHandler({ secret: SECRET, store, sendEmail }), forged)

    expect(response.status).toBe(200)
    expect(outbox.map((email) => email.to)).toEqual(['ana@example.com'])
    expect(outbox[0].html).toContain('Hola Ana,')
  })

  it('no deja pasar HTML escrito en el nombre', async () => {
    const { outbox, store, sendEmail } = setup([reservation({ guest_name: '<a href="https://malo.example">premio</a>' })])

    await call(createHandler({ secret: SECRET, store, sendEmail }), INSERTED)

    expect(outbox[0].html).not.toContain('<a ')
    expect(outbox[0].html).toContain('&lt;a href=&quot;https://malo.example&quot;&gt;premio&lt;/a&gt;')
  })

  it('responde 404 si esa reserva no existe', async () => {
    const { outbox, store, sendEmail } = setup([])

    const response = await call(createHandler({ secret: SECRET, store, sendEmail }), INSERTED)

    expect(response.status).toBe(404)
    expect(outbox).toEqual([])
  })

  it('no envía nada a una reserva sin correo', async () => {
    const { outbox, store, sendEmail } = setup([reservation({ email: null })])

    const response = await call(createHandler({ secret: SECRET, store, sendEmail }), INSERTED)

    expect(response.status).toBe(200)
    expect(outbox).toEqual([])
  })

  it('responde 500 si el correo no se ha podido enviar', async () => {
    const { store } = setup()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const sendEmail = async (): Promise<void> => { throw new Error('Resend ha respondido 422') }

    const response = await call(createHandler({ secret: SECRET, store, sendEmail }), INSERTED)

    expect(response.status).toBe(500)
  })
})

describe('recordatorios', () => {
  const REMINDERS = { type: 'reminders' }

  it('envía el recordatorio y lo deja anotado', async () => {
    const { outbox, reminded, store, sendEmail } = setup()

    const response = await call(createHandler({ secret: SECRET, store, sendEmail, now: () => NOW }), REMINDERS)

    expect(response.status).toBe(200)
    expect(outbox.map((email) => email.to)).toEqual(['ana@example.com'])
    expect(reminded).toEqual([7])
  })

  it('el recordatorio va en el idioma de la reserva, con su día y su hora', async () => {
    const { outbox, store, sendEmail } = setup([reservation({ locale: 'ca' })])

    await call(createHandler({ secret: SECRET, store, sendEmail, now: () => NOW }), REMINDERS)

    expect(outbox[0].subject).toBe('Recordatori de la teva reserva CG-0007')
    expect(outbox[0].html).toContain('dimecres, 14 d’octubre a les 21:00')
  })

  it('no anota como recordada una reserva cuyo correo ha fallado, y sigue con las demás', async () => {
    const { outbox, reminded, store } = setup([
      reservation({ id: 1, email: 'falla@example.com' }),
      reservation({ id: 2, email: 'llega@example.com' })
    ])
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const sendEmail = async (email: Email): Promise<void> => {
      if (email.to === 'falla@example.com') throw new Error('Resend ha respondido 429')
      outbox.push(email)
    }

    const response = await call(createHandler({ secret: SECRET, store, sendEmail, now: () => NOW }), REMINDERS)

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ sent: 1, failed: 1 })
    expect(outbox.map((email) => email.to)).toEqual(['llega@example.com'])
    expect(reminded).toEqual([2])
  })

  it('responde 500 si no ha podido leer las reservas', async () => {
    const { outbox, store, sendEmail } = setup()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    store.awaitingReminder = async () => { throw new Error('reservations: connection refused') }

    const response = await call(createHandler({ secret: SECRET, store, sendEmail, now: () => NOW }), REMINDERS)

    expect(response.status).toBe(500)
    expect(outbox).toEqual([])
  })

  it('no recuerda una reserva para la que falta más de un día', async () => {
    const { outbox, reminded, store, sendEmail } = setup([reservation({ res_date: '2026-10-16' })])

    await call(createHandler({ secret: SECRET, store, sendEmail, now: () => NOW }), REMINDERS)

    expect(outbox).toEqual([])
    expect(reminded).toEqual([])
  })
})

describe('recordatorios: la fecha y la hora de la reserva son las del reloj de Barcelona', () => {
  const REMINDERS = { type: 'reminders' }

  /** ¿Sale el recordatorio de esa reserva si la función se ejecuta en ese instante? */
  const remindedAt = async (instant: string, changes: Partial<Reservation>): Promise<boolean> => {
    const { outbox, store, sendEmail } = setup([reservation(changes)])
    await call(createHandler({ secret: SECRET, store, sendEmail, now: () => new Date(instant) }), REMINDERS)
    return outbox.length === 1
  }

  // En julio Barcelona va dos horas por delante de UTC: las 21:00 de allí son las 19:00 UTC.
  const SUMMER = { res_date: '2026-07-14', res_time: '21:00:00' }
  // En diciembre, una: las 21:00 de allí son las 20:00 UTC.
  const WINTER = { res_date: '2026-12-10', res_time: '21:00:00' }
  // El 25 de octubre de 2026 se atrasa el reloj: ese día las 13:30 son las 12:30 UTC, y el día dura 25 horas.
  const CLOCKS_GO_BACK = { res_date: '2026-10-25', res_time: '13:30:00' }

  it('en verano sale cuando faltan 24 horas, no dos horas más tarde', async () => {
    expect(await remindedAt('2026-07-13T18:59:00Z', SUMMER)).toBe(false)
    expect(await remindedAt('2026-07-13T19:01:00Z', SUMMER)).toBe(true)
  })

  it('en invierno sale cuando faltan 24 horas, no una hora más tarde', async () => {
    expect(await remindedAt('2026-12-09T19:59:00Z', WINTER)).toBe(false)
    expect(await remindedAt('2026-12-09T20:01:00Z', WINTER)).toBe(true)
  })

  it('no sale cuando la hora de la reserva ya ha pasado', async () => {
    expect(await remindedAt('2026-07-14T19:30:00Z', SUMMER)).toBe(false)
  })

  it('cuenta 24 horas de verdad el día que se cambia la hora', async () => {
    expect(await remindedAt('2026-10-24T12:29:00Z', CLOCKS_GO_BACK)).toBe(false)
    expect(await remindedAt('2026-10-24T12:31:00Z', CLOCKS_GO_BACK)).toBe(true)
  })

  it('pide las reservas de hoy y de mañana según el calendario de Barcelona', async () => {
    const { askedFor, store, sendEmail } = setup([])
    // Las 00:30 del 14 de julio en Barcelona, cuando en UTC todavía es día 13
    const now = (): Date => new Date('2026-07-13T22:30:00Z')

    await call(createHandler({ secret: SECRET, store, sendEmail, now }), REMINDERS)

    expect(askedFor).toEqual([['2026-07-14', '2026-07-15']])
  })

  it('una reserva con la hora ilegible no impide recordar las demás', async () => {
    const { outbox, store, sendEmail } = setup([
      reservation({ id: 1, res_time: 'por la noche' }),
      reservation({ id: 2, email: 'llega@example.com' })
    ])

    const response = await call(createHandler({ secret: SECRET, store, sendEmail, now: () => NOW }), REMINDERS)

    expect(response.status).toBe(200)
    expect(outbox.map((email) => email.to)).toEqual(['llega@example.com'])
  })
})

describe('restaurantTime', () => {
  it('en horario de verano resta dos horas para llegar a UTC', () => {
    expect(restaurantTime('2026-07-14', '21:00:00').toISOString()).toBe('2026-07-14T19:00:00.000Z')
  })

  it('en horario de invierno resta una', () => {
    expect(restaurantTime('2026-12-10', '21:00:00').toISOString()).toBe('2026-12-10T20:00:00.000Z')
  })

  it('entiende la hora sin segundos', () => {
    expect(restaurantTime('2026-07-14', '13:30').toISOString()).toBe('2026-07-14T11:30:00.000Z')
  })

  it('acierta a los dos lados del cambio de hora de otoño', () => {
    // La madrugada del 25 de octubre de 2026 las 3:00 pasan a ser las 2:00
    expect(restaurantTime('2026-10-25', '01:30:00').toISOString()).toBe('2026-10-24T23:30:00.000Z')
    expect(restaurantTime('2026-10-25', '03:30:00').toISOString()).toBe('2026-10-25T02:30:00.000Z')
  })

  it('acierta a los dos lados del cambio de hora de primavera', () => {
    // La madrugada del 29 de marzo de 2026 las 2:00 pasan a ser las 3:00
    expect(restaurantTime('2026-03-29', '01:30:00').toISOString()).toBe('2026-03-29T00:30:00.000Z')
    expect(restaurantTime('2026-03-29', '13:00:00').toISOString()).toBe('2026-03-29T11:00:00.000Z')
  })

  it('devuelve una fecha inválida si no puede leer la hora', () => {
    expect(Number.isNaN(restaurantTime('2026-07-14', 'por la noche').getTime())).toBe(true)
  })
})

describe('createResendSender', () => {
  const EMAIL: Email = { to: 'ana@example.com', subject: 'Reserva CG-0007 confirmada', html: '<p>Hola</p>' }

  it('falla cuando Resend rechaza el correo', async () => {
    const rejected: typeof fetch = async () => new Response('{"message":"The domain is not verified"}', { status: 403 })

    await expect(createResendSender({ apiKey: 'clave', fetchImpl: rejected })(EMAIL)).rejects.toThrow('403')
  })

  it('falla sin llamar a Resend si no hay clave', async () => {
    const neverCalled = vi.fn<typeof fetch>()

    await expect(createResendSender({ apiKey: '', fetchImpl: neverCalled })(EMAIL)).rejects.toThrow('RESEND_API_KEY')
    expect(neverCalled).not.toHaveBeenCalled()
  })

  it('entrega a Resend el destinatario, el asunto y el contenido', async () => {
    const accepted = vi.fn<typeof fetch>(async () => new Response('{"id":"1"}', { status: 200 }))

    await createResendSender({ apiKey: 'clave', fetchImpl: accepted })(EMAIL)

    const [, init] = accepted.mock.calls[0]
    expect(JSON.parse(String(init?.body))).toMatchObject(EMAIL)
  })

  describe('quién firma el correo', () => {
    /** El remitente con el que llega a Resend un correo enviado con esa configuración. */
    const signedBy = async (from?: string): Promise<unknown> => {
      const accepted = vi.fn<typeof fetch>(async () => new Response('{"id":"1"}', { status: 200 }))
      await createResendSender({ apiKey: 'clave', from, fetchImpl: accepted })(EMAIL)
      return JSON.parse(String(accepted.mock.calls[0][1]?.body)).from
    }

    it('la dirección de la casa, si no se configura otra', async () => {
      expect(await signedBy()).toBe(DEFAULT_FROM)
      expect(DEFAULT_FROM).toBe('Casa Güell <reserves@casaguellbcn.com>')
    })

    it('el remitente que se configure, tal cual', async () => {
      expect(await signedBy('Casa Güell <reservas@otro-dominio.example>')).toBe('Casa Güell <reservas@otro-dominio.example>')
    })

    it('sin los espacios que se cuelen al pegarlo', async () => {
      expect(await signedBy('  reservas@otro-dominio.example \n')).toBe('reservas@otro-dominio.example')
    })

    it('un remitente en blanco no vale: firma la casa', async () => {
      expect(await signedBy('')).toBe(DEFAULT_FROM)
      expect(await signedBy('   ')).toBe(DEFAULT_FROM)
    })
  })
})

describe('escapeHtml', () => {
  it('convierte en texto los caracteres con significado en HTML', () => {
    expect(escapeHtml('<b>"Tom & Jerry\'s"</b>')).toBe('&lt;b&gt;&quot;Tom &amp; Jerry&#39;s&quot;&lt;/b&gt;')
  })
})
