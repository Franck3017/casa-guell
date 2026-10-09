import { BASE_URL, OG_IMAGE } from '@/components/Seo'
import type { Locale } from '@/i18n'
import { COORDS, PHONE_INTL } from '@/lib/place'
import { SOCIAL_LINKS } from '@/lib/social'

/** `description` llega ya en el idioma de la página; `menu` y `hasMap` apuntan a sus secciones en ese idioma. */
export function restaurantSchema (locale: Locale, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Casa Güell',
    description,
    servesCuisine: ['Catalan', 'Spanish', 'Mediterranean'],
    priceRange: '€€',
    telephone: PHONE_INTL,
    acceptsReservations: 'True',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Carrer de Castella, 1',
      addressLocality: 'Barcelona',
      addressRegion: 'Catalunya',
      postalCode: '08018',
      addressCountry: 'ES'
    },
    geo: { '@type': 'GeoCoordinates', ...COORDS },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '13:00',
        closes: '00:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday'],
        opens: '13:00',
        closes: '18:00'
      }
    ],
    image: [OG_IMAGE],
    url: `${BASE_URL}/${locale}`,
    menu: `${BASE_URL}/${locale}#carta`,
    hasMap: `${BASE_URL}/${locale}#ubicacio`,
    sameAs: SOCIAL_LINKS.map((s) => s.href)
  }
}

export function websiteSchema (locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Casa Güell',
    url: BASE_URL,
    inLanguage: locale
  }
}
