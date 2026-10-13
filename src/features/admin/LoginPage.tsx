import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Logo } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { signInErrorMessage } from './reservations'
import { FIELD, LABEL, PRIMARY } from './styles'
import { useDocumentTitle } from './useDocumentTitle'

/** Entrada al panel. Quien ya tiene la sesión abierta pasa directamente a las reservas. */
export function LoginPage () {
  useDocumentTitle('Entrar')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const emailId = useId()
  const passwordId = useId()
  const errorId = useId()
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/admin/dashboard', { replace: true })
    })
  }, [navigate])

  const handleLogin = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    setSending(true)
    setError(null)

    const { error: failure } = await supabase.auth.signInWithPassword({ email, password })

    if (failure) {
      setError(signInErrorMessage(failure))
      setSending(false)
      // El foco vuelve al primer campo: es donde se empieza a corregir, y así el aviso se oye en su contexto
      emailRef.current?.focus()
    } else {
      navigate('/admin/dashboard')
    }
  }

  return (
    <main className='flex min-h-svh items-center justify-center bg-cream px-4 py-[max(2rem,env(safe-area-inset-top))]'>
      <div className='w-full max-w-sm'>
        <Logo className='text-3xl' />

        <div className='mt-8 border border-ink/15 bg-surface p-6 sm:p-8'>
          <h1 className='font-display text-2xl text-ink'>Panel del restaurante</h1>
          <p className='mt-2 text-sm text-ink/70'>Reservas del día y cierres.</p>

          <form onSubmit={(e) => { void handleLogin(e) }} className='mt-6 space-y-5'>
            <div className='space-y-1.5'>
              <label htmlFor={emailId} className={LABEL}>Correo</label>
              <input
                ref={emailRef}
                id={emailId}
                type='email'
                name='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete='username'
                inputMode='email'
                autoCapitalize='none'
                spellCheck={false}
                aria-invalid={error != null || undefined}
                aria-describedby={error != null ? errorId : undefined}
                className={`${FIELD} w-full`}
              />
            </div>

            <div className='space-y-1.5'>
              <label htmlFor={passwordId} className={LABEL}>Contraseña</label>
              <input
                id={passwordId}
                type='password'
                name='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete='current-password'
                aria-invalid={error != null || undefined}
                aria-describedby={error != null ? errorId : undefined}
                className={`${FIELD} w-full`}
              />
            </div>

            {error != null && (
              <p id={errorId} role='alert' className='border-l-2 border-ink pl-3 text-sm text-ink'>{error}</p>
            )}

            <button type='submit' disabled={sending} className={`${PRIMARY} w-full`}>
              {sending ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
