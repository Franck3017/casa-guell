// Búsqueda de platos de la carta: índice y consulta. Código puro, sin React ni DOM.
import { GROUPS, type MacroKey, type SetKey } from '@/features/menu/menu-groups'
import type { Messages } from '@/i18n/types'
import { dishMedia, type DishMedia } from '@/lib/dishMedia'
import { isCopaPremium } from '@/types/data'

const MAX_RESULTS = 8

export interface DishIndex {
  nombre: string
  desc: string
  precio: string
  macro: MacroKey
  setKey: SetKey
  category: string
  media?: DishMedia
  /** Campos normalizados (minúsculas, sin tildes) para buscar. */
  n: { name: string, desc: string, cat: string }
}

/** Minúsculas y sin tildes: "Piña" y "pina" se comparan igual. */
export const normalize = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Se construye una sola vez (y de nuevo si cambia el idioma): normaliza textos y resuelve la foto. */
export function buildDishIndex (labels: Messages['carta']['sets']): DishIndex[] {
  const out: DishIndex[] = []
  for (const macro of Object.keys(GROUPS) as MacroKey[]) {
    for (const [setKey, items] of GROUPS[macro].sets) {
      const category = labels[setKey]
      for (const it of items) {
        const desc = it.descripcion ?? it.ingredientes ?? ''
        out.push({
          nombre: it.nombre,
          desc,
          precio: isCopaPremium(it) ? it.precio_copa : (it.precio ?? ''),
          macro,
          setKey,
          category,
          media: dishMedia(it.nombre),
          n: { name: normalize(it.nombre), desc: normalize(desc), cat: normalize(category) }
        })
      }
    }
  }
  return out
}

/**
 * Búsqueda por palabras: todas deben aparecer en nombre, descripción o categoría
 * (así "whisky" lista los whiskies). Ordena por relevancia: primero los nombres que
 * empiezan por lo escrito, luego los que contienen todas las palabras en el nombre.
 */
export function searchDishes (index: DishIndex[], query: string): { hits: DishIndex[], tokens: string[] } {
  const tokens = normalize(query).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return { hits: [], tokens }

  const scored: Array<[DishIndex, number]> = []
  for (const d of index) {
    const { name, desc, cat } = d.n
    if (!tokens.every((t) => name.includes(t) || desc.includes(t) || cat.includes(t))) continue
    let score = 1
    if (tokens.every((t) => name.includes(t))) score += 2
    if (name.startsWith(tokens[0])) score += 3
    else if (name.split(' ').some((w) => w.startsWith(tokens[0]))) score += 1.5
    scored.push([d, score])
  }
  scored.sort((a, b) => b[1] - a[1]) // sort es estable: a igual puntuación, orden de la carta
  return { hits: scored.slice(0, MAX_RESULTS).map(([d]) => d), tokens }
}
