import { lazy, Suspense, useEffect, useState } from 'react'
import { ErrorBoundary, LoadError } from '@/components/ui'
import { SCRIM } from '@/components/ui/controls'
import { useI18n } from '@/i18n'
import { OPEN_RESERVE } from '@/lib/events'

const ReserveDialog = lazy(async () => await import('./reserve/ReserveDialog').then((m) => ({ default: m.ReserveDialog })))

// Las primeras señales de que hay alguien mirando la página
const FIRST_MOVES = ['pointermove', 'touchstart', 'keydown', 'scroll']

/**
 * La puerta del diálogo de reserva. Se abre con el evento global OPEN_RESERVE desde cualquier botón de
 * reservar. El diálogo (el formulario, el tique y lo que habla con la base de datos) va en un trozo aparte
 * y no pesa en la carga de la página: se trae, y se monta cerrado, en cuanto quien la visita da la primera
 * señal de vida, de modo que al pulsar «Reservar» ya está ahí. Sin visita real no se descarga.
 */
export function ReserveModal () {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [wanted, setWanted] = useState(false)

  useEffect(() => {
    const warm = (): void => setWanted(true)
    const onOpen = (): void => {
      setWanted(true)
      setOpen(true)
    }
    window.addEventListener(OPEN_RESERVE, onOpen)
    for (const move of FIRST_MOVES) window.addEventListener(move, warm, { once: true, passive: true })
    return () => {
      window.removeEventListener(OPEN_RESERVE, onOpen)
      for (const move of FIRST_MOVES) window.removeEventListener(move, warm)
    }
  }, [])

  if (!wanted) return null

  const close = (): void => setOpen(false)
  // Si el trozo no llega (un corte de red, una versión nueva publicada con la página abierta), se dice al abrir
  const failed = open && (
    <div role='alertdialog' aria-modal='true' aria-label={t.loadError.page} className={SCRIM} onClick={close}>
      <LoadError message={t.loadError.page} className='elev m-auto bg-surface py-10' />
    </div>
  )

  return (
    <ErrorBoundary fallback={failed}>
      {/* Si se pulsa antes de que llegue, el velo responde al instante y el diálogo aparece sobre él */}
      <Suspense fallback={open && <div className={SCRIM} />}>
        <ReserveDialog open={open} onClose={close} />
      </Suspense>
    </ErrorBoundary>
  )
}
