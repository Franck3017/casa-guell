import { describe, expect, it } from 'vitest'
import { data } from '@/data'
import { isClosedDay, toDateInput } from '@/lib/reserveSchedule'

// Octubre de 2026: el 12 es lunes, el 13 martes, el 14 miércoles, el 17 sábado y el 18 domingo.
const MONDAY = '2026-10-12'
const TUESDAY = '2026-10-13'
const WEDNESDAY = '2026-10-14'
const SATURDAY = '2026-10-17'
const SUNDAY = '2026-10-18'

describe('isClosedDay', () => {
  it('da por cerrados el lunes y el martes', () => {
    expect(isClosedDay(MONDAY)).toBe(true)
    expect(isClosedDay(TUESDAY)).toBe(true)
  })

  it('da por abiertos de miércoles a domingo', () => {
    expect(isClosedDay(WEDNESDAY)).toBe(false)
    expect(isClosedDay(SATURDAY)).toBe(false)
    expect(isClosedDay(SUNDAY)).toBe(false)
  })

  it('no da por cerrada una fecha que todavía no está completa', () => {
    expect(isClosedDay('')).toBe(false)
    expect(isClosedDay('2026-10')).toBe(false)
  })
})

describe('toDateInput', () => {
  it('escribe la fecha local con mes y día de dos cifras', () => {
    expect(toDateInput(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
  })
})

describe('días de cierre frente al horario publicado (casaGuell.json)', () => {
  it('el lunes figura como cerrado también en el horario publicado', () => {
    expect(data.ubicacion.horario.ll).toBeNull()
  })
})
