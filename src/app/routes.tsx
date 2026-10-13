import { Navigate, useLocation, type RouteObject } from 'react-router'
import { RootLayout } from './RootLayout'
import { LocaleLayout } from './LocaleLayout'
import { HomePage } from './HomePage'
import { NotFoundPage } from './NotFoundPage'
import { RouteError } from './RouteError'
import { detectLocale } from '@/i18n'
import { AdminLoadError, AdminShell } from './AdminShell'
import { AdminLayout, BlocksPage, DashboardPage, LoginPage } from './adminPages'

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
  },
  {
    path: '/admin',
    element: <AdminShell />,
    errorElement: <AdminLoadError />,
    children: [
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'blocks', element: <BlocksPage /> }
        ]
      }
    ]
  }
]
