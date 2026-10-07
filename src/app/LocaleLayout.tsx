import { useEffect } from 'react'
import { Navigate, Outlet, useLocation, useParams } from 'react-router'
import { I18nProvider, LOCALES, DEFAULT_LOCALE, type Locale, useI18n } from '@/i18n'
import { LocaleSeo } from '@/components/Seo'
import { Nav, Footer, ReserveModal } from '@/components/layout'
import { DataVariantToggle } from '@/dev/DataVariantToggle'

/** Shell interno que SÍ tiene acceso a useI18n (vive dentro del provider). */
function LocaleShell () {
  const { t } = useI18n()
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) { window.scrollTo(0, 0); return }
    const el = document.getElementById(location.hash.slice(1))
    el?.scrollIntoView()
  }, [location])

  return (
    <>
      <LocaleSeo />
      <a
        href='#main'
        className='sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-ink focus:px-4 focus:py-2 focus:font-mono2 focus:text-[11px] focus:uppercase focus:tracking-widest focus:text-cream'
      >
        {t.skip.content}
      </a>
      <Nav />
      <ReserveModal />
      <main id='main'>
        <Outlet />
      </main>
      <Footer />
      {import.meta.env.DEV && <DataVariantToggle />}
    </>
  )
}

export function LocaleLayout () {
  const { locale: param } = useParams<{ locale: string }>()
  const valid = param && (LOCALES as string[]).includes(param)

  if (!valid) return <Navigate to={`/${DEFAULT_LOCALE}`} replace />
  const locale = param as Locale

  return (
    <I18nProvider locale={locale}>
      <LocaleShell />
    </I18nProvider>
  )
}
