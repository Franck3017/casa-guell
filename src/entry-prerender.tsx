// Entrada del prerenderizado. No se carga en el navegador: `vite build --ssr` la compila para Node y
// scripts/prerender.mjs la usa al final del build para escribir un HTML completo por idioma.
import { prerenderToNodeStream } from 'react-dom/static'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router'
import { routes } from '@/app/routes'
import { BASE_URL, OG_IMAGE } from '@/components/Seo'
import { PAGES, pageMeta, type PagePath } from '@/components/Seo/pageMeta'
import { restaurantSchema, websiteSchema } from '@/components/Seo/structuredData'
import { LOCALES, type Locale } from '@/i18n'
import { ca } from '@/i18n/locales/ca'
import { en } from '@/i18n/locales/en'
import { es } from '@/i18n/locales/es'

const DICTS = { ca, es, en }
const OG_LOCALE: Record<Locale, string> = { ca: 'ca_ES', es: 'es_ES', en: 'en_US' }

export { LOCALES, PAGES }

/**
 * HTML de una página (la portada o la información legal) en un idioma. El navegador lo adopta tal cual
 * (hydrateRoot en main.tsx), así que tiene que coincidir con el primer render de allí: nada de lo que se
 * pinta aquí puede depender de quien visita.
 */
export async function renderPage (locale: Locale, page: PagePath = ''): Promise<string> {
  const route = `/${locale}${page}`
  const handler = createStaticHandler(routes)
  const context = await handler.query(new Request(`${BASE_URL}${route}`))
  if (context instanceof Response) throw new Error(`La ruta ${route} respondió con una redirección`)
  const router = createStaticRouter(handler.dataRoutes, context)

  const { prelude } = await prerenderToNodeStream(
    // hydrate={false} solo evita el <script> con datos de rutas, que aquí no hay (ninguna ruta tiene loader)
    <StaticRouterProvider router={router} context={context} hydrate={false} />,
    {
      // React aparta los bloques grandes que esperan código (la información legal lo es) y los coloca
      // después con un script. Aquí no hay nada que adelantar: todo va en su sitio, legible sin JavaScript.
      progressiveChunkSize: Infinity,
      // Un bloque que no pudiera pintarse sin navegador se quedaría con su esqueleto: no es un fallo del build.
      onError: (error) => { console.warn(`  [prerender ${route}] bloque dejado para el navegador:`, (error as Error).message) }
    }
  )

  const chunks: Buffer[] = []
  for await (const chunk of prelude) chunks.push(Buffer.from(chunk as Buffer))
  return Buffer.concat(chunks).toString('utf8')
}

/** Lo que va en el <head> de cada página. Mismos valores que escribe Seo.tsx en el navegador. */
export function headFor (locale: Locale, page: PagePath = '') {
  const dict = DICTS[locale]
  return {
    ...pageMeta(locale, dict, page),
    ogLocale: OG_LOCALE[locale],
    ogImage: OG_IMAGE,
    jsonLd: {
      'ld-restaurant': restaurantSchema(locale, dict.meta.description),
      'ld-website': websiteSchema(locale)
    }
  }
}
