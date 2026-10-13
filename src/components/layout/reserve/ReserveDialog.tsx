import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { ICON_BUTTON, PRIMARY, SCRIM } from '@/components/ui/controls'
import { useDialogFocus } from '@/hooks/useDialogFocus'
import { useReservation } from '@/hooks/useReservation'
import { useI18n } from '@/i18n'
import { INTL_LOCALE } from '@/lib/menuFormat'
import { dayLabels, shortTime } from '@/lib/reserveDays'
import { BookingForm } from './BookingForm'
import { PhoneLink } from './PhoneLink'
import { ReserveTicket } from './ReserveTicket'

// El papel de bandeja de la casa (el mismo del collage de la portada), sobre el que descansa el tique
const TRAY = 'relative bg-linen/70'
const TRAY_PRINT = 'paper-print pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_92%)]'
// El título recibe el foco al abrir, pero no es un control: no lleva anillo
const TITLE = 'font-display text-ink outline-none'

interface ReserveDialogProps {
  open: boolean
  onClose: () => void
}

/**
 * El diálogo de reserva. La reserva se plantea como una comanda: a un lado, un tique de la casa que se va
 * rellenando con lo que se elige al otro (día, cuántos, hora, a nombre de quién); al enviarla el tique no
 * se mueve de su sitio, recibe su código y el formulario deja paso a la confirmación. En pantallas
 * estrechas el tique no cabe al lado: mientras se rellena, su resumen va en el pie, junto al botón, y al
 * confirmar aparece entero.
 * Aquí solo está el marco: el foco y el teclado van en useDialogFocus, los datos y lo que se habla con la
 * base de datos en useReservation, y las piezas en sus archivos. Sigue montado mientras está cerrado, para
 * que lo ya elegido y escrito no se pierda al cerrarlo.
 */
export function ReserveDialog ({ open, onClose }: ReserveDialogProps) {
  const { t, locale } = useI18n()
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const booking = useReservation(locale)
  const done = booking.code != null

  const close = (): void => {
    onClose()
    // Una reserva ya hecha no se queda en el formulario: la próxima empieza en blanco
    if (done) booking.reset()
  }

  const { trapFocus } = useDialogFocus({ open, close, panelRef, initialRef: titleRef })

  // Al quedar hecha la reserva el formulario desaparece: el foco pasa al título de la confirmación
  useEffect(() => {
    if (open && done) titleRef.current?.focus()
  }, [open, done])

  if (!open) return null

  const partyNoun = new Intl.PluralRules(INTL_LOCALE[locale]).select(booking.people) === 'one' ? t.reserve.person : t.reserve.persons
  const day = booking.date === '' ? null : dayLabels(booking.date, locale)
  const time = booking.slot == null ? '' : shortTime(booking.slot)
  const ticket = (
    <ReserveTicket
      heading={t.reserve.title}
      rows={[
        { label: t.reserve.date, value: day?.short ?? '' },
        { label: t.reserve.time, value: time },
        { label: t.reserve.people, value: String(booking.people) },
        { label: t.reserve.name, value: booking.contact.name.trim() }
      ]}
      code={booking.code ? { label: t.reserve.codeLabel, value: booking.code } : undefined}
    />
  )
  const closeButton = (
    <button type='button' onClick={close} aria-label={t.reserve.close} className={ICON_BUTTON}>
      <X aria-hidden='true' size={18} strokeWidth={1.8} />
    </button>
  )

  return (
    <div role='dialog' aria-modal='true' aria-labelledby={titleId} className={SCRIM} onClick={close} onKeyDown={trapFocus}>
      {/* En pantallas estrechas ocupa la pantalla entera; en las anchas, lo que pida su contenido sin salirse */}
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className='modal-panel elev flex max-h-full w-full max-w-4xl flex-col overflow-hidden border border-ink/10 bg-surface pt-[env(safe-area-inset-top)] md:flex-row'
      >
        <aside className={`${TRAY} hidden w-80 shrink-0 flex-col gap-6 p-6 md:flex`}>
          <div aria-hidden='true' className={TRAY_PRINT} />
          {/* Mientras se rellena, el tique repite lo que ya dicen los controles: solo se anuncia cuando queda hecho */}
          <div aria-hidden={!done} className='relative my-auto rotate-[1.5deg]'>{ticket}</div>
          <p className='relative text-sm text-ink/80'>{t.reserve.errorCall} <PhoneLink /></p>
        </aside>

        {done
          ? (
            <div className='state-in flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))]'>
              <div className='flex justify-end px-6 py-4'>{closeButton}</div>
              <div className='my-auto py-6'>
                <div className='px-6'>
                  <h2 id={titleId} ref={titleRef} tabIndex={-1} className={`${TITLE} text-4xl leading-[1.1]`}>{t.reserve.success}</h2>
                  <p className='mt-3 max-w-[46ch] text-base text-ink/80'>{t.reserve.successDesc}</p>
                </div>
                {/* En pantallas estrechas no hay columna para el tique: va aquí, sobre su papel */}
                <div className={`${TRAY} mt-8 px-6 py-8 md:hidden`}>
                  <div aria-hidden='true' className={TRAY_PRINT} />
                  <div className='relative mx-auto max-w-sm rotate-[1.5deg]'>{ticket}</div>
                </div>
                <div className='px-6'>
                  <button type='button' onClick={close} className={`${PRIMARY} mt-8 min-h-12`}>{t.reserve.close}</button>
                </div>
              </div>
            </div>
            )
          : (
            <div className='flex min-h-0 min-w-0 flex-1 flex-col'>
              <div className='flex items-center justify-between gap-4 border-b border-ink/15 px-6 py-4'>
                <h2 id={titleId} ref={titleRef} tabIndex={-1} className={`${TITLE} text-3xl`}>{t.reserve.title}</h2>
                {closeButton}
              </div>
              <BookingForm booking={booking} partyNoun={partyNoun} summary={{ when: day?.full ?? '', who: [time, `${booking.people} ${partyNoun}`].filter(Boolean).join(', ') }} />
            </div>
            )}
      </div>
    </div>
  )
}
