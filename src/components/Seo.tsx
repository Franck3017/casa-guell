import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { LOCALES, DEFAULT_LOCALE, useI18n, type Locale } from '@/i18n'
import { restaurantSchema, websiteSchema } from './Seo/structuredData'

export const BASE_URL = 'https://casa-guell-drab.vercel.app'
/** Imagen para compartir (1200×630). La misma ruta va escrita en index.html para quien no ejecuta JS. */
export const OG_IMAGE = `${BASE_URL}/assets/img/og-casa-guell.jpg`
const OG_LOCALE: Record<Locale, string> = { ca: 'ca_ES', es: 'es_ES', en: 'en_US' }

function upsertMeta (attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (el == null) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink (rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`
  let el = document.head.querySelector<HTMLLinkElement>(selector)
  if (el == null) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    if (hreflang) el.setAttribute('hreflang', hreflang)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setJsonLd (id: string, data: unknown) {
  let el = document.getElementById(id) as HTMLScriptElement | null
  if (el == null) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

export function LocaleSeo () {
  const { locale, t } = useI18n()
  const location = useLocation()

  useEffect(() => {
    // La web tiene una sola página por idioma: cualquier otra ruta es la de "no encontrado". El servidor
    // la entrega con 200 (es una SPA), así que se marca noindex y su canónica apunta a la portada.
    const notFound = location.pathname.replace(/\/$/, '') !== `/${locale}`
    const canonical = `${BASE_URL}/${locale}`
    const title = t.meta.title
    const desc = t.meta.description
    const ogImage = OG_IMAGE

    // --- Básicos ---
    document.documentElement.lang = locale
    document.title = title
    upsertMeta('name', 'description', desc)
    upsertMeta('name', 'robots', notFound ? 'noindex, follow' : 'index, follow, max-image-preview:large')

    // --- Open Graph ---
    upsertMeta('property', 'og:site_name', 'Casa Güell')
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', desc)
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:locale', OG_LOCALE[locale])
    upsertMeta('property', 'og:image', ogImage)
    upsertMeta('property', 'og:image:width', '1200')
    upsertMeta('property', 'og:image:height', '630')
    upsertMeta('property', 'og:image:alt', title)

    // og:locale:alternate (los otros dos idiomas)
    LOCALES.filter((l) => l !== locale).forEach((l, i) => {
      const sel = `meta[property="og:locale:alternate"][data-idx="${i}"]`
      let el = document.head.querySelector<HTMLMetaElement>(sel)
      if (el == null) {
        el = document.createElement('meta')
        el.setAttribute('property', 'og:locale:alternate')
        el.setAttribute('data-idx', String(i))
        document.head.appendChild(el)
      }
      el.setAttribute('content', OG_LOCALE[l])
    })

    // --- Twitter Cards ---
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', desc)
    upsertMeta('name', 'twitter:image', ogImage)

    // --- Canonical + hreflang ---
    upsertLink('canonical', canonical)
    for (const l of LOCALES) upsertLink('alternate', `${BASE_URL}/${l}`, l)
    upsertLink('alternate', `${BASE_URL}/${DEFAULT_LOCALE}`, 'x-default')

    // --- Structured Data ---
    setJsonLd('ld-restaurant', restaurantSchema(locale, desc))
    setJsonLd('ld-website', websiteSchema(locale))
  }, [locale, t, location.pathname])

  return null
}
