import { useEffect, useId, type FormEvent, type RefObject } from 'react'
import type { SubmitStatus } from '@/hooks/useFormspreeSubmit'
import type { ReserveFields } from '@/hooks/useReserveFields'
import { useI18n } from '@/i18n'
import { PhoneLink } from './PhoneLink'

const FIELD = 'mt-1 w-full border border-ink/15 bg-transparent px-3 py-2 text-base text-ink outline-none focus:border-brand md:text-sm'
const LABEL = 'font-mono2 text-[11px] uppercase tracking-widest text-ink/60'

interface ReserveFormProps {
  fields: ReserveFields
  status: SubmitStatus
  /** El campo de fecha: es el primero del diálogo y el que recibe el foco al abrir. */
  dateRef: RefObject<HTMLInputElement | null>
  onSubmit: (form: HTMLFormElement) => void
}

/** Formulario de reserva: fecha y hora (según el horario), comensales, nombre y teléfono. */
export function ReserveForm ({ fields, status, dateRef, onSubmit }: ReserveFormProps) {
  const { t } = useI18n()
  const dateErrId = useId()
  const phoneHintId = useId()

  const dateError = fields.dateProblem === 'closed'
    ? t.reserve.closedDay
    : fields.dateProblem === 'noSlots' ? t.reserve.noSlots : ''

  // Mensaje nativo de validación del campo fecha (días cerrados o sin horas libres).
  useEffect(() => {
    dateRef.current?.setCustomValidity(dateError)
  }, [dateError, dateRef])

  const submit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (dateError === '') onSubmit(e.currentTarget)
  }

  return (
    <form onSubmit={submit} className='mt-6 space-y-4'>
      <div className='grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-4'>
        <label className='block'>
          <span className={LABEL}>{t.reserve.date}</span>
          <input
            ref={dateRef}
            type='date'
            name='data'
            required
            min={fields.minDate}
            max={fields.maxDate}
            value={fields.date}
            onChange={(e) => fields.setDate(e.target.value)}
            aria-invalid={dateError !== '' || undefined}
            aria-describedby={dateError !== '' ? dateErrId : undefined}
            className={FIELD}
          />
        </label>
        <label className='block'>
          <span className={LABEL}>{t.reserve.time}</span>
          <select
            name='hora'
            required
            disabled={fields.slots.length === 0}
            value={fields.time}
            onChange={(e) => fields.setTime(e.target.value)}
            className={`${FIELD} disabled:opacity-50`}
          >
            {fields.lunchSlots.length > 0 && (
              <optgroup label={t.reserve.lunch}>
                {fields.lunchSlots.map((s) => <option key={s} value={s}>{s}</option>)}
              </optgroup>
            )}
            {fields.dinnerSlots.length > 0 && (
              <optgroup label={t.reserve.dinner}>
                {fields.dinnerSlots.map((s) => <option key={s} value={s}>{s}</option>)}
              </optgroup>
            )}
          </select>
        </label>
      </div>
      {dateError !== '' && (
        <p id={dateErrId} role='alert' className='text-sm text-ink'>{dateError}</p>
      )}

      <label className='block'>
        <span className={LABEL}>{t.reserve.people}</span>
        <select name='persones' required value={fields.people} onChange={(e) => fields.setPeople(e.target.value)} className={FIELD}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
          <option value='9+'>9+</option>
        </select>
      </label>
      {fields.people === '9+' && (
        <p className='text-sm text-ink/70'>{t.reserve.bigGroup} <PhoneLink /></p>
      )}

      <label className='block'>
        <span className={LABEL}>{t.reserve.name}</span>
        <input type='text' name='nom' required maxLength={80} autoComplete='name' className={FIELD} />
      </label>
      <label className='block'>
        <span className={LABEL}>{t.reserve.phone}</span>
        <input
          type='tel'
          name='telefon'
          required
          maxLength={20}
          pattern='[0-9+\(\)\s.\-]{9,20}'
          inputMode='tel'
          autoComplete='tel'
          aria-describedby={phoneHintId}
          className={FIELD}
        />
        <span id={phoneHintId} className='mt-1.5 block text-sm text-ink/70'>{t.reserve.phoneHint}</span>
      </label>

      {status === 'error' && (
        <p role='alert' className='text-sm text-ink'>
          {t.reserve.error} {t.reserve.errorCall} <PhoneLink />.
        </p>
      )}

      <button
        type='submit'
        disabled={status === 'sending'}
        className='press mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-6 font-body text-sm font-semibold text-cream transition-colors hover:bg-brand disabled:opacity-50 motion-reduce:transition-none'
      >
        {status === 'sending' ? t.reserve.sending : t.reserve.submit}
      </button>
    </form>
  )
}
