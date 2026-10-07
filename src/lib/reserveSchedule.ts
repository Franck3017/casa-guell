/** Horario de reservas (alineado con `ubicacion.horario` de casaGuell.json). */

const LUNCH = ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30']
const DINNER = ['20:00', '20:30', '21:00', '21:30', '22:00', '22:30']

/** Todas las franjas posibles, para cuando aún no hay fecha elegida. */
export const ALL_SLOTS = [...LUNCH, ...DINNER]

/** Margen mínimo (min) entre ahora y la franja elegida el mismo día. */
const SAME_DAY_LEAD_MIN = 30

/** 'YYYY-MM-DD' → Date a mediodía local (evita saltos de día por zona horaria). */
function parseLocal (dateStr: string): Date | null {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m == null) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12)
}

export function toDateInput (d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

/** Lunes y martes cerrado. */
export function isClosedDay (dateStr: string): boolean {
  const d = parseLocal(dateStr)
  if (d == null) return false
  const day = d.getDay()
  return day === 1 || day === 2
}

/**
 * Franjas reservables para una fecha: domingo solo comida (cierra a las 18:00),
 * y el mismo día se descartan las que ya han pasado o quedan a menos de 30 min.
 */
export function slotsFor (dateStr: string, now: Date): string[] {
  const d = parseLocal(dateStr)
  if (d == null) return ALL_SLOTS
  if (isClosedDay(dateStr)) return []

  const base = d.getDay() === 0 ? LUNCH : ALL_SLOTS
  if (dateStr !== toDateInput(now)) return base

  const limit = now.getHours() * 60 + now.getMinutes() + SAME_DAY_LEAD_MIN
  return base.filter((s) => {
    const [h, min] = s.split(':').map(Number)
    return h * 60 + min > limit
  })
}
