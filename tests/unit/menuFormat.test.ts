import { describe, expect, it } from 'vitest'
import { displayName, formatPrice, plainHours } from '@/lib/menuFormat'

/** Intl separa la cifra del símbolo con un espacio de no separación: aquí se compara con uno normal. */
const plainSpaces = (text: string): string => text.replace(/\s/g, ' ')

describe('displayName', () => {
  it('pasa a mayúscula inicial los nombres que llegan en mayúsculas', () => {
    expect(displayName('PATATAS BRAVAS')).toBe('Patatas Bravas')
  })

  it('deja en minúscula las partículas que van en medio del nombre', () => {
    expect(displayName('ARROZ CON BOGAVANTE DE LA LONJA')).toBe('Arroz con Bogavante de la Lonja')
  })

  it('pone mayúscula a la partícula cuando es la primera palabra', () => {
    expect(displayName('EL FRICANDÓ')).toBe('El Fricandó')
  })

  it('respeta los nombres que ya traen minúsculas', () => {
    expect(displayName('Tarta de queso al horno')).toBe('Tarta de queso al horno')
  })

  it('mantiene las siglas en mayúsculas', () => {
    expect(displayName('TOMATE CON AOVE')).toBe('Tomate con AOVE')
  })

  it('escribe en minúscula el artículo apostrofado y en mayúscula lo que le sigue', () => {
    expect(displayName("PA D'OLIVA")).toBe("Pa d'Oliva")
  })

  it('pone mayúscula inicial a lo que va entre paréntesis', () => {
    expect(displayName('CROQUETAS (JAMÓN)')).toBe('Croquetas (Jamón)')
  })

  it('quita la barra suelta con la que acaban algunos nombres de origen', () => {
    expect(displayName('GILDA \\')).toBe('Gilda')
  })
})

describe('formatPrice', () => {
  it('escribe con coma decimal en castellano un precio que llega con punto', () => {
    expect(plainSpaces(formatPrice('12.00 €', 'es'))).toBe('12,00 €')
  })

  it('escribe con coma decimal en catalán', () => {
    expect(plainSpaces(formatPrice('9,5 €', 'ca'))).toBe('9,50 €')
  })

  it('escribe con punto decimal y el símbolo delante en inglés', () => {
    expect(formatPrice('12,50 €', 'en')).toBe('€12.50')
  })

  it('lee el punto como separador de miles cuando le siguen tres cifras', () => {
    expect(plainSpaces(formatPrice('1.284,00 €', 'es'))).toBe('1.284,00 €')
  })

  it('lee el punto como separador de miles también cuando el importe no lleva decimales', () => {
    expect(plainSpaces(formatPrice('1.284 €', 'es'))).toBe('1.284,00 €')
  })

  it('agrupa los miles también en importes de cuatro cifras sin separador', () => {
    expect(plainSpaces(formatPrice('1284.50 €', 'es'))).toBe('1.284,50 €')
  })

  it('devuelve el texto tal cual cuando no lleva ningún importe', () => {
    expect(formatPrice('Según mercado', 'es')).toBe('Según mercado')
  })
})

describe('plainHours', () => {
  it('cambia la raya larga del horario por un guion', () => {
    expect(plainHours('13:00 — 00:00')).toBe('13:00 - 00:00')
  })
})
