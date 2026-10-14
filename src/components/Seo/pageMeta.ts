import { BASE_URL } from '@/components/Seo'
import type { Locale } from '@/i18n'
import type { Messages } from '@/i18n/types'

/** Las páginas que hay dentro de cada idioma, por lo que va detrás de /<idioma>: la portada y la información legal. */
export const PAGES = ['', '/legal'] as const
export type PagePath = (typeof PAGES)[number]

/** Qué página es una ruta, o null si no es ninguna (y entonces se pinta la de «no encontrado»). */
export function pageOf (locale: Locale, pathname: string): PagePath | null {
  const rest = pathname.replace(/\/$/, '').slice(`/${locale}`.length)
  return (PAGES as readonly string[]).includes(rest) ? rest as PagePath : null
}

/** Título, descripción y dirección canónica de una página. Los escriben igual el navegador y el prerenderizado. */
export function pageMeta (locale: Locale, t: Messages, page: PagePath) {
  const legal = page === '/legal'
  return {
    title: legal ? `${t.legal.title} · Casa Güell` : t.meta.title,
    description: legal ? t.legal.intro : t.meta.description,
    canonical: `${BASE_URL}/${locale}${page}`
  }
}
