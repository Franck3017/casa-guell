import { useRef, useState } from 'react'
import { FORMSPREE_ENDPOINT, SUBMIT_TIMEOUT_MS } from '@/lib/forms'

export type SubmitStatus = 'idle' | 'sending' | 'success' | 'error'

/**
 * Envío de un formulario a Formspree con su estado. Protege de envíos repetidos, corta la petición si
 * tarda demasiado y distingue una cancelación manual (`cancel`, no es un error) de un fallo real.
 */
export function useFormspreeSubmit () {
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const abortRef = useRef<AbortController | null>(null)
  const sendingRef = useRef(false)

  const send = async (form: HTMLFormElement): Promise<void> => {
    // La ref bloquea envíos repetidos dentro del mismo ciclo, antes de que `status` se actualice.
    if (sendingRef.current) return
    sendingRef.current = true
    setStatus('sending')
    const controller = new AbortController()
    abortRef.current = controller
    let timedOut = false
    const timer = window.setTimeout(() => { timedOut = true; controller.abort() }, SUBMIT_TIMEOUT_MS)
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
        signal: controller.signal
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      // Cancelación manual: no es un error. Red caída o tiempo agotado sí lo son.
      if (!controller.signal.aborted || timedOut) setStatus('error')
    } finally {
      window.clearTimeout(timer)
      sendingRef.current = false
    }
  }

  return {
    status,
    send,
    /** Corta la petición en curso (por ejemplo, al cerrar el diálogo). */
    cancel: () => abortRef.current?.abort(),
    reset: () => setStatus('idle')
  }
}
