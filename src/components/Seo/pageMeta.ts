import { BASE_URL } from '@/components/Seo'
import type { Locale } from '@/i18n'
import type { Messages } from '@/i18n/types'

/** Las páginas que hay dentro de cada idioma, por lo que va detrás de /<idioma>: la portada y la información legal. */
export const PAGES = ['', '/legal'] as const
export type PagePath = (typeof PAGES)[number]

/** Lo que se pide a los buscadores: indexar las páginas que existen y no hacerlo con las rutas que no. */
export const ROBOTS = { index: 'index, follow, max-image-preview:large', noindex: 'noindex, follow' } as const

/** Qué página es una ruta, o null si no es ninguna (y entonces se pinta la de «no encontrado»). */
export function pageOf (locale: Locale, pathname: string): PagePath | null {
  const rest = pathname.replace(/\/$/, '').slice(`/${locale}`.length)
  return (PAGES as readonly string[]).includes(rest) ? rest as PagePath : null
}

/**
 * Lo que va en el <head> de una página: título, descripción, dirección canónica y si se indexa. Lo
 * escriben igual el navegador y el prerenderizado. Una ruta que no existe (null) se presenta como la
 * portada, que es adonde lleva su canónica, pero no se indexa.
 */
export function pageMeta (locale: Locale, t: Messages, page: PagePath | null) {
  const legal = page === '/legal'
  return {
    title: legal ? `${t.legal.title} · Casa Güell` : t.meta.title,
    description: legal ? t.legal.intro : t.meta.description,
    canonical: `${BASE_URL}/${locale}${page ?? ''}`,
    robots: page == null ? ROBOTS.noindex : ROBOTS.index
  }
}
