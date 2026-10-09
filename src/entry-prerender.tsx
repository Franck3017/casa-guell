// Entrada del prerenderizado. No se carga en el navegador: `vite build --ssr` la compila para Node y
// scripts/prerender.mjs la usa al final del build para escribir un HTML completo por idioma.
import { prerenderToNodeStream } from 'react-dom/static'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router'
import { routes } from '@/app/routes'
import { BASE_URL, OG_IMAGE } from '@/components/Seo'
import { restaurantSchema, websiteSchema } from '@/components/Seo/structuredData'
import { LOCALES, type Locale } from '@/i18n'
import { ca } from '@/i18n/locales/ca'
import { en } from '@/i18n/locales/en'
import { es } from '@/i18n/locales/es'
import { HERO_PORTRAIT } from '@/lib/constants'

const DICTS = { ca, es, en }
const OG_LOCALE: Record<Locale, string> = { ca: 'ca_ES', es: 'es_ES', en: 'en_US' }

export { LOCALES }

/** HTML de la portada en un idioma, con el contenido diferido (la carta) ya resuelto. */
export async function renderPage (locale: Locale): Promise<string> {
  const handler = createStaticHandler(routes)
  const context = await handler.query(new Request(`${BASE_URL}/${locale}`))
  if (context instanceof Response) throw new Error(`La ruta /${locale} respondió con una redirección`)
  const router = createStaticRouter(handler.dataRoutes, context)

  const { prelude } = await prerenderToNodeStream(
    <StaticRouterProvider router={router} context={context} hydrate={false} />,
    {
      // Un bloque que no puede pintarse sin navegador (el mapa) se queda con su esqueleto: no es un fallo del build.
      onError: (error) => { console.warn(`  [prerender ${locale}] bloque dejado para el navegador:`, (error as Error).message) }
    }
  )

  const chunks: Buffer[] = []
  for await (const chunk of prelude) chunks.push(Buffer.from(chunk as Buffer))
  return Buffer.concat(chunks).toString('utf8')
}

/** Lo que va en el <head> de cada idioma. Mismos valores que escribe Seo.tsx en el navegador. */
export function headFor (locale: Locale) {
  const { title, description } = DICTS[locale].meta
  return {
    title,
    description,
    canonical: `${BASE_URL}/${locale}`,
    ogLocale: OG_LOCALE[locale],
    ogImage: OG_IMAGE,
    heroImage: HERO_PORTRAIT,
    jsonLd: {
      'ld-restaurant': restaurantSchema(locale, description),
      'ld-website': websiteSchema(locale)
    }
  }
}
