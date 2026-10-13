import { describe, expect, it } from 'vitest'
import { data } from '@/data'
import { ALL_SLOTS, isClosedDay, slotsFor, toDateInput } from '@/lib/reserveSchedule'

// Octubre de 2026: el 12 es lunes, el 13 martes, el 14 miércoles, el 17 sábado y el 18 domingo.
const MONDAY = '2026-10-12'
const TUESDAY = '2026-10-13'
const WEDNESDAY = '2026-10-14'
const SATURDAY = '2026-10-17'
const SUNDAY = '2026-10-18'

/** Un momento del miércoles 14 de octubre de 2026, hora local. */
const wednesdayAt = (hours: number, minutes: number): Date => new Date(2026, 9, 14, hours, minutes)

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

describe('slotsFor', () => {
  const anotherDay = new Date(2026, 9, 1, 12, 0)

  it('no ofrece ninguna hora en un día de cierre', () => {
    expect(slotsFor(MONDAY, anotherDay)).toEqual([])
  })

  it('ofrece comida y cena un día abierto que no es hoy', () => {
    expect(slotsFor(SATURDAY, anotherDay)).toEqual(ALL_SLOTS)
  })

  it('el domingo solo ofrece la comida', () => {
    expect(slotsFor(SUNDAY, anotherDay)).toEqual(['13:00', '13:30', '14:00', '14:30', '15:00', '15:30'])
  })

  it('sin fecha completa ofrece todas las horas', () => {
    expect(slotsFor('', anotherDay)).toEqual(ALL_SLOTS)
  })

  it('el mismo día quita las horas que ya han pasado', () => {
    const slots = slotsFor(WEDNESDAY, wednesdayAt(16, 0))

    expect(slots).toEqual(['20:00', '20:30', '21:00', '21:30', '22:00', '22:30'])
  })

  it('el mismo día quita las horas a las que faltan menos de 30 minutos', () => {
    const slots = slotsFor(WEDNESDAY, wednesdayAt(13, 10))

    expect(slots).not.toContain('13:30')
    expect(slots[0]).toBe('14:00')
  })

  it('el mismo día mantiene la hora a la que faltan justo 30 minutos', () => {
    const slots = slotsFor(WEDNESDAY, wednesdayAt(13, 0))

    expect(slots[0]).toBe('13:30')
  })

  it('el mismo día, pasada la última hora, no ofrece ninguna', () => {
    expect(slotsFor(WEDNESDAY, wednesdayAt(22, 45))).toEqual([])
  })
})

describe('toDateInput', () => {
  it('escribe la fecha local con mes y día de dos cifras', () => {
    expect(toDateInput(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
  })
})

describe('horas de reserva frente al horario publicado (casaGuell.json)', () => {
  const closingTime = (range: string): string => range.split('—')[1].trim()
  const openingTime = (range: string): string => range.split('—')[0].trim()

  it('ninguna hora del domingo queda fuera del horario del domingo', () => {
    const sunday = data.ubicacion.horario.dg

    for (const slot of slotsFor(SUNDAY, new Date(2026, 9, 1))) {
      expect(slot >= openingTime(sunday)).toBe(true)
      expect(slot < closingTime(sunday)).toBe(true)
    }
  })

  it('ninguna hora empieza antes de la apertura del resto de días', () => {
    const weekday = data.ubicacion.horario.md

    expect(ALL_SLOTS.every((slot) => slot >= openingTime(weekday))).toBe(true)
  })

  it('el lunes figura como cerrado también en el horario publicado', () => {
    expect(data.ubicacion.horario.ll).toBeNull()
  })
})
