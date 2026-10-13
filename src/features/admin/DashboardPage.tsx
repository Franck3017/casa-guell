import { useEffect, useId, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ChevronLeft, ChevronRight, Mail, Phone, RefreshCw } from 'lucide-react'
import { isClosedDay } from '@/lib/reserveSchedule'
import { supabase } from '@/lib/supabase'
import { isDateInput, longDate, shiftDate, today } from './dates'
import {
  daySummary,
  groupByService,
  nextStep,
  peopleLabel,
  shortTime,
  STATUS_LABEL,
  STATUSES,
  type DaySummary,
  type Reservation,
  type ReservationStatus
} from './reservations'
import { FIELD, ICON_BUTTON, LABEL, PRIMARY, QUIET } from './styles'
import { EmptyState, ErrorNotice, SkeletonRows, StatusTag } from './ui'
import { useDocumentTitle } from './useDocumentTitle'

/** Lo último que ha contestado la base de datos, con el día al que corresponde. Sin reservas (null) si ha fallado. */
interface Loaded {
  date: string
  reservations: Reservation[] | null
}

const summaryText = ({ bookings, guests }: DaySummary): string =>
  `${bookings} ${bookings === 1 ? 'reserva' : 'reservas'}, ${guests} ${guests === 1 ? 'comensal' : 'comensales'}`

/**
 * Reservas de un día, repartidas en comida y cena. El día va en la dirección (`?dia=2026-10-14`), así que
 * se puede enlazar y el botón de atrás vuelve al día anterior que se miró; sin él, es hoy.
 * Cambiar el estado de una reserva se ve al instante y se guarda por detrás: si no se guarda, vuelve a
 * como estaba y se dice en su fila.
 */
export function DashboardPage () {
  useDocumentTitle('Reservas')
  const dateId = useId()
  const [params, setParams] = useSearchParams()
  const requested = params.get('dia')
  const date = isDateInput(requested) ? requested : today()
  const setDate = (next: string): void => setParams(next === today() ? {} : { dia: next })

  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [reloads, setReloads] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState<string[]>([])
  const [failedId, setFailedId] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    // Si se cambia de día antes de que llegue la respuesta, la que llega tarde ya no se usa
    let current = true
    void supabase
      .from('reservations')
      .select('*')
      .eq('res_date', date)
      .order('res_time', { ascending: true })
      .then(({ data, error }) => {
        if (!current) return
        setLoaded({ date, reservations: error != null || data == null ? null : data as Reservation[] })
        setRefreshing(false)
      })
    return () => { current = false }
  }, [date, reloads])

  const reload = (): void => {
    setRefreshing(true)
    setReloads((n) => n + 1)
  }

  const setStatusLocally = (id: string, status: ReservationStatus): void => {
    setLoaded((state) => state?.reservations == null
      ? state
      : { ...state, reservations: state.reservations.map((r) => r.id === id ? { ...r, status } : r) })
  }

  const changeStatus = async (reservation: Reservation, status: ReservationStatus): Promise<void> => {
    if (status === reservation.status) return
    setFailedId(null)
    setSaving((ids) => [...ids, reservation.id])
    setStatusLocally(reservation.id, status)

    // Se pide la fila de vuelta: una actualización que no toca ninguna fila no da error, pero tampoco guarda
    const { data, error } = await supabase.from('reservations').update({ status }).eq('id', reservation.id).select('id')

    setSaving((ids) => ids.filter((id) => id !== reservation.id))
    if (error != null || data == null || data.length === 0) {
      setStatusLocally(reservation.id, reservation.status)
      setFailedId(reservation.id)
      return
    }
    setAnnouncement(`Reserva de ${reservation.guest_name}: ${STATUS_LABEL[status]}`)
  }

  // Mientras llega el día pedido no se enseña el anterior: se confundirían las reservas de un día con otro
  const day = loaded?.date === date ? loaded : null
  const reservations = day?.reservations ?? []
  const isToday = date === today()

  return (
    <div>
      <div className='flex flex-wrap items-end justify-between gap-x-8 gap-y-6'>
        <div className='min-w-0'>
          <h1 className='font-display text-3xl text-ink sm:text-4xl'>Reservas</h1>
          <p className='mt-2 text-base text-ink/80 first-letter:uppercase'>
            {isToday ? `Hoy, ${longDate(date)}` : longDate(date, { year: true })}
          </p>
          {day?.reservations != null && day.reservations.length > 0 && (
            <p className='mt-1 font-mono2 text-xs text-ink/70'>{summaryText(daySummary(day.reservations))}</p>
          )}
        </div>

        <div className='flex w-full flex-wrap items-end gap-2 sm:w-auto'>
          <button type='button' aria-label='Día anterior' onClick={() => setDate(shiftDate(date, -1))} className={ICON_BUTTON}>
            <ChevronLeft aria-hidden='true' size={18} strokeWidth={1.8} />
          </button>
          {/* El campo no baja de un ancho en el que se lee la fecha entera: si no cabe todo, lo último pasa a otra fila */}
          <div className='min-w-44 flex-1 space-y-1.5 sm:flex-none'>
            <label htmlFor={dateId} className={LABEL}>Día</label>
            <input
              id={dateId}
              type='date'
              name='dia'
              value={date}
              onChange={(e) => { if (isDateInput(e.target.value)) setDate(e.target.value) }}
              className={`${FIELD} w-full`}
            />
          </div>
          <button type='button' aria-label='Día siguiente' onClick={() => setDate(shiftDate(date, 1))} className={ICON_BUTTON}>
            <ChevronRight aria-hidden='true' size={18} strokeWidth={1.8} />
          </button>
          <button type='button' aria-label='Actualizar la lista' onClick={reload} disabled={refreshing || day == null} className={ICON_BUTTON}>
            <RefreshCw aria-hidden='true' size={16} strokeWidth={1.8} className={refreshing ? 'motion-safe:animate-spin' : undefined} />
          </button>
          {/* Va el último: aparece y desaparece sin mover a los demás */}
          {!isToday && (
            <button type='button' onClick={() => setDate(today())} className={QUIET}>Hoy</button>
          )}
        </div>
      </div>

      <p role='status' className='sr-only'>{announcement}</p>

      <div className='mt-8' aria-busy={day == null || refreshing}>
        {day == null && <SkeletonRows rows={4} label='Cargando las reservas…' />}

        {day != null && day.reservations == null && (
          <ErrorNotice action={<button type='button' onClick={reload} className={QUIET}>Reintentar</button>}>
            No se han podido cargar las reservas. Comprueba la conexión y vuelve a intentarlo.
          </ErrorNotice>
        )}

        {day?.reservations != null && day.reservations.length === 0 && (
          isClosedDay(date)
            ? <EmptyState title={isToday ? 'Hoy el restaurante cierra.' : 'Ese día el restaurante cierra.'} hint='Los lunes y martes no se admiten reservas desde la web.' />
            : <EmptyState title='No hay reservas para este día.' hint='Las que lleguen desde la web aparecerán aquí. Pulsa el botón de actualizar para comprobarlo.' />
        )}

        {groupByService(reservations).map((service) => (
          <section key={service.label} className='mt-10 first:mt-0'>
            <div className='flex items-baseline justify-between gap-4 border-b border-ink/60 pb-2'>
              <h2 className='font-body text-base font-semibold tracking-normal text-ink'>{service.label}</h2>
              <p className='font-mono2 text-xs text-ink/70'>{summaryText(service.summary)}</p>
            </div>

            <ul className='divide-y divide-ink/10'>
              {service.reservations.map((reservation) => (
                <ReservationRow
                  key={reservation.id}
                  reservation={reservation}
                  saving={saving.includes(reservation.id)}
                  failed={failedId === reservation.id}
                  onChange={(status) => { void changeStatus(reservation, status) }}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

interface ReservationRowProps {
  reservation: Reservation
  saving: boolean
  failed: boolean
  onChange: (status: ReservationStatus) => void
}

/**
 * Una reserva: la hora a la izquierda, quién viene y cómo localizarle en el centro, y a la derecha el paso
 * siguiente (confirmar, sentar, completar) con la lista de todos los estados para lo que se salga de él.
 */
function ReservationRow ({ reservation, saving, failed, onChange }: ReservationRowProps) {
  const statusId = useId()
  const { status, guest_name: name, phone, email, notes } = reservation
  const step = nextStep(status)
  const gone = status === 'cancelled' || status === 'no_show'

  return (
    <li className='grid grid-cols-[4rem_minmax(0,1fr)] gap-x-4 gap-y-3 py-5 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:gap-x-6'>
      <p className={`font-mono2 text-lg leading-7 ${gone ? 'text-ink/60' : 'text-ink'}`}>{shortTime(reservation.res_time)}</p>

      <div className='min-w-0'>
        <div className='flex flex-wrap items-center gap-x-3 gap-y-1.5'>
          <p className={`min-w-0 break-words text-base font-semibold leading-7 ${gone ? 'text-ink/60 line-through decoration-ink/40' : 'text-ink'}`}>{name}</p>
          <StatusTag status={status} />
        </div>
        <p className='mt-0.5 text-sm text-ink/70'>
          {peopleLabel(reservation.people)}
          <span className='ml-3 font-mono2 text-xs text-ink/60' translate='no'>{reservation.code}</span>
        </p>
        <p className='-ml-1 mt-1 flex flex-wrap gap-x-4 text-sm text-ink'>
          <a href={`tel:${phone.replace(/\s/g, '')}`} className='inline-flex min-h-8 items-center gap-2 whitespace-nowrap px-1 underline pointer-coarse:min-h-11 decoration-ink/25 underline-offset-4 hover:text-brand hover:decoration-brand'>
            <Phone aria-hidden='true' size={15} strokeWidth={1.8} className='shrink-0 text-ink/60' />
            {phone}
          </a>
          {email != null && email !== '' && (
            <a href={`mailto:${email}`} className='inline-flex min-h-8 min-w-0 items-center gap-2 px-1 underline pointer-coarse:min-h-11 decoration-ink/25 underline-offset-4 hover:text-brand hover:decoration-brand'>
              <Mail aria-hidden='true' size={15} strokeWidth={1.8} className='shrink-0 text-ink/60' />
              <span className='min-w-0 break-all'>{email}</span>
            </a>
          )}
        </p>
        {notes != null && notes !== '' && (
          <p className='mt-2 max-w-prose whitespace-pre-line break-words border-l-2 border-ink/25 pl-3 text-sm text-ink/80'>{notes}</p>
        )}
        {failed && (
          <p role='alert' className='mt-3 border-l-2 border-ink pl-3 text-sm text-ink'>
            No se ha podido guardar el cambio. Comprueba la conexión y vuelve a intentarlo.
          </p>
        )}
      </div>

      <div className='col-span-2 flex items-center gap-2 sm:col-span-1 sm:justify-end sm:self-start'>
        {step != null && (
          <button type='button' disabled={saving} onClick={() => onChange(step.to)} className={PRIMARY}>{step.label}</button>
        )}
        <label htmlFor={statusId} className='sr-only'>Estado de la reserva de {name}</label>
        <select
          id={statusId}
          name='estado'
          value={status}
          disabled={saving}
          onChange={(e) => onChange(e.target.value as ReservationStatus)}
          className={`${FIELD} min-w-0 flex-1 sm:w-44 sm:flex-none`}
        >
          {STATUSES.map((option) => <option key={option} value={option}>{STATUS_LABEL[option]}</option>)}
        </select>
      </div>
    </li>
  )
}
