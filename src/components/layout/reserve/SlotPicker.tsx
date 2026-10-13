import type { ReactNode } from 'react'
import { QUIET } from '@/components/ui/controls'
import type { Messages } from '@/i18n/types'
import { hasRoom, shortTime, splitSlots, type Slot } from '@/lib/reserveDays'
import { PhoneLink } from './PhoneLink'
import { onRovingKeyDown } from './roving'

interface SlotPickerProps {
  /** Las horas del día elegido: `undefined` mientras llegan, `null` si no se han podido consultar. */
  slots: Slot[] | null | undefined
  /** Sin día elegido todavía no hay nada que consultar. */
  hasDate: boolean
  /** El día elegido es de los que el restaurante cierra. */
  closedDay: boolean
  people: number
  value: string | null
  /** id del texto que nombra el grupo. */
  labelledBy: string
  t: Messages['reserve']
  onChange: (slot: string) => void
  onRetry: () => void
}

const HINT = 'text-sm text-ink/70'
const SERVICE = 'font-mono2 text-[11px] uppercase leading-4 tracking-wider text-ink/70'
// Las horas van cada media hora: tres por fila en pantallas estrechas y seis en las anchas
const PILLS = 'mt-1.5 grid grid-cols-3 gap-1.5 sm:grid-cols-6'

/** Una frase que explica por qué no hay horas, con el teléfono al lado: siempre queda una salida. */
function NoSlots ({ children, callText }: { children: ReactNode, callText: string }) {
  return (
    <p className='text-sm text-ink'>
      {children} <span className='text-ink/70'>{callText}</span> <PhoneLink />
    </p>
  )
}

/**
 * Las horas libres del día, separadas en comida y cena. Las que no tienen sitio para tantos se ven
 * tachadas en su sitio, para que se entienda que existen pero están llenas.
 * Es un solo grupo de opciones: se entra con Tab y se recorre con las flechas, de la comida a la cena.
 */
export function SlotPicker ({ slots, hasDate, closedDay, people, value, labelledBy, t, onChange, onRetry }: SlotPickerProps) {
  if (!hasDate) return <p className={HINT}>{t.slotsHint}</p>

  if (slots === undefined) {
    // El hueco se parece a lo que llega (comida y cena, una fila de horas cada una), para que salte poco al llegar
    return (
      <div role='status' className='space-y-4'>
        <span className='sr-only'>{t.loadingSlots}</span>
        {[t.lunch, t.dinner].map((label) => (
          <div key={label} aria-hidden='true'>
            <p className={SERVICE}>{label}</p>
            <div className={PILLS}>
              {Array.from({ length: 6 }, (_, pill) => (
                <span key={pill} className='h-11 rounded-full bg-ink/10 motion-safe:animate-pulse' />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (slots === null) {
    return (
      <div role='alert' className='flex flex-wrap items-center gap-x-4 gap-y-2'>
        <NoSlots callText={t.errorCall}>{t.slotsFailed}</NoSlots>
        <button type='button' onClick={onRetry} className={QUIET}>{t.retry}</button>
      </div>
    )
  }

  if (slots.length === 0) return <NoSlots callText={t.errorCall}>{closedDay ? t.closedDay : t.noSlots}</NoSlots>

  const { lunch, dinner } = splitSlots(slots)
  const chosen = slots.find((s) => s.slot === value && hasRoom(s, people))
  const tabStop = (chosen ?? slots.find((s) => hasRoom(s, people)))?.slot

  return (
    <div role='radiogroup' aria-labelledby={labelledBy} onKeyDown={onRovingKeyDown} className='space-y-4'>
      {[{ label: t.lunch, group: lunch }, { label: t.dinner, group: dinner }].map(({ label, group }) => group.length > 0 && (
        <div key={label}>
          <p className={SERVICE}>{label}</p>
          <div className={PILLS}>
            {group.map((s) => {
              const time = shortTime(s.slot)
              const free = hasRoom(s, people)
              const selected = s.slot === value
              let look = 'border-ink/25 text-ink hover:border-ink/60'
              if (!free) look = 'border-transparent text-ink/45 line-through'
              if (selected) look = 'border-ink bg-ink text-cream'
              return (
                <button
                  key={s.slot}
                  type='button'
                  role='radio'
                  aria-checked={selected}
                  aria-label={free ? time : `${time}, ${t.full}`}
                  disabled={!free}
                  tabIndex={s.slot === tabStop ? 0 : -1}
                  onClick={() => onChange(s.slot)}
                  className={`press inline-flex min-h-11 items-center justify-center rounded-full border font-mono2 text-sm ${look}`}
                >
                  {time}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
