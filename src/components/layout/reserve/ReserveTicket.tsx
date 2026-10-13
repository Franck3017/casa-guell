import { Logo } from '@/components/ui'

export interface TicketRow {
  label: string
  /** Vacío mientras no se ha elegido: la línea de puntos llega hasta el borde, como en un tique por rellenar. */
  value: string
}

interface ReserveTicketProps {
  /** Lo que va bajo el logotipo: de qué es el tique. */
  heading: string
  rows: TicketRow[]
  /** El código de la reserva hecha; con él el tique queda cerrado. */
  code?: { label: string, value: string }
}

/**
 * La reserva como un tique de la casa: el mismo papel de caja registradora del pie de la web, con el
 * logotipo arriba, cada dato en su línea de puntos y el borde inferior cortado en dientes de sierra.
 * Mientras se rellena el formulario se va completando solo; al enviarlo recibe su código.
 * La sombra va en el envoltorio: la máscara dentada del papel recortaría una sombra puesta en él.
 */
export function ReserveTicket ({ heading, rows, code }: ReserveTicketProps) {
  return (
    <div className='drop-shadow-[0_10px_22px_rgb(0_0_0/0.22)] dark:drop-shadow-[0_10px_26px_rgb(0_0_0/0.7)]'>
      <div className='receipt bg-surface px-6 pb-9 pt-6 font-mono2 text-xs leading-snug text-ink dark:bg-[color-mix(in_srgb,var(--cg-surface)_86%,var(--cg-ink))]'>
        <div className='flex flex-col items-center gap-2 border-b border-dashed border-ink/30 pb-5 text-center'>
          <Logo className='text-2xl' />
          <p className='text-[11px] uppercase tracking-[0.18em] text-ink/70'>{heading}</p>
        </div>

        <dl className='py-2'>
          {rows.map(({ label, value }) => (
            <div key={label} className='flex items-baseline py-2'>
              <dt className='shrink-0 text-ink/70'>{label}</dt>
              <span aria-hidden='true' className='leader min-w-4' />
              {/* Un nombre largo parte en dos líneas antes que comerse la etiqueta */}
              <dd className='min-w-0 max-w-[62%] break-words text-right first-letter:uppercase'>{value}</dd>
            </div>
          ))}
        </dl>

        {code != null && (
          <p className='border-t border-dashed border-ink/30 pt-4 text-center'>
            <span className='block text-[11px] uppercase tracking-[0.18em] text-ink/70'>{code.label}</span>
            {/* El código real es largo (CG-2026-0006): va en una sola línea, que es como se dicta por teléfono */}
            <span className='mt-1.5 block whitespace-nowrap text-xl tracking-[0.18em] text-brand' translate='no'>{code.value}</span>
          </p>
        )}
      </div>
    </div>
  )
}
