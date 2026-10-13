import { describe, expect, it } from 'vitest'
import { splitBlocks, type Block } from '@/features/admin/blocks'
import { isDateInput, longDate, shiftDate } from '@/features/admin/dates'
import {
  daySummary,
  groupByService,
  nextStep,
  peopleLabel,
  shortTime,
  signInErrorMessage,
  STATUS_LABEL,
  type Reservation
} from '@/features/admin/reservations'

const booking = (changes: Partial<Reservation> = {}): Reservation => ({
  id: '1',
  code: 'CG-0001',
  guest_name: 'Ana Ferrer',
  phone: '600 11 22 33',
  email: null,
  res_date: '2026-10-14',
  res_time: '21:00:00',
  people: 2,
  status: 'confirmed',
  notes: null,
  ...changes
})

describe('shortTime', () => {
  it('quita los segundos que devuelve la base de datos', () => {
    expect(shortTime('21:00:00')).toBe('21:00')
  })

  it('deja igual una hora que ya viene sin segundos', () => {
    expect(shortTime('13:30')).toBe('13:30')
  })
})

describe('peopleLabel', () => {
  it('escribe una persona en singular', () => {
    expect(peopleLabel(1)).toBe('1 persona')
  })

  it('escribe varias en plural', () => {
    expect(peopleLabel(6)).toBe('6 personas')
  })
})

describe('daySummary', () => {
  it('cuenta reservas y comensales', () => {
    const day = [booking({ people: 2 }), booking({ id: '2', people: 5 })]

    expect(daySummary(day)).toEqual({ bookings: 2, guests: 7 })
  })

  it('no cuenta las canceladas ni las que no se presentaron', () => {
    const day = [
      booking({ people: 2 }),
      booking({ id: '2', people: 4, status: 'cancelled' }),
      booking({ id: '3', people: 3, status: 'no_show' })
    ]

    expect(daySummary(day)).toEqual({ bookings: 1, guests: 2 })
  })
})

describe('groupByService', () => {
  it('separa la comida de la cena, con la comida primero', () => {
    const day = [booking({ id: 'cena', res_time: '21:00:00' }), booking({ id: 'comida', res_time: '13:30:00' })]

    const groups = groupByService(day)

    expect(groups.map((group) => group.label)).toEqual(['Comida', 'Cena'])
    expect(groups.map((group) => group.reservations.map((r) => r.id))).toEqual([['comida'], ['cena']])
  })

  it('no crea un servicio que no tiene reservas', () => {
    expect(groupByService([booking({ res_time: '14:00:00' })]).map((group) => group.label)).toEqual(['Comida'])
  })

  it('da el resumen de cada servicio sin contar las canceladas', () => {
    const day = [
      booking({ id: '1', res_time: '20:00:00', people: 2 }),
      booking({ id: '2', res_time: '21:30:00', people: 4 }),
      booking({ id: '3', res_time: '22:00:00', people: 8, status: 'cancelled' })
    ]

    expect(groupByService(day)[0].summary).toEqual({ bookings: 2, guests: 6 })
  })
})

describe('nextStep', () => {
  it('propone confirmar una reserva pendiente', () => {
    expect(nextStep('pending')).toEqual({ to: 'confirmed', label: 'Confirmar' })
  })

  it('propone sentar una confirmada y completar una sentada', () => {
    expect(nextStep('confirmed')).toEqual({ to: 'seated', label: 'Sentar' })
    expect(nextStep('seated')).toEqual({ to: 'completed', label: 'Completar' })
  })

  it('no propone nada para una reserva ya cerrada', () => {
    expect(nextStep('completed')).toBeUndefined()
    expect(nextStep('cancelled')).toBeUndefined()
    expect(nextStep('no_show')).toBeUndefined()
  })
})

describe('STATUS_LABEL', () => {
  it('nombra cada estado en castellano, no con su clave', () => {
    expect(STATUS_LABEL.pending).toBe('Pendiente')
    expect(STATUS_LABEL.no_show).toBe('No se presentó')
  })
})

describe('signInErrorMessage', () => {
  it('explica unas credenciales incorrectas sin el texto en inglés del servidor', () => {
    const message = signInErrorMessage({ code: 'invalid_credentials', message: 'Invalid login credentials' })

    expect(message).toBe('El correo o la contraseña no son correctos. Revísalos y vuelve a intentarlo.')
  })

  it('distingue un fallo de conexión', () => {
    const message = signInErrorMessage({ status: 0, message: 'Failed to fetch' })

    expect(message).toBe('No hemos podido conectar. Comprueba la conexión y vuelve a intentarlo.')
  })

  it('da un mensaje general para lo demás', () => {
    expect(signInErrorMessage({ status: 500, message: 'Database error' })).toBe('No hemos podido iniciar la sesión. Vuelve a intentarlo en unos minutos.')
  })
})

describe('longDate', () => {
  it('escribe el día de la semana y el mes con letra', () => {
    expect(longDate('2026-10-14')).toBe('miércoles, 14 de octubre')
  })

  it('añade el año cuando se le pide', () => {
    expect(longDate('2027-01-02', { year: true })).toBe('sábado, 2 de enero de 2027')
  })
})

describe('shiftDate', () => {
  it('pasa al día siguiente y al anterior', () => {
    expect(shiftDate('2026-10-14', 1)).toBe('2026-10-15')
    expect(shiftDate('2026-10-14', -1)).toBe('2026-10-13')
  })

  it('cruza el fin de mes y el fin de año', () => {
    expect(shiftDate('2026-10-31', 1)).toBe('2026-11-01')
    expect(shiftDate('2027-01-01', -1)).toBe('2026-12-31')
  })

  it('no se salta ni repite un día cuando cambia la hora', () => {
    expect(shiftDate('2026-10-24', 1)).toBe('2026-10-25')
    expect(shiftDate('2026-10-25', 1)).toBe('2026-10-26')
    expect(shiftDate('2026-03-29', 1)).toBe('2026-03-30')
  })
})

describe('isDateInput', () => {
  it('acepta una fecha con el formato de los campos de fecha', () => {
    expect(isDateInput('2026-10-14')).toBe(true)
  })

  it('rechaza lo que no es una fecha o no existe en el calendario', () => {
    expect(isDateInput('mañana')).toBe(false)
    expect(isDateInput('2026-13-01')).toBe(false)
    expect(isDateInput('2026-02-30')).toBe(false)
    expect(isDateInput(null)).toBe(false)
  })
})

describe('splitBlocks', () => {
  const block = (date: string): Block => ({ id: date, block_date: date, slot: null, reason: null, created_at: '2026-01-01T00:00:00Z' })

  it('separa los cierres que quedan por llegar de los que ya han pasado', () => {
    const blocks = [block('2026-10-01'), block('2026-10-14'), block('2026-12-24')]

    const { upcoming, past } = splitBlocks(blocks, '2026-10-14')

    expect(upcoming.map((b) => b.block_date)).toEqual(['2026-10-14', '2026-12-24'])
    expect(past.map((b) => b.block_date)).toEqual(['2026-10-01'])
  })

  it('pone primero el cierre pasado más reciente', () => {
    const { past } = splitBlocks([block('2026-09-01'), block('2026-10-01')], '2026-10-14')

    expect(past.map((b) => b.block_date)).toEqual(['2026-10-01', '2026-09-01'])
  })
})
