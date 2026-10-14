import type { Locale } from '@/i18n'
import { ca } from './ca'
import { es } from './es'
import type { LegalContent } from './types'

export { LEGAL_DOC_IDS, type LegalContent, type LegalDoc, type LegalDocId } from './types'

/** El idioma en que están escritos los documentos que se enseñan en cada idioma de la web. */
export const legalLang = (locale: Locale): 'ca' | 'es' => locale === 'ca' ? 'ca' : 'es'

/**
 * Los documentos legales en el idioma de la página. Están en las dos lenguas oficiales; en inglés se
 * enseña el texto en castellano, que es el que vale, y se avisa.
 */
export function contentFor (locale: Locale): LegalContent {
  if (locale === 'ca') return ca
  if (locale === 'es') return es
  return {
    ...es,
    updatedLabel: 'Last updated',
    noticesTitle: 'Before you order',
    fallbackNote: 'These legal texts are written in Spanish and Catalan. The Spanish version is shown below.'
  }
}
