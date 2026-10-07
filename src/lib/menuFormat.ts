import type { Locale } from '@/i18n'

const INTL_LOCALE: Record<Locale, string> = { ca: 'ca-ES', es: 'es-ES', en: 'en-GB' }

/** Partículas que van en minúscula dentro de un nombre de plato (es/ca). */
const SMALL_WORDS = new Set([
  'a', 'al', 'amb', 'con', 'de', 'del', 'el', 'en', 'i', 'la', 'las', 'los', 'o', 'para', 'por', 'sin', 'y'
])

/** Siglas que se mantienen en mayúsculas. */
const ACRONYMS = new Set(['AOVE', 'IGP', 'DO', 'DOP'])

/** Elide d'/l' en minúscula y pone mayúscula inicial al resto de la palabra. */
function capitalizeWord (word: string): string {
  const lower = word.toLowerCase()
  const apostrophe = lower.search(/['’]/)
  if (apostrophe > 0 && apostrophe < lower.length - 1) {
    const head = lower.slice(0, apostrophe + 1)
    const tail = lower.slice(apostrophe + 1)
    return head + tail.charAt(0).toUpperCase() + tail.slice(1)
  }
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

/**
 * Nombre de plato para mostrar: los nombres que llegan en MAYÚSCULAS pasan a
 * Title Case; los que ya traen minúsculas se respetan. Quita barras sueltas
 * al final del texto de origen.
 */
export function displayName (raw: string): string {
  const clean = raw.replace(/\s*\\+\s*$/, '').trim()
  if (/[a-zà-öø-ÿ]/.test(clean)) return clean

  return clean
    .split(/(\s+)/)
    .map((part, i, all) => {
      if (/^\s+$/.test(part) || part === '') return part
      const bare = part.replace(/[(),]/g, '')
      if (part.includes('&') || ACRONYMS.has(bare)) return part
      const leading = part.match(/^\(+/)?.[0] ?? ''
      const isFirst = all.slice(0, i).every((p) => /^\s*$/.test(p) || p === '')
      const lower = bare.toLowerCase()
      if (!isFirst && leading === '' && SMALL_WORDS.has(lower)) {
        return part.replace(bare, lower)
      }
      return part.replace(bare, capitalizeWord(bare))
    })
    .join('')
}

/**
 * Precio para mostrar con el formato numérico de la lengua activa.
 * Los datos mezclan "12.00 €" y "12,00 €": se lee el importe y se vuelve a formatear.
 */
export function formatPrice (raw: string, locale: Locale): string {
  const amount = parseAmount(raw)
  if (amount == null) return raw
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    // 'always' agrupa también los miles de 4 cifras (en es/ca la norma los deja sin agrupar: 1284,50)
    useGrouping: 'always' as unknown as boolean
  }).format(amount)
}

/**
 * Lee un importe de texto con cualquier convención: "12.00 €", "12,50 €", "1.284,00 €", "1284.50 €".
 * El último separador es decimal solo si le siguen 1 o 2 cifras; los demás son miles.
 */
function parseAmount (raw: string): number | null {
  const token = raw.match(/\d[\d.,]*/)?.[0].replace(/[.,]$/, '')
  if (token == null) return null
  const decimals = token.match(/[.,](\d{1,2})$/)
  if (decimals == null) return Number(token.replace(/[.,]/g, ''))
  const integer = token.slice(0, token.length - decimals[0].length).replace(/[.,]/g, '')
  return Number(`${integer}.${decimals[1]}`)
}

/** Horario para mostrar: "13:00 — 00:00" → "13:00 - 00:00" (el dato de origen lleva raya larga). */
export function plainHours (raw: string): string {
  return raw.replace(/\s*[—–]\s*/, ' - ')
}
