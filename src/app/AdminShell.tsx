import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { Logo } from '@/components/ui'
import { PRIMARY } from '@/components/ui/controls'

/** Envuelve las rutas del panel, que llegan en un trozo aparte (adminPages.ts): mientras llega no hay nada que enseñar todavía. */
export function AdminShell () {
  return (
    <Suspense fallback={null}>
      <Outlet />
    </Suspense>
  )
}

/**
 * Lo que se ve si el panel no llega (un corte de red, una versión nueva publicada con la página abierta) o
 * si algo revienta al pintarlo, en lugar de la pantalla de error de React Router, técnica y en inglés.
 * El panel está solo en castellano, así que el aviso también.
 */
export function AdminLoadError () {
  return (
    <main className='flex min-h-svh flex-col items-center justify-center gap-10 bg-cream px-6 py-16 text-center'>
      <Logo className='text-3xl' />
      <p role='alert' className='max-w-[26ch] font-display text-2xl leading-[1.15] tracking-[-0.02em] text-ink'>No se ha podido cargar el panel.</p>
      <button type='button' onClick={() => window.location.reload()} className={`${PRIMARY} min-h-12`}>Recargar la página</button>
    </main>
  )
}
