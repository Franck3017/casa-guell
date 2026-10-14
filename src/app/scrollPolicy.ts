import type { PagePath } from '@/components/Seo/pageMeta'
import type { Locale } from '@/i18n'

/** Dónde se está: en qué idioma y en qué página (null si la ruta no existe). */
export interface Place { locale: Locale, page: PagePath | null }

/**
 * Qué hacer con el scroll cuando cambia la dirección:
 * - `restore`: es otra página y ya se estuvo en esta entrada del historial («atrás» o «adelante»). Se
 *   vuelve a donde se dejó.
 * - `jump`: es otra página, por primera vez. Se llega ya colocado, de un salto: la transición funde dos
 *   pantallas quietas.
 * - `keep`: es la misma página en otro idioma. Se queda donde estaba.
 * - `glide`: misma página (otra ancla) o primera carga. Se va con el desplazamiento suave de la web.
 *
 * `remembered` dice si hay un scroll guardado para la entrada a la que se llega. Dentro de una misma
 * página no cuenta: las anclas del menú crean entradas que el historial no distingue de la que se deja.
 */
export function scrollOnArrival (from: Place | null, to: Place, remembered = false): 'restore' | 'jump' | 'keep' | 'glide' {
  if (from == null) return 'glide'
  if (from.page !== to.page) return remembered ? 'restore' : 'jump'
  return from.locale !== to.locale ? 'keep' : 'glide'
}
