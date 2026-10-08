import { useI18n } from '@/i18n'

/**
 * Aviso de que algo no ha podido cargarse, con la salida que casi siempre lo arregla: recargar. Una carga
 * nueva vuelve a pedir la página y, con ella, los nombres actuales de sus archivos.
 * Es el `fallback` de los límites de error (ErrorBoundary) y el cuerpo de la página de error de las rutas.
 */
export function LoadError ({ message, className = '' }: { message: string, className?: string }) {
  const { t } = useI18n()

  return (
    <div className={`flex flex-col items-center justify-center gap-6 px-6 text-center ${className}`}>
      <p className='max-w-[26ch] font-display text-2xl leading-[1.15] tracking-[-0.02em] text-ink'>{message}</p>
      <button
        type='button'
        onClick={() => window.location.reload()}
        className='press inline-flex min-h-12 items-center rounded-full bg-ink px-6 font-body text-sm font-semibold text-cream transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand motion-reduce:transition-none'
      >
        {t.loadError.reload}
      </button>
    </div>
  )
}
