import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { LogOut } from 'lucide-react'
import { Logo } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { QUIET } from './styles'
import { SkeletonRows } from './ui'

/** Las secciones del panel. `also` son otras direcciones que llevan a la misma pantalla. */
const SECTIONS = [
  { to: '/admin/dashboard', label: 'Reservas', also: ['/admin', '/admin/'] },
  { to: '/admin/blocks', label: 'Cierres', also: [] as string[] }
]

/**
 * Marco del panel: comprueba que hay sesión antes de enseñar nada y pone la cabecera con las secciones.
 * Mientras lo comprueba ya se ve el marco, con filas de espera en el sitio del contenido, para que la
 * pantalla no cambie de forma al entrar.
 */
export function AdminLayout () {
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/admin/login', { replace: true })
      } else {
        setChecking(false)
      }
    }
    void checkAuth()
  }, [navigate])

  const handleLogout = async (): Promise<void> => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className='min-h-svh bg-cream'>
      <a
        href='#contenido'
        className='sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-cream'
      >
        Saltar al contenido
      </a>

      <header className='border-b border-ink/15 bg-surface pt-[env(safe-area-inset-top)]'>
        <div className='mx-auto flex max-w-5xl flex-wrap items-center gap-x-8 px-4 sm:px-6'>
          <Link to='/admin/dashboard' className='flex min-h-14 items-center gap-3'>
            <Logo className='text-xl' />
            <span className='font-mono2 text-[11px] uppercase tracking-widest text-ink/70'>Panel</span>
          </Link>

          {/* En pantallas estrechas las secciones bajan a su propia fila, de lado a lado */}
          <nav aria-label='Secciones del panel' className='order-3 -mx-1 flex w-full gap-1 sm:order-none sm:w-auto'>
            {SECTIONS.map(({ to, label, also }) => {
              const current = pathname.startsWith(to) || also.includes(pathname)
              return (
                <Link
                  key={to}
                  to={to}
                  aria-current={current ? 'page' : undefined}
                  className={`press inline-flex min-h-11 items-center border-b-2 px-3 text-sm font-medium ${
                    current ? 'border-brand text-ink' : 'border-transparent text-ink/70 hover:text-ink'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          <button type='button' onClick={() => { void handleLogout() }} className={`${QUIET} ml-auto`}>
            <LogOut aria-hidden='true' size={16} strokeWidth={1.8} />
            Salir
          </button>
        </div>
      </header>

      <main id='contenido' className='mx-auto max-w-5xl px-4 pb-[calc(4rem+env(safe-area-inset-bottom))] pt-8 sm:px-6 sm:pt-10'>
        {checking ? <SkeletonRows rows={3} label='Comprobando la sesión…' /> : <Outlet />}
      </main>
    </div>
  )
}
