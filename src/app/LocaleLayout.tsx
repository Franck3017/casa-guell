import { useEffect, useRef } from 'react'
import { Navigate, Outlet, useLocation, useParams } from 'react-router'
import { I18nProvider, LOCALES, DEFAULT_LOCALE, type Locale, useI18n } from '@/i18n'
import { LocaleSeo } from '@/components/Seo'
import { pageOf } from '@/components/Seo/pageMeta'
import { Nav, Footer, ReserveModal } from '@/components/layout'
import { DataVariantToggle } from '@/dev/DataVariantToggle'
import { scrollOnArrival, type Place } from './scrollPolicy'

/** Shell interno que SÍ tiene acceso a useI18n (vive dentro del provider). */
function LocaleShell () {
  const { t, locale } = useI18n()
  const location = useLocation()
  const place = useRef<Place | null>(null)

  // Corre antes de que la transición de cambio de página fotografíe la pantalla nueva: por eso a otra
  // página se llega de un salto, y lo que se funde son dos pantallas quietas.
  useEffect(() => {
    const here: Place = { locale, page: pageOf(locale, location.pathname) }
    const arrival = scrollOnArrival(place.current, here)
    place.current = here
    if (arrival === 'keep') return

    const behavior = arrival === 'jump' ? 'instant' : 'auto'
    if (!location.hash) { window.scrollTo({ top: 0, behavior }); return }
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior })
  }, [location, locale])

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
