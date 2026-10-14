import { useId, useRef, useState, type FormEvent } from 'react'
import { FIELD, LABEL, PRIMARY } from '@/components/ui/controls'
import { PrivacyNote } from '@/components/ui/PrivacyNote'
import type { Reservation } from '@/hooks/useReservation'
import { useI18n } from '@/i18n'
import { isDateInput, todayInput } from '@/lib/dates'
import { lastBookingDate, monthsLabel, nextDays, QUICK_DAYS } from '@/lib/reserveDays'
import { isClosedDay } from '@/lib/reserveSchedule'
import { DayGrid } from './DayGrid'
import { PartyStepper } from './PartyStepper'
import { PhoneLink } from './PhoneLink'
import { SlotPicker } from './SlotPicker'

const MAX_PARTY = 12

interface BookingFormProps {
  booking: Reservation
  /** «personas» o «persona», ya concordado con cuántos vienen. */
  partyNoun: string
  /** La reserva en dos líneas, para el pie en pantallas estrechas, donde el tique no cabe al lado. */
  summary: { when: string, who: string }
}

/**
 * El formulario de reserva. Primero lo que decide si hay mesa (día, cuántos, hora) y después a nombre de
 * quién. El botón de enviar no se apaga cuando falta algo: al pulsarlo se dice qué falta y se lleva el
 * foco allí, que es más claro que un botón gris sin explicación.
 */
export function BookingForm ({ booking, partyNoun, summary }: BookingFormProps) {
  const { t, locale } = useI18n()
  const dateLabel = useId()
  const peopleLabel = useId()
  const slotLabel = useId()
  const otherId = useId()
  const nameId = useId()
  const phoneId = useId()
  const phoneHint = useId()
  const emailId = useId()
  const notesId = useId()
  const choicesRef = useRef<HTMLDivElement>(null)
  const slotsRef = useRef<HTMLElement>(null)
  const [askedForSlot, setAskedForSlot] = useState(false)

  const today = todayInput()
  const days = nextDays(today, QUICK_DAYS)
  const inStrip = days.some((day) => day.date === booking.date)
  const missingSlot = askedForSlot && booking.slot == null
  const setField = (field: keyof Reservation['contact']) => (e: { target: { value: string } }): void =>
    booking.setContact({ ...booking.contact, [field]: e.target.value })

  const submit = (e: FormEvent): void => {
    e.preventDefault()
    if (booking.slot == null) {
      setAskedForSlot(true)
      // El foco va a la primera hora libre o, si aún no hay día, al primer día: lo que queda por elegir
      const groups = choicesRef.current?.querySelectorAll<HTMLElement>('[role="radiogroup"]') ?? []
      const pending = groups[groups.length - 1]?.querySelector<HTMLElement>('[role="radio"][tabindex="0"]')
      pending?.focus()
      return
    }
    void booking.submit().then((failed) => {
      // La hora se ha llenado mientras tanto: se llevan a la vista las que quedan
      if (failed === 'errNoAvailability') slotsRef.current?.scrollIntoView({ block: 'nearest' })
    })
  }

  return (
    <form onSubmit={submit} className='flex min-h-0 flex-1 flex-col'>
      <div className='flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto overscroll-contain px-6 py-6'>
        <div ref={choicesRef} className='flex flex-col gap-8'>
          <section>
            <div className='flex items-baseline justify-between gap-4'>
              <p id={dateLabel} className={LABEL}>{t.reserve.date}</p>
              <p aria-hidden='true' className='font-mono2 text-xs text-ink/70 first-letter:uppercase'>{monthsLabel(days, locale)}</p>
            </div>
            <div className='mt-3'>
              <DayGrid days={days} value={booking.date} locale={locale} labelledBy={dateLabel} closedLabel={t.reserve.closedTag} onChange={booking.setDate} />
            </div>
            {/* Más allá de esas dos semanas, el calendario del navegador */}
            <div className='mt-4 flex items-center gap-3'>
              <label htmlFor={otherId} className='text-sm text-ink/80'>{t.reserve.otherDate}</label>
              <input
                id={otherId}
                type='date'
                name='dia'
                min={today}
                max={lastBookingDate(today)}
                value={inStrip ? '' : booking.date}
                onChange={(e) => { if (isDateInput(e.target.value)) booking.setDate(e.target.value) }}
                className={FIELD}
              />
            </div>
          </section>

          <section>
            <p id={peopleLabel} className={LABEL}>{t.reserve.people}</p>
            <div className='mt-2'>
              <PartyStepper
                value={booking.people}
                min={1}
                max={MAX_PARTY}
                labelledBy={peopleLabel}
                noun={partyNoun}
                fewerLabel={t.reserve.fewer}
                moreLabel={t.reserve.more}
                onChange={booking.setPeople}
              />
            </div>
          </section>

          <section ref={slotsRef}>
            <p id={slotLabel} className={LABEL}>{t.reserve.selectSlot}</p>
            <div className='mt-3'>
              <SlotPicker
                slots={booking.slots}
                hasDate={booking.date !== ''}
                closedDay={isClosedDay(booking.date)}
                people={booking.people}
                value={booking.slot}
                labelledBy={slotLabel}
                t={t.reserve}
                onChange={booking.setSlot}
                onRetry={booking.reloadSlots}
              />
            </div>
            {missingSlot && (
              <p role='alert' className='mt-3 border-l-2 border-ink pl-3 text-sm text-ink'>{t.reserve.pickSlot}</p>
            )}
          </section>
        </div>

        <section className='grid gap-4 border-t border-ink/15 pt-7 sm:grid-cols-2'>
          <div className='space-y-1.5'>
            <label htmlFor={nameId} className={LABEL}>{t.reserve.name}</label>
            <input id={nameId} type='text' name='nom' required maxLength={80} autoComplete='name' value={booking.contact.name} onChange={setField('name')} className={`${FIELD} w-full`} />
          </div>
          <div className='space-y-1.5'>
            <label htmlFor={phoneId} className={LABEL}>{t.reserve.phone}</label>
            <input
              id={phoneId}
              type='tel'
              name='telefon'
              required
              maxLength={20}
              pattern='[0-9+\(\)\s.\-]{9,20}'
              inputMode='tel'
              autoComplete='tel'
              aria-describedby={phoneHint}
              value={booking.contact.phone}
              onChange={setField('phone')}
              className={`${FIELD} w-full`}
            />
          </div>
          <p id={phoneHint} className='text-sm text-ink/70 sm:col-span-2'>{t.reserve.phoneHint}</p>
          <div className='space-y-1.5 sm:col-span-2'>
            <label htmlFor={emailId} className={LABEL}>{t.reserve.email}</label>
            <input
              id={emailId}
              type='email'
              name='email'
              maxLength={120}
              inputMode='email'
              autoComplete='email'
              autoCapitalize='none'
              spellCheck={false}
              value={booking.contact.email}
              onChange={setField('email')}
              className={`${FIELD} w-full`}
            />
          </div>
          <div className='space-y-1.5 sm:col-span-2'>
            <label htmlFor={notesId} className={LABEL}>{t.reserve.notes}</label>
            <textarea id={notesId} name='notes' rows={2} maxLength={300} value={booking.contact.notes} onChange={setField('notes')} className={`${FIELD} w-full py-2.5`} />
          </div>
          {/* La reserva se gestiona porque la pide quien la hace: no lleva casilla, pero sí se dice para qué son los datos */}
          <PrivacyNote className='text-sm text-ink/70 sm:col-span-2'>{t.reserve.dataUse}</PrivacyNote>
        </section>
      </div>

      <div className='flex flex-col gap-3 border-t border-ink/15 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4'>
        {booking.errorKey != null && (
          <p role='alert' className='border-l-2 border-ink pl-3 text-sm text-ink'>
            {t.reserve[booking.errorKey]} <span className='text-ink/70'>{t.reserve.errorCall}</span> <PhoneLink />
          </p>
        )}
        <div className='flex items-center justify-between gap-4'>
          {/* En pantallas anchas esto mismo lo dice el tique de al lado */}
          <p aria-hidden='true' className='min-w-0 text-sm leading-snug text-ink md:hidden'>
            <span className='block truncate font-medium first-letter:uppercase'>{summary.when}</span>
            <span className='block truncate text-ink/70'>{summary.who}</span>
          </p>
          <button type='submit' disabled={booking.sending} className={`${PRIMARY} min-h-12 shrink-0 md:ml-auto`}>
            {booking.sending ? t.reserve.sending : t.reserve.submit}
          </button>
        </div>
      </div>
    </form>
  )
}
