import type { PagePath } from '@/components/Seo/pageMeta'
import type { Locale } from '@/i18n'

/** Dónde se está: en qué idioma y en qué página (null si la ruta no existe). */
export interface Place { locale: Locale, page: PagePath | null }

/**
 * Qué hacer con el scroll cuando cambia la dirección:
 * - `jump`: es otra página. Se llega ya colocado, de un salto: la transición funde dos pantallas quietas.
 * - `keep`: es la misma página en otro idioma. Se queda donde estaba.
 * - `glide`: misma página (otra ancla) o primera carga. Se va con el desplazamiento suave de la web.
 */
export function scrollOnArrival (from: Place | null, to: Place): 'jump' | 'keep' | 'glide' {
  if (from == null) return 'glide'
  if (from.page !== to.page) return 'jump'
  return from.locale !== to.locale ? 'keep' : 'glide'
}
