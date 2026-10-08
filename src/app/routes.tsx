import { Navigate, useLocation, type RouteObject } from 'react-router'
import { RootLayout } from './RootLayout'
import { LocaleLayout } from './LocaleLayout'
import { HomePage } from './HomePage'
import { NotFoundPage } from './NotFoundPage'
import { RouteError } from './RouteError'
import { detectLocale } from '@/i18n'

function LocaleRedirect () {
  const location = useLocation()
  const locale = detectLocale()
  const rest = location.pathname === '/' ? '' : location.pathname
  return <Navigate to={`/${locale}${rest}${location.hash}`} replace />
}

/**
 * Árbol de rutas, sin crear el router: lo comparten el navegador (router.tsx) y el prerenderizado
 * del build (entry-prerender.tsx), que no tiene DOM y necesita un router estático.
 */
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <LocaleRedirect /> },
      {
        path: '/:locale',
        element: <LocaleLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: '*', element: <NotFoundPage /> }
        ]
      }
    ]
  }
]
