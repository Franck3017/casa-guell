// Fechas del panel. Siempre viajan como AAAA-MM-DD, el formato de los campos de fecha y de la base de datos.
import { atNoon } from '@/lib/dates'

export { isDateInput, shiftDate, todayInput as today } from '@/lib/dates'

/** «miércoles, 14 de octubre», con el año detrás si se pide. El panel está solo en castellano. */
export function longDate (date: string, { year = false }: { year?: boolean } = {}): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: year ? 'numeric' : undefined
  }).format(atNoon(date))
}
