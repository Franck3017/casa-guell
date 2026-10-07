import { useState } from 'react'
import { ALL_SLOTS, isClosedDay, slotsFor, toDateInput } from '@/lib/reserveSchedule'

/** Problema con la fecha elegida: día de cierre, o un día abierto al que ya no le quedan horas. */
export type DateProblem = 'closed' | 'noSlots' | null

/**
 * Campos controlados de la reserva (fecha, hora, comensales) y lo que se deriva de ellos según el
 * horario del restaurante: límites del calendario, horas disponibles y si la fecha es válida.
 * `now` es el momento en que se abrió el diálogo: marca "hoy" y qué horas han pasado ya.
 */
export function useReserveFields (now: Date) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [people, setPeople] = useState('2')

  const closed = date !== '' && isClosedDay(date)
  const slots = date === '' ? ALL_SLOTS : slotsFor(date, now)
  const noSlots = date !== '' && !closed && slots.length === 0
  const dateProblem: DateProblem = closed ? 'closed' : noSlots ? 'noSlots' : null

  return {
    date,
    setDate,
    /** Si la hora elegida ya no está entre las disponibles, se usa la primera que sí. */
    time: slots.includes(time) ? time : (slots[0] ?? ''),
    setTime,
    people,
    setPeople,
    minDate: toDateInput(now),
    maxDate: toDateInput(new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())),
    slots,
    lunchSlots: slots.filter((s) => s < '18:00'),
    dinnerSlots: slots.filter((s) => s >= '18:00'),
    dateProblem
  }
}

export type ReserveFields = ReturnType<typeof useReserveFields>
