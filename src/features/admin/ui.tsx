import type { ReactNode } from 'react'
import { STATUS_LABEL, type ReservationStatus } from './reservations'

/**
 * Estado de una reserva, como el sello de un tique: rectángulo pequeño en mono, que no se confunde con un
 * botón. El texto dice siempre el estado; el relleno solo ayuda a encontrarlo de un vistazo. Lo que pide
 * hacer algo (pendiente) va en el azul de la casa, lo que está en marcha va lleno y lo cerrado, apagado.
 */
const STATUS_STYLE: Record<ReservationStatus, string> = {
  pending: 'border-brand text-brand',
  confirmed: 'border-brand bg-brand text-cream',
  seated: 'border-ink bg-ink text-cream',
  completed: 'border-ink/30 text-ink/70',
  cancelled: 'border-dashed border-ink/40 text-ink/70',
  no_show: 'border-dashed border-ink/40 text-ink/70'
}

export function StatusTag ({ status }: { status: ReservationStatus }) {
  return (
    <span className={`inline-block shrink-0 border px-1.5 py-0.5 font-mono2 text-[11px] uppercase leading-4 tracking-wider ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

/** Aviso de que algo ha fallado, con qué hacer. Se anuncia a los lectores de pantalla en cuanto aparece. */
export function ErrorNotice ({ children, action }: { children: ReactNode, action?: ReactNode }) {
  return (
    <div role='alert' className='flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-l-2 border-ink bg-surface px-4 py-3'>
      <p className='min-w-0 text-sm text-ink'>{children}</p>
      {action}
    </div>
  )
}

/** Lo que se ve cuando no hay nada que listar: qué pasa y, si viene al caso, cómo se llena. */
export function EmptyState ({ title, hint }: { title: string, hint?: string }) {
  return (
    <div className='border-y border-ink/15 py-12'>
      <p className='font-display text-2xl leading-[1.2] text-ink'>{title}</p>
      {hint != null && <p className='mt-2 max-w-prose text-sm text-ink/70'>{hint}</p>}
    </div>
  )
}

/**
 * Filas de espera con la forma de la lista que va a llegar, para que al cargar no salte nada de sitio.
 * El parpadeo solo existe si no se ha pedido reducir el movimiento.
 */
export function SkeletonRows ({ rows, label }: { rows: number, label: string }) {
  return (
    <div role='status' className='divide-y divide-ink/10 border-y border-ink/15'>
      <span className='sr-only'>{label}</span>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} aria-hidden='true' className='grid grid-cols-[4rem_minmax(0,1fr)] gap-x-5 py-5 motion-safe:animate-pulse'>
          <div className='h-6 w-12 bg-ink/10' />
          <div className='space-y-2.5'>
            <div className='h-5 w-2/5 bg-ink/10' />
            <div className='h-4 w-3/5 bg-ink/10' />
          </div>
        </div>
      ))}
    </div>
  )
}
