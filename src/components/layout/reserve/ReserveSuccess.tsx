import { useI18n } from '@/i18n'

/** Mensaje que sustituye al formulario cuando la solicitud de reserva se ha enviado. */
export function ReserveSuccess ({ onClose }: { onClose: () => void }) {
  const { t } = useI18n()

  return (
    <div role='status' className='state-in mt-6'>
      <p className='font-display text-lg text-ink'>{t.reserve.success}</p>
      <p className='mt-2 text-sm text-ink/70'>{t.reserve.successDesc}</p>
      <button
        type='button'
        onClick={onClose}
        className='press mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-ink/15 px-6 font-body text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand motion-reduce:transition-none'
      >
        {t.reserve.close}
      </button>
    </div>
  )
}
