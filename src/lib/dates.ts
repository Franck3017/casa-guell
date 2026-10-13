// Fechas como las escriben los campos de fecha y la base de datos: AAAA-MM-DD, sin hora ni zona.
import { toDateInput } from '@/lib/reserveSchedule'

/** Mediodía de ese día en la hora del equipo: lejos de la medianoche, el cambio de hora no lo mueve de día. */
export function atNoon (date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}

/** Hoy, según el reloj del equipo (y no en UTC, que entre las 00:00 y las 02:00 de aquí todavía es ayer). */
export const todayInput = (): string => toDateInput(new Date())

/** ¿Es una fecha escrita como AAAA-MM-DD y que existe en el calendario? */
export function isDateInput (value: string | null): value is string {
  if (value == null || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  return toDateInput(atNoon(value)) === value
}

/** Esa fecha desplazada un número de días, hacia delante o hacia atrás. */
export function shiftDate (date: string, days: number): string {
  const shifted = atNoon(date)
  shifted.setDate(shifted.getDate() + days)
  return toDateInput(shifted)
}
