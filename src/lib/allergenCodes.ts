// Qué alérgenos declara un plato, leído de la carta. Código puro, sin nada que pintar: los iconos y la
// leyenda están en allergens.tsx. Sus pruebas, en tests/unit/allergens.test.ts.
import { data } from '@/data'

export type AllergenKey =
  | 'gluten' | 'crustaceo' | 'huevo' | 'pescado' | 'lacteo' | 'soja'
  | 'frutos' | 'apio' | 'mostaza' | 'sesamo' | 'sulfitos' | 'molusco' | 'altramuz'

export const ALLERGEN_KEYS: AllergenKey[] = [
  'gluten', 'crustaceo', 'huevo', 'pescado', 'lacteo', 'soja',
  'frutos', 'apio', 'mostaza', 'sesamo', 'sulfitos', 'molusco', 'altramuz'
]

/** Cómo puede venir escrito cada alérgeno en la carta, en los tres idiomas y en singular o plural. */
const NAMES: Record<AllergenKey, string[]> = {
  gluten: ['GLUTEN'],
  crustaceo: ['CRUSTACEO', 'CRUSTACEOS', 'CRUSTACI', 'CRUSTACIS', 'CRUSTACEAN', 'CRUSTACEANS'],
  huevo: ['HUEVO', 'HUEVOS', 'OU', 'OUS', 'EGG', 'EGGS'],
  pescado: ['PESCADO', 'PEIX', 'FISH'],
  lacteo: ['LACTEO', 'LACTEOS', 'LACTIS', 'LECHE', 'LLET', 'MILK', 'DAIRY'],
  soja: ['SOJA', 'SOY', 'SOYA'],
  frutos: ['FRUTOS SECOS', 'FRUTOS DE CASCARA', 'FRUITS SECS', 'FRUITS DE CLOSCA', 'TREE NUTS', 'NUTS'],
  apio: ['APIO', 'API', 'CELERY'],
  mostaza: ['MOSTAZA', 'MOSTASSA', 'MUSTARD'],
  sesamo: ['SESAMO', 'SESAM', 'SESAME'],
  sulfitos: ['SULFITO', 'SULFITOS', 'SULFITS', 'SULPHITES', 'SULFITES'],
  molusco: ['MOLUSCO', 'MOLUSCOS', 'MOLLUSC', 'MOLLUSCS'],
  altramuz: ['ALTRAMUZ', 'ALTRAMUCES', 'TRAMUS', 'TRAMUSSOS', 'LUPIN']
}

/** Sin tildes, sin el punto volado catalán (mol·lusc) y en mayúsculas: así se compara lo escrito. */
const norm = (text: string): string =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/·/g, '').toUpperCase().replace(/\s+/g, ' ').trim()

const BY_NAME = new Map<string, AllergenKey>(
  (Object.entries(NAMES) as Array<[AllergenKey, string[]]>).flatMap(([key, names]) => names.map((name) => [name, key] as const))
)

/**
 * Las letras de la carta impresa valen lo que diga su propia leyenda (`alergenos_leyenda`): S es
 * sulfitos y M es molusco porque así lo declara la casa. Una letra que la leyenda no traiga, o cuyo nombre
 * no sea un alérgeno conocido, no se adivina.
 */
function codesOf (legend: Record<string, string>): Map<string, AllergenKey> {
  const codes = new Map<string, AllergenKey>()
  for (const [code, name] of Object.entries(legend)) {
    const key = BY_NAME.get(norm(name))
    if (key != null) codes.set(norm(code), key)
  }
  return codes
}

export interface DeclaredAllergens {
  /** Los alérgenos que se han entendido, en el orden en que vienen y sin repetir. */
  known: AllergenKey[]
  /** Lo que venía escrito y no se ha entendido. Nunca se descarta: obliga a avisar al cliente. */
  unknown: string[]
}

/**
 * Los alérgenos de un plato: el código de la carta impresa («H.L.G.») o la lista de nombres de la carta
 * web. Lo que no se entiende se devuelve aparte en vez de callarlo, porque un alérgeno que se pierde por
 * el camino es un plato que parece más seguro de lo que es.
 */
export function readAllergens (value?: string | string[] | null, legend: Record<string, string> = data.alergenos_leyenda): DeclaredAllergens {
  const declared: DeclaredAllergens = { known: [], unknown: [] }
  if (value == null) return declared
  const codes = Array.isArray(value) ? null : codesOf(legend)
  const tokens = Array.isArray(value) ? value : value.split(/[.,;\s]+/)

  for (const token of tokens) {
    const written = token.trim()
    if (written === '') continue
    const key = codes?.get(norm(written)) ?? BY_NAME.get(norm(written))
    if (key == null) {
      if (!declared.unknown.includes(written)) declared.unknown.push(written)
    } else if (!declared.known.includes(key)) {
      declared.known.push(key)
    }
  }
  return declared
}
