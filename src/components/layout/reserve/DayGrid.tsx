import type { Locale } from '@/i18n'
import { INTL_LOCALE } from '@/lib/menuFormat'
import { dayLabels, type BookingDay } from '@/lib/reserveDays'
import { onRovingKeyDown } from './roving'

const WEEK = 7

interface DayGridProps {
  /** Semanas enteras a partir de hoy: así cada columna es siempre el mismo día de la semana. */
  days: BookingDay[]
  /** El día elegido (AAAA-MM-DD), o vacío. Puede no estar en la rejilla si se eligió en el calendario. */
  value: string
  locale: Locale
  /** id del texto que nombra el grupo. */
  labelledBy: string
  /** Lo que se dice de un día que no se puede elegir («cerrado»). */
  closedLabel: string
  onChange: (date: string) => void
}

/**
 * Los próximos días, a un toque: una hoja de calendario de dos semanas que empieza hoy, sin nada que
 * deslizar. Como cada columna es un día de la semana, los de cierre caen uno debajo de otro y se ve de un
 * vistazo cuándo no se abre; se enseñan tachados, pero no se eligen. Hoy lleva un punto.
 * Es un grupo de opciones: se entra con Tab y se recorre con las flechas.
 */
export function DayGrid ({ days, value, locale, labelledBy, closedLabel, onChange }: DayGridProps) {
  const today = new Intl.RelativeTimeFormat(INTL_LOCALE[locale], { numeric: 'auto' }).format(0, 'day')
  const chosen = days.find((day) => day.date === value && !day.closed)
  const tabStop = (chosen ?? days.find((day) => !day.closed))?.date

  return (
    <div
      role='radiogroup'
      aria-labelledby={labelledBy}
      data-columns={WEEK}
      onKeyDown={onRovingKeyDown}
      className='grid grid-cols-7 justify-items-center gap-y-1.5'
    >
      {days.slice(0, WEEK).map((day) => (
        <span key={day.date} aria-hidden='true' className='font-mono2 text-[11px] uppercase leading-4 tracking-wider text-ink/70'>
          {dayLabels(day.date, locale).weekday}
        </span>
      ))}
      {days.map((day, index) => {
        const { day: number, full } = dayLabels(day.date, locale)
        const selected = day.date === value
        const isToday = index === 0
        let look = 'border-ink/25 text-ink hover:border-ink/60'
        if (day.closed) look = 'border-transparent text-ink/45 line-through'
        if (selected) look = 'border-ink bg-ink text-cream'
        return (
          <button
            key={day.date}
            type='button'
            role='radio'
            aria-checked={selected}
            aria-label={[isToday && today, full, day.closed && closedLabel].filter(Boolean).join(', ')}
            disabled={day.closed}
            tabIndex={day.date === tabStop ? 0 : -1}
            onClick={() => onChange(day.date)}
            className={`press relative flex size-11 items-center justify-center rounded-full border font-display text-xl leading-none ${look}`}
          >
            {number}
            {isToday && <span aria-hidden='true' className={`absolute bottom-1.5 size-1 rounded-full ${selected ? 'bg-cream' : 'bg-brand'}`} />}
          </button>
        )
      })}
    </div>
  )
}
