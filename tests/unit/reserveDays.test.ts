import { describe, expect, it } from 'vitest'
import { isDateInput, shiftDate } from '@/lib/dates'
import {
  dayLabels,
  hasRoom,
  isDinnerTime,
  lastBookingDate,
  monthsLabel,
  nextDays,
  reserveErrorKey,
  shortTime,
  splitSlots,
  type Slot
} from '@/lib/reserveDays'

// Octubre de 2026: el 12 es lunes, el 13 martes y el 14 miércoles.
const TUESDAY = '2026-10-13'

const slot = (time: string, remaining = 10): Slot => ({ slot: time, remaining })

describe('nextDays', () => {
  it('da los días seguidos a partir de hoy, con hoy incluido', () => {
    expect(nextDays(TUESDAY, 4).map((day) => day.date)).toEqual(['2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16'])
  })

  it('marca como cerrados los lunes y los martes', () => {
    const closed = nextDays('2026-10-12', 8).filter((day) => day.closed).map((day) => day.date)

    expect(closed).toEqual(['2026-10-12', '2026-10-13', '2026-10-19'])
  })

  it('cruza el fin de mes', () => {
    expect(nextDays('2026-10-30', 4).map((day) => day.date)).toEqual(['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'])
  })
})

describe('lastBookingDate', () => {
  it('es noventa días después de hoy, que es hasta donde acepta el servidor', () => {
    expect(lastBookingDate('2026-10-13')).toBe('2027-01-11')
  })
})

describe('splitSlots', () => {
  it('separa las horas de la comida de las de la cena', () => {
    const { lunch, dinner } = splitSlots([slot('13:00:00'), slot('15:30:00'), slot('20:00:00'), slot('22:30:00')])

    expect(lunch.map((s) => s.slot)).toEqual(['13:00:00', '15:30:00'])
    expect(dinner.map((s) => s.slot)).toEqual(['20:00:00', '22:30:00'])
  })
})

describe('isDinnerTime', () => {
  it('cuenta como cena lo que empieza a partir de las cinco de la tarde', () => {
    expect(isDinnerTime('16:59:00')).toBe(false)
    expect(isDinnerTime('17:00:00')).toBe(true)
  })
})

describe('hasRoom', () => {
  it('hay sitio cuando quedan tantas plazas como comensales', () => {
    expect(hasRoom(slot('21:00:00', 4), 4)).toBe(true)
  })

  it('no lo hay cuando quedan menos', () => {
    expect(hasRoom(slot('21:00:00', 3), 4)).toBe(false)
  })
})

describe('shortTime', () => {
  it('quita los segundos', () => {
    expect(shortTime('21:00:00')).toBe('21:00')
  })
})

describe('reserveErrorKey', () => {
  it('reconoce los motivos que devuelve la base de datos', () => {
    expect(reserveErrorKey('NO_AVAILABILITY')).toBe('errNoAvailability')
    expect(reserveErrorKey('ERROR: CLOSED_DAY')).toBe('errClosedDay')
    expect(reserveErrorKey('DATE_OUT_OF_RANGE (max 90)')).toBe('errDateRange')
  })

  it('quien llega al tope de reservas por la web recibe su propio aviso, no el general', () => {
    expect(reserveErrorKey('TOO_MANY_RESERVATIONS')).toBe('errTooMany')
  })

  it('quien ya tiene mesa ese día recibe su propio aviso, no el general', () => {
    expect(reserveErrorKey('DUPLICATE_RESERVATION')).toBe('errDuplicate')
  })

  it('un día cerrado a mano desde el panel se explica igual que uno de cierre semanal', () => {
    expect(reserveErrorKey('BLOCKED_DAY')).toBe('errClosedDay')
  })

  it('da el aviso general para cualquier otro fallo', () => {
    expect(reserveErrorKey('Failed to fetch')).toBe('errGeneric')
    expect(reserveErrorKey(null)).toBe('errGeneric')
  })
})

describe('dayLabels', () => {
  it('da el día de la semana abreviado, el número y la fecha entera para leerla en voz alta', () => {
    expect(dayLabels('2026-10-16', 'es')).toEqual({ weekday: 'vie', day: '16', short: 'vie, 16 oct', full: 'viernes, 16 de octubre' })
  })

  it('quita los puntos de las abreviaturas, que en una línea de tique estorban', () => {
    expect(dayLabels('2026-10-16', 'ca')).toMatchObject({ weekday: 'dv', short: 'dv, 16 d’oct' })
  })

  it('escribe en el idioma de la página', () => {
    expect(dayLabels('2026-10-16', 'en').full).toBe('Friday 16 October')
    expect(dayLabels('2026-10-16', 'ca').full).toBe('divendres, 16 d’octubre')
  })
})

describe('monthsLabel', () => {
  it('nombra el mes cuando todos los días caen en el mismo', () => {
    expect(monthsLabel(nextDays('2026-10-13', 14), 'es')).toBe('octubre')
  })

  it('nombra los dos cuando los días cruzan de un mes a otro', () => {
    expect(monthsLabel(nextDays('2026-10-25', 14), 'es')).toBe('octubre y noviembre')
  })
})

describe('shiftDate e isDateInput, compartidos con el panel', () => {
  it('desplazan y validan fechas con el formato de los campos de fecha', () => {
    expect(shiftDate('2026-10-31', 1)).toBe('2026-11-01')
    expect(isDateInput('2026-02-30')).toBe(false)
  })
})
