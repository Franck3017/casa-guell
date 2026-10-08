import { useLocation } from 'react-router'
import { LoadError, Logo } from '@/components/ui'
import { DEFAULT_LOCALE, I18nProvider, LOCALES, useI18n, type Locale } from '@/i18n'

function RouteErrorMessage () {
  const { t } = useI18n()
  return (
    <main className='flex min-h-svh flex-col items-center justify-center gap-10 py-16'>
      <Logo className='text-[2.5rem]' />
      <LoadError message={t.loadError.page} />
    </main>
  )
}

/**
 * Página de último recurso: lo que se ve si algo revienta al pintar y ningún límite más cercano lo
 * contiene. Sustituye a la pantalla de error de React Router, que enseña el mensaje técnico en inglés.
 * Se pinta en lugar de los layouts, así que toma el idioma de la URL y monta su propio proveedor; el tema
 * ya lo ha puesto en <html> el script de index.html.
 */
export function RouteError () {
  const segment = useLocation().pathname.split('/')[1]
  const locale = (LOCALES as string[]).includes(segment) ? segment as Locale : DEFAULT_LOCALE

  return (
    <I18nProvider locale={locale}>
      <RouteErrorMessage />
    </I18nProvider>
  )
}
