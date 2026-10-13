// Lo que el panel sabe de una reserva sin pintar nada: sus estados, cómo se agrupa el día y cómo se
// escriben la hora y los comensales. Código puro, con sus pruebas en tests/unit/admin.test.ts.
import { isDinnerTime, shortTime } from '@/lib/reserveDays'

export { shortTime }

export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show'

export interface Reservation {
  id: string
  code: string
  guest_name: string
  phone: string
  email: string | null
  res_date: string
  res_time: string
  people: number
  status: ReservationStatus
  notes: string | null
}

/** Los estados en el orden en que avanza una reserva; al final, las dos formas de no llegar a sentarse. */
export const STATUSES: ReservationStatus[] = ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show']

export const STATUS_LABEL: Record<ReservationStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  seated: 'Sentada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No se presentó'
}

const NEXT_STEP: Partial<Record<ReservationStatus, { to: ReservationStatus, label: string }>> = {
  pending: { to: 'confirmed', label: 'Confirmar' },
  confirmed: { to: 'seated', label: 'Sentar' },
  seated: { to: 'completed', label: 'Completar' }
}

/** El paso habitual desde un estado: es el botón que se ofrece a mano en cada reserva. */
export const nextStep = (status: ReservationStatus): { to: ReservationStatus, label: string } | undefined => NEXT_STEP[status]

/** Una reserva cancelada o a la que no vino nadie no ocupa mesa: no cuenta en los totales del día. */
const takesTable = (reservation: Reservation): boolean => reservation.status !== 'cancelled' && reservation.status !== 'no_show'

export const peopleLabel = (people: number): string => `${people} ${people === 1 ? 'persona' : 'personas'}`

export interface DaySummary {
  bookings: number
  guests: number
}

export function daySummary (reservations: Reservation[]): DaySummary {
  const active = reservations.filter(takesTable)
  return { bookings: active.length, guests: active.reduce((sum, reservation) => sum + reservation.people, 0) }
}

export interface ServiceGroup {
  label: string
  reservations: Reservation[]
  summary: DaySummary
}

/** Las reservas del día repartidas en comida y cena, en ese orden y sin los servicios vacíos. */
export function groupByService (reservations: Reservation[]): ServiceGroup[] {
  const lunch = reservations.filter((reservation) => !isDinnerTime(reservation.res_time))
  const dinner = reservations.filter((reservation) => isDinnerTime(reservation.res_time))
  return [{ label: 'Comida', reservations: lunch }, { label: 'Cena', reservations: dinner }]
    .filter((group) => group.reservations.length > 0)
    .map((group) => ({ ...group, summary: daySummary(group.reservations) }))
}

/**
 * Qué decirle a quien no consigue entrar. El servidor contesta en inglés («Invalid login credentials»),
 * y eso no ayuda a nadie en la sala: se traduce a lo que ha pasado y a qué hacer.
 */
export function signInErrorMessage (error: { code?: string, status?: number, message: string }): string {
  if (error.code === 'invalid_credentials') return 'El correo o la contraseña no son correctos. Revísalos y vuelve a intentarlo.'
  if (error.status === 0 || /fetch|network/i.test(error.message)) return 'No hemos podido conectar. Comprueba la conexión y vuelve a intentarlo.'
  return 'No hemos podido iniciar la sesión. Vuelve a intentarlo en unos minutos.'
}
