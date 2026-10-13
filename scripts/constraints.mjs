// Los límites con número se deciden en CONSTRAINTS.md y se leen de allí: están escritos una sola vez, y
// es ese archivo el que vigila scripts/floor-guard.mjs. Los usan scripts/check-runtime.mjs y
// tests/build/pages.test.ts.
import { readFileSync } from 'node:fs'

/**
 * Límite de una regla de la tabla «Con números»: su segunda celda. «≤ 15,5 kB» y «0 fallos» son un
 * máximo; «≥ 81», un mínimo. Falla si la regla no está o si su límite no lleva número.
 */
export function parseLimit (text, rule) {
  const row = text.split('\n').map((line) => line.split('|').map((cell) => cell.trim())).find((cells) => cells[1] === rule)
  const limit = row?.[2]?.match(/^(≤|≥)?\s*(\d+(?:,\d+)?)/)
  if (limit == null) throw new Error(`CONSTRAINTS.md no da un límite con número para la regla «${rule}»`)
  return { kind: limit[1] === '≥' ? 'min' : 'max', value: Number(limit[2].replace(',', '.')) }
}

const constraints = readFileSync(new URL('../CONSTRAINTS.md', import.meta.url), 'utf8')
const limitOf = (rule, kind) => {
  const limit = parseLimit(constraints, rule)
  if (limit.kind !== kind) throw new Error(`En CONSTRAINTS.md, la regla «${rule}» no es un ${kind === 'max' ? 'máximo' : 'mínimo'}`)
  return limit.value
}

/** El valor que la regla no puede superar. */
export const maxOf = (rule) => limitOf(rule, 'max')
/** El valor del que la regla no puede bajar. */
export const minOf = (rule) => limitOf(rule, 'min')
