import { useI18n } from '@/i18n'

/**
 * Enlace de pie de página: vuelve arriba sin flotar sobre el contenido ni tapar precios.
 * `inverted` lo pinta en claro para fondos de color (el bloque azul del pie).
 */
export function BackToTop ({ inverted = false }: { inverted?: boolean }) {
  const { t } = useI18n()

  return (
    <button
      type='button'
      onClick={() => window.scrollTo({ top: 0 })}
      className={`press inline-flex min-h-11 items-center gap-2 font-mono2 text-[11px] uppercase tracking-[0.12em] transition-colors motion-reduce:transition-none ${
        inverted ? 'text-cream/85 hover:text-cream' : 'text-ink/60 hover:text-ink'
      }`}
    >
      <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' className='h-4 w-4' aria-hidden='true'>
        <path d='M12 19V5M5 12l7-7 7 7' />
      </svg>
      {t.backToTop.label}
    </button>
  )
}
