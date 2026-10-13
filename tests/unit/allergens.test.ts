import { describe, expect, it } from 'vitest'
import { data } from '@/data'
import { readAllergens } from '@/lib/allergenCodes'

// La carta impresa declara los alérgenos con letras (P.S., H.L.G.) y trae su propia leyenda en
// casaGuell.json: G gluten, H huevo, L lácteo, P pescado, S sulfitos, F frutos secos, M molusco y NZ mostaza.
// Lo que la web enseñe tiene que ser lo que esa leyenda dice, y nunca menos de lo que la carta declara.

describe('códigos de la carta impresa', () => {
  it('se leen con la leyenda de la propia carta', () => {
    expect(readAllergens('F.S.G.M.').known).toEqual(['frutos', 'sulfitos', 'gluten', 'molusco'])
  })

  it('la S es sulfitos, no soja', () => {
    expect(readAllergens('P.S.').known).toEqual(['pescado', 'sulfitos'])
  })

  it('la M es molusco, no mostaza', () => {
    expect(readAllergens('G.P.M').known).toEqual(['gluten', 'pescado', 'molusco'])
  })

  it('la mostaza es NZ', () => {
    expect(readAllergens('NZ.G.').known).toEqual(['mostaza', 'gluten'])
  })

  it('un alérgeno escrito dos veces sale una', () => {
    expect(readAllergens('P.M.S.S.').known).toEqual(['pescado', 'molusco', 'sulfitos'])
  })

  it('un código que la leyenda no explica no se pierde: queda por consultar', () => {
    expect(readAllergens('H.L.O.')).toEqual({ known: ['huevo', 'lacteo'], unknown: ['O'] })
  })

  it('un código que nadie entiende no se toma por ningún alérgeno', () => {
    expect(readAllergens('NUT')).toEqual({ known: [], unknown: ['NUT'] })
  })
})

describe('nombres de la carta web', () => {
  it('se entienden en catalán', () => {
    expect(readAllergens(['Gluten', 'Peix', 'Mol·lusc']).known).toEqual(['gluten', 'pescado', 'molusco'])
    expect(readAllergens(['Ou', 'Lactis', 'Sulfits', 'Fruits secs']).known).toEqual(['huevo', 'lacteo', 'sulfitos', 'frutos'])
  })

  it('y en castellano y en inglés', () => {
    expect(readAllergens(['Crustáceos', 'Frutos de cáscara', 'Moluscos']).known).toEqual(['crustaceo', 'frutos', 'molusco'])
    expect(readAllergens(['Tree nuts', 'Sulphites', 'Molluscs']).known).toEqual(['frutos', 'sulfitos', 'molusco'])
  })

  it('un nombre que no conoce queda por consultar', () => {
    expect(readAllergens(['Gluten', 'Kiwi'])).toEqual({ known: ['gluten'], unknown: ['Kiwi'] })
  })
})

describe('sin dato', () => {
  it('no hay nada que enseñar', () => {
    const nothing = { known: [], unknown: [] }

    expect(readAllergens(undefined)).toEqual(nothing)
    expect(readAllergens(null)).toEqual(nothing)
    expect(readAllergens('')).toEqual(nothing)
    expect(readAllergens([])).toEqual(nothing)
  })
})

describe('la carta de hoy (casaGuell.json)', () => {
  const dishes = Object.values(data.carta_impresa.comida).flat()

  it('cada letra de la leyenda es un alérgeno que la web sabe enseñar', () => {
    const codes = Object.keys(data.alergenos_leyenda)

    expect(readAllergens(codes.join('.')).unknown).toEqual([])
    expect(readAllergens(codes.join('.')).known).toHaveLength(codes.length)
  })

  // Códigos que la carta usa y su leyenda no explica. Hoy son estos cuatro, en seis platos, y la web pide
  // consultar al personal en cada uno. La lista solo puede encoger: cuando cocina diga qué significan y se
  // corrija la carta, se vacía. Un código nuevo sin explicar hace fallar la prueba.
  it('no aparecen códigos nuevos sin explicar', () => {
    const unexplained = new Set(dishes.flatMap((dish) => readAllergens(dish.alergenos_codigo).unknown))

    expect([...unexplained].sort()).toEqual(['N', 'NUT', 'O', 'R'])
  })

  it('ningún nombre de alérgeno de los platos destacados se queda sin entender', () => {
    const unknown = data.carta_web.platos_destacados.flatMap((dish) => readAllergens(dish.alergenos).unknown)

    expect(unknown).toEqual([])
  })
})
