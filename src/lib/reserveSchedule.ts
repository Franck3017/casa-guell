/**
 * Días de cierre de la casa (alineado con `ubicacion.horario` de casaGuell.json) y fechas como las
 * escriben los campos de fecha. Las horas a las que se da mesa no están aquí: las da la base de datos.
 */

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
