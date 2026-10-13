// Lo que el diálogo de reserva necesita saber sin pintar nada: qué días ofrece, cómo reparte las horas
// libres que devuelve la base de datos y cómo se leen sus errores. Código puro, con pruebas en
// tests/unit/reserveDays.test.ts.
import type { Locale } from '@/i18n'
import { atNoon, shiftDate } from '@/lib/dates'
import { INTL_LOCALE } from '@/lib/menuFormat'
import { isClosedDay } from '@/lib/reserveSchedule'

/** Una hora que devuelve `available_slots`: «21:00:00» y las plazas que le quedan. */
export interface Slot {
  slot: string
  remaining: number
}

export interface BookingDay {
  date: string
  /** Lunes y martes el restaurante cierra: el día se enseña, pero no se puede elegir. */
  closed: boolean
}

/** Días que se enseñan a un toque, dos semanas justas; los demás se eligen en el calendario. */
export const QUICK_DAYS = 14

/** Hasta cuántos días vista acepta reservas el servidor (`create_reservation`). */
const BOOKING_WINDOW_DAYS = 90

/** `count` días seguidos a partir de `from`, este incluido. */
export function nextDays (from: string, count: number): BookingDay[] {
  return Array.from({ length: count }, (_, offset) => {
    const date = shiftDate(from, offset)
    return { date, closed: isClosedDay(date) }
  })
}

export const lastBookingDate = (from: string): string => shiftDate(from, BOOKING_WINDOW_DAYS)

/** La base de datos devuelve la hora con segundos («21:00:00»); en pantalla sobran. */
export const shortTime = (time: string): string => time.slice(0, 5)

/** La cocina cierra entre la comida y la cena: lo que empieza a partir de las cinco es cena. */
export const isDinnerTime = (time: string): boolean => shortTime(time) >= '17:00'

export function splitSlots (slots: Slot[]): { lunch: Slot[], dinner: Slot[] } {
  return {
    lunch: slots.filter((s) => !isDinnerTime(s.slot)),
    dinner: slots.filter((s) => isDinnerTime(s.slot))
  }
}

export const hasRoom = (slot: Slot, people: number): boolean => slot.remaining >= people

export type ReserveErrorKey = 'errNoAvailability' | 'errClosedDay' | 'errDateRange' | 'errTooMany' | 'errGeneric'

/** El texto con el que explicar por qué no se ha podido reservar, según el motivo que da la base de datos. */
export function reserveErrorKey (message: string | null | undefined): ReserveErrorKey {
  if (message?.includes('NO_AVAILABILITY')) return 'errNoAvailability'
  // CLOSED_DAY es el cierre semanal; BLOCKED_DAY, un día que la sala ha cerrado a mano desde el panel
  if (message?.includes('CLOSED_DAY') || message?.includes('BLOCKED_DAY')) return 'errClosedDay'
  if (message?.includes('DATE_OUT_OF_RANGE')) return 'errDateRange'
  // El tope contra reservas falsas: demasiadas con el mismo teléfono o desde la misma conexión
  if (message?.includes('TOO_MANY_RESERVATIONS')) return 'errTooMany'
  return 'errGeneric'
}

/**
 * Cómo se escribe un día: en la rejilla («vie», «16»), en una línea del tique («vie, 16 oct») y entero,
 * para leerlo en voz alta («viernes, 16 de octubre»).
 */
export function dayLabels (date: string, locale: Locale): { weekday: string, day: string, short: string, full: string } {
  const at = atNoon(date)
  const format = (options: Intl.DateTimeFormatOptions): string => new Intl.DateTimeFormat(INTL_LOCALE[locale], options).format(at)
  // Algunos idiomas abrevian con punto («dv.», «d’oct.»): en un sitio tan estrecho estorba
  const noDots = (text: string): string => text.replaceAll('.', '')
  return {
    weekday: noDots(format({ weekday: 'short' })),
    day: format({ day: 'numeric' }),
    short: noDots(format({ weekday: 'short', day: 'numeric', month: 'short' })),
    full: format({ weekday: 'long', day: 'numeric', month: 'long' })
  }
}

/** El mes de los días que se enseñan, o los dos si cruzan de uno a otro («octubre y noviembre»). */
export function monthsLabel (days: BookingDay[], locale: Locale): string {
  const month = new Intl.DateTimeFormat(INTL_LOCALE[locale], { month: 'long' })
  const names = [...new Set(days.map((day) => month.format(atNoon(day.date))))]
  return new Intl.ListFormat(INTL_LOCALE[locale], { type: 'conjunction' }).format(names)
}
