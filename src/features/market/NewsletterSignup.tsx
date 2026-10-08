import { useId, useRef, useState } from 'react'
import { useI18n } from '@/i18n'
import { FORMSPREE_ENDPOINT, SUBMIT_TIMEOUT_MS } from '@/lib/forms'

type Status = 'idle' | 'sending' | 'success' | 'error'

/**
 * Alta al aviso diario del producto del día. Va al mismo Formspree que las reservas, con `tipo=newsletter`.
 * Es una tira a dos columnas bajo un filete: a la izquierda qué es, a la derecha el campo. Las columnas
 * coinciden con las de la sección de Mercado (texto y fotos), que es donde vive.
 */
export function NewsletterSignup () {
  const { t } = useI18n()
  const emailId = useId()
  const errId = useId()
  const [status, setStatus] = useState<Status>('idle')
  const sendingRef = useRef(false)

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // La ref bloquea envíos repetidos dentro del mismo ciclo, antes de que `status` se actualice.
    if (sendingRef.current) return
    sendingRef.current = true
    setStatus('sending')

    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS)
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: new FormData(e.currentTarget),
        headers: { Accept: 'application/json' },
        signal: controller.signal
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    } finally {
      window.clearTimeout(timer)
      sendingRef.current = false
    }
  }

  return (
    <div className='mt-20 md:mt-24'>
      <span aria-hidden='true' data-draw className='block h-0.5 bg-ink/60' />
      <div className='grid gap-8 pt-8 md:grid-cols-12 md:gap-x-10 md:pt-10'>
        <div className='md:col-span-5'>
          <h3 className='max-w-[22ch] font-display text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.1] tracking-[-0.025em] text-ink'>
            {t.newsletter.title}
          </h3>
          <p className='mt-3 max-w-[46ch] text-base leading-relaxed text-ink/70'>{t.newsletter.desc}</p>
        </div>

        <div className='md:col-span-7'>
          {status === 'success'
            ? (
              <div role='status' className='state-in'>
                <p className='font-display text-xl text-ink'>{t.newsletter.success}</p>
                <p className='mt-1 text-sm text-ink/70'>{t.newsletter.successDesc}</p>
              </div>
              )
            : (
              <form onSubmit={submit}>
                <input type='hidden' name='tipo' value='newsletter' />
                <input type='hidden' name='_subject' value='Boletín: producto del día' />
                {/* Trampa para bots: un usuario real nunca la rellena */}
                <input type='text' name='_gotcha' tabIndex={-1} autoComplete='off' aria-hidden='true' className='sr-only' />

                <label htmlFor={emailId} className='font-mono2 text-[11px] uppercase tracking-widest text-ink/60'>
                  {t.newsletter.label}
                </label>
                <div className='mt-2 flex flex-col gap-3 sm:flex-row'>
                  <input
                    id={emailId}
                    type='email'
                    name='email'
                    required
                    maxLength={120}
                    autoComplete='email'
                    inputMode='email'
                    placeholder={t.newsletter.placeholder}
                    aria-invalid={status === 'error' || undefined}
                    aria-describedby={status === 'error' ? errId : undefined}
                    className='min-h-12 w-full min-w-0 border border-ink/15 bg-transparent px-3 text-base text-ink outline-none placeholder:text-ink/60 focus:border-brand md:text-sm'
                  />
                  <button
                    type='submit'
                    disabled={status === 'sending'}
                    className='press inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-ink px-6 font-body text-sm font-semibold text-cream transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:opacity-50 motion-reduce:transition-none'
                  >
                    {status === 'sending' ? t.newsletter.sending : t.newsletter.submit}
                  </button>
                </div>

                {status === 'error' && (
                  <p id={errId} role='alert' className='mt-3 text-sm text-ink'>{t.newsletter.error}</p>
                )}
                <p className='mt-3 text-sm text-ink/70'>{t.newsletter.privacy}</p>
              </form>
              )}
        </div>
      </div>
    </div>
  )
}
