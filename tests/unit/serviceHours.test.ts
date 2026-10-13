import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { data } from '@/data'
import { isClosedDay } from '@/lib/reserveSchedule'

// Las horas a las que se da mesa viven en la base de datos (tabla service_hours). Estas pruebas no la
// consultan: leen lo que siembran las migraciones del repo y lo comparan con el horario que publica la
// web (casaGuell.json). Avisan si alguien cambia el horario publicado y deja los turnos como estaban.
// Lo que no ven: un turno cambiado a mano en la tabla, sin migración.

type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

interface Opening {
  day: Day
  open: string
  close: string
}

interface Shift {
  day: Day
  service: string
  first: string
  last: string
}

const MIGRATIONS = 'supabase/migrations'

function migration (name: string): string {
  const file = readdirSync(MIGRATIONS).find((candidate) => candidate.endsWith(`_${name}.sql`))
  if (file == null) throw new Error(`Falta la migración ${name} en ${MIGRATIONS}`)
  return readFileSync(path.join(MIGRATIONS, file), 'utf8')
}

/** Los días que abre la casa y de qué hora a qué hora: las filas con las que nació opening_hours. */
function seededOpenings (sql: string): Opening[] {
  return [...sql.matchAll(/\('(mon|tue|wed|thu|fri|sat|sun)', '(\d{2}:\d{2})', '(\d{2}:\d{2})'/g)]
    .map(([, day, open, close]) => ({ day: day as Day, open, close }))
}

/** Los turnos que siembra la migración: uno por día abierto, menos el día que excluya (`where day <> '…'`). */
function seededShifts (sql: string, openings: Opening[]): Shift[] {
  const seeds = sql.matchAll(/select day, '(\w+)', time '(\d{2}:\d{2})', time '(\d{2}:\d{2})' from public\.opening_hours(?: where day <> '(\w{3})')?/g)
  return [...seeds].flatMap(([, service, first, last, except]) =>
    openings.filter(({ day }) => day !== except).map(({ day }) => ({ day, service, first, last })))
}

const minutes = (time: string): number => {
  const [hours, mins] = time.split(':').map(Number)
  return hours * 60 + mins
}

/** De qué hora a qué hora, en minutos. Un cierre a las 00:00 es el final del día, no su principio. */
const range = (open: string, close: string): { open: number, close: number } => ({
  open: minutes(open),
  close: minutes(close) === 0 ? 24 * 60 : minutes(close)
})

// La web publica tres tramos: miércoles a sábado (md), domingo (dg) y lunes y martes (ll), que es cierre.
const PUBLISHED_AS: Record<Day, 'md' | 'dg' | 'll'> = { mon: 'll', tue: 'll', wed: 'md', thu: 'md', fri: 'md', sat: 'md', sun: 'dg' }

/** El horario publicado de ese día («13:00 — 00:00»), o null si la web lo da por cerrado. */
function published (day: Day): { open: number, close: number } | null {
  const text: string | null = data.ubicacion.horario[PUBLISHED_AS[day]]
  if (text == null) return null
  const [open, close] = text.split('—').map((part) => part.trim())
  return range(open, close)
}

/** Qué turnos dan mesa fuera del horario publicado, dicho en una frase cada uno. Vacío si todo cuadra. */
function outOfHours (shifts: Shift[]): string[] {
  return shifts.flatMap(({ day, service, first, last }) => {
    const hours = published(day)
    if (hours == null) return [`${day} ${service}: la web publica ese día como cerrado`]
    const problems: string[] = []
    if (minutes(first) < hours.open) problems.push(`${day} ${service}: da mesa a las ${first}, antes de abrir`)
    if (minutes(last) >= hours.close) problems.push(`${day} ${service}: da mesa a las ${last}, con la casa ya cerrada`)
    return problems
  })
}

const openings = seededOpenings(migration('esquema_inicial'))
const shifts = seededShifts(migration('servicios_estado_y_limites'), openings)
const shiftsOn = (day: Day): Array<Omit<Shift, 'day'>> => shifts.filter((shift) => shift.day === day).map(({ service, first, last }) => ({ service, first, last }))

describe('lo que siembran las migraciones', () => {
  it('abre de miércoles a domingo', () => {
    expect(openings.map(({ day }) => day)).toEqual(['wed', 'thu', 'fri', 'sat', 'sun'])
  })

  it('de miércoles a sábado da comida de 13:00 a 15:30 y cena de 20:00 a 22:30', () => {
    const lunchAndDinner = [
      { service: 'lunch', first: '13:00', last: '15:30' },
      { service: 'dinner', first: '20:00', last: '22:30' }
    ]

    expect(shiftsOn('wed')).toEqual(lunchAndDinner)
    expect(shiftsOn('thu')).toEqual(lunchAndDinner)
    expect(shiftsOn('fri')).toEqual(lunchAndDinner)
    expect(shiftsOn('sat')).toEqual(lunchAndDinner)
  })

  it('el domingo solo da comida', () => {
    expect(shiftsOn('sun')).toEqual([{ service: 'lunch', first: '13:00', last: '15:30' }])
  })
})

describe('los turnos frente al horario publicado (casaGuell.json)', () => {
  it('ningún turno da mesa antes de abrir ni con la casa ya cerrada', () => {
    expect(outOfHours(shifts)).toEqual([])
  })

  it('el horario con el que nació la base de datos es el que publica la web', () => {
    for (const { day, open, close } of openings) {
      expect(range(open, close), day).toEqual(published(day))
    }
  })

  it('los días que la web no deja elegir son los que la base de datos no abre', () => {
    // La semana del 12 de octubre de 2026 empieza en lunes
    const week: Array<[Day, string]> = [['mon', '2026-10-12'], ['tue', '2026-10-13'], ['wed', '2026-10-14'], ['thu', '2026-10-15'], ['fri', '2026-10-16'], ['sat', '2026-10-17'], ['sun', '2026-10-18']]
    const open = new Set(openings.map(({ day }) => day))

    for (const [day, date] of week) {
      expect(isClosedDay(date), day).toBe(!open.has(day))
    }
  })
})

describe('cómo se detecta un turno que no cuadra', () => {
  it('una cena en domingo, cuando la casa cierra a las 18:00', () => {
    expect(outOfHours([{ day: 'sun', service: 'dinner', first: '20:00', last: '22:30' }]))
      .toEqual(['sun dinner: da mesa a las 22:30, con la casa ya cerrada'])
  })

  it('una mesa antes de la hora de apertura', () => {
    expect(outOfHours([{ day: 'fri', service: 'lunch', first: '12:30', last: '15:30' }]))
      .toEqual(['fri lunch: da mesa a las 12:30, antes de abrir'])
  })

  it('un turno en un día que la web publica como cerrado', () => {
    expect(outOfHours([{ day: 'mon', service: 'lunch', first: '13:00', last: '15:30' }]))
      .toEqual(['mon lunch: la web publica ese día como cerrado'])
  })

  it('una última mesa a la hora justa de cerrar tampoco vale', () => {
    expect(outOfHours([{ day: 'sun', service: 'lunch', first: '13:00', last: '18:00' }]))
      .toEqual(['sun lunch: da mesa a las 18:00, con la casa ya cerrada'])
  })
})
