import { useEffect, useId, useRef, useState } from 'react'
import { useDialogFocus } from '@/hooks/useDialogFocus'
import { useFormspreeSubmit } from '@/hooks/useFormspreeSubmit'
import { useReserveFields } from '@/hooks/useReserveFields'
import { useI18n } from '@/i18n'
import { OPEN_RESERVE } from '@/lib/events'
import { ReserveForm } from './reserve/ReserveForm'
import { ReserveSuccess } from './reserve/ReserveSuccess'

/**
 * Diálogo de reserva. Se abre con el evento global OPEN_RESERVE desde cualquier botón de reservar.
 * Aquí solo está abrir y cerrar y el marco del diálogo: el foco y el teclado van en useDialogFocus,
 * el envío en useFormspreeSubmit, los campos y el horario en useReserveFields, y el contenido en ./reserve.
 * Los campos viven aquí (y no en el formulario) para que lo ya escrito no se pierda al cerrar y reabrir.
 */
export function ReserveModal () {
  const { t } = useI18n()
  const titleId = useId()
  const [open, setOpen] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const dateRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const fields = useReserveFields(now)
  const { status, send, cancel, reset } = useFormspreeSubmit()

  const close = (): void => {
    cancel()
    setOpen(false)
  }

  const { rememberFocus, trapFocus } = useDialogFocus({ open, close, panelRef, initialRef: dateRef })

  // Las funciones de los hooks cambian en cada render: el escucha global usa siempre las últimas.
  const onOpenRef = useRef(() => {})
  useEffect(() => {
    onOpenRef.current = () => {
      rememberFocus()
      setNow(new Date())
      reset()
      setOpen(true)
    }
  })
  useEffect(() => {
    const onOpen = (): void => onOpenRef.current()
    window.addEventListener(OPEN_RESERVE, onOpen)
    return () => window.removeEventListener(OPEN_RESERVE, onOpen)
  }, [])

  if (!open) return null

  return (
    <div
      role='dialog' aria-modal='true' aria-labelledby={titleId}
      className='modal-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/40 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] backdrop-blur-sm'
      onClick={close}
      onKeyDown={trapFocus}
    >
      <div ref={panelRef} className='modal-panel elev my-auto w-full max-w-md border border-ink/10 bg-surface p-8' onClick={(e) => e.stopPropagation()}>
        <div className='flex items-start justify-between'>
          <h2 id={titleId} className='font-display text-2xl text-ink'>{t.reserve.title}</h2>
          <button
            type='button'
            onClick={close}
            aria-label={t.reserve.close}
            className='press -mr-3 -mt-2 flex h-11 w-11 items-center justify-center font-mono2 text-xl text-ink/60 hover:text-ink'
          >
            <span aria-hidden='true'>×</span>
          </button>
        </div>

        {status === 'success'
          ? <ReserveSuccess onClose={close} />
          : <ReserveForm fields={fields} status={status} dateRef={dateRef} onSubmit={(form) => { void send(form) }} />}
      </div>
    </div>
  )
}
