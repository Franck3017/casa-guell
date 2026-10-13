import { describe, expect, it } from 'vitest'
import { parseLimit } from '../../scripts/constraints.mjs'

const TABLE = `
| Regla | Límite | Lo comprueba |
|-------|--------|--------------|
| Pruebas | todas pasan | \`pnpm test\` |
| Peso del CSS | ≤ 15,5 kB con gzip | \`pnpm test:build\` |
| Accesibilidad | 0 fallos críticos o graves | \`node scripts/check-runtime.mjs\` |
| Nota de Lighthouse | ≥ 81 | \`node scripts/check-runtime.mjs\` |
`

describe('parseLimit', () => {
  it('lee un máximo escrito con ≤ y coma decimal', () => {
    expect(parseLimit(TABLE, 'Peso del CSS')).toEqual({ kind: 'max', value: 15.5 })
  })

  it('lee un mínimo escrito con ≥', () => {
    expect(parseLimit(TABLE, 'Nota de Lighthouse')).toEqual({ kind: 'min', value: 81 })
  })

  it('toma por máximo un número a secas', () => {
    expect(parseLimit(TABLE, 'Accesibilidad')).toEqual({ kind: 'max', value: 0 })
  })

  it('falla si la regla no está en la tabla', () => {
    expect(() => parseLimit(TABLE, 'Peso del HTML')).toThrow('Peso del HTML')
  })

  it('falla si el límite de la regla no lleva número', () => {
    expect(() => parseLimit(TABLE, 'Pruebas')).toThrow('Pruebas')
  })

  it('no confunde una regla con otra que empieza igual', () => {
    expect(() => parseLimit(TABLE, 'Peso')).toThrow('Peso')
  })
})
