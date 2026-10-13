import { describe, expect, it } from 'vitest'
import { GROUPS } from '@/features/menu/menu-groups'
import { es } from '@/i18n/locales/es'
import { buildDishIndex, normalize, searchDishes, type DishIndex } from '@/lib/dishSearch'

/** Un plato de índice hecho a mano, con sus campos de búsqueda ya normalizados. */
function dish (nombre: string, desc = '', category = 'La barra'): DishIndex {
  return {
    nombre,
    desc,
    precio: '10,00 €',
    macro: 'cuina',
    setKey: 'barra',
    category,
    n: { name: normalize(nombre), desc: normalize(desc), cat: normalize(category) }
  }
}

const names = (hits: DishIndex[]): string[] => hits.map((hit) => hit.nombre)

describe('normalize', () => {
  it('quita las tildes y pasa a minúsculas', () => {
    expect(normalize('Piña COLADA')).toBe('pina colada')
  })

  it('quita también los acentos del catalán', () => {
    expect(normalize('Cafè amb Llet')).toBe('cafe amb llet')
  })
})

describe('searchDishes', () => {
  it('sin nada escrito no devuelve resultados', () => {
    const index = [dish('Croquetas de jamón')]

    expect(searchDishes(index, '   ').hits).toEqual([])
  })

  it('encuentra un plato escribiendo sin tildes', () => {
    const index = [dish('Croquetas de jamón'), dish('Ensaladilla')]

    expect(names(searchDishes(index, 'jamon').hits)).toEqual(['Croquetas de jamón'])
  })

  it('busca también en la descripción', () => {
    const index = [dish('Bikini', 'Jamón dulce, queso y trufa'), dish('Ensaladilla')]

    expect(names(searchDishes(index, 'trufa').hits)).toEqual(['Bikini'])
  })

  it('busca también en el nombre de la sección', () => {
    const index = [dish('Macallan 12', '', 'Whisky'), dish('Ensaladilla')]

    expect(names(searchDishes(index, 'whisky').hits)).toEqual(['Macallan 12'])
  })

  it('exige que aparezcan todas las palabras escritas', () => {
    const index = [dish('Croquetas de jamón'), dish('Croquetas de pollo')]

    expect(names(searchDishes(index, 'croquetas pollo').hits)).toEqual(['Croquetas de pollo'])
  })

  it('pone delante los nombres que empiezan por lo escrito', () => {
    const index = [dish('Pan con tomate'), dish('Tomate aliñado')]

    expect(names(searchDishes(index, 'tomate').hits)).toEqual(['Tomate aliñado', 'Pan con tomate'])
  })

  it('pone el plato que lo lleva en el nombre delante del que solo lo lleva en la descripción', () => {
    // "resa" no es comienzo de ninguna palabra: lo único que distingue a los dos platos es dónde aparece
    const index = [dish('Yogur', 'Con mermelada de fresa'), dish('Fresas con nata')]

    expect(names(searchDishes(index, 'resa').hits)).toEqual(['Fresas con nata', 'Yogur'])
  })

  it('pone delante el nombre con una palabra que empieza por lo escrito', () => {
    const index = [dish('Requesón'), dish('Tabla de quesos')]

    expect(names(searchDishes(index, 'queso').hits)).toEqual(['Tabla de quesos', 'Requesón'])
  })

  it('a igual relevancia conserva el orden de la carta', () => {
    const index = [dish('Vermut rojo'), dish('Vermut blanco')]

    expect(names(searchDishes(index, 'vermut').hits)).toEqual(['Vermut rojo', 'Vermut blanco'])
  })

  it('devuelve como mucho ocho resultados', () => {
    const index = Array.from({ length: 12 }, (_, i) => dish(`Vino ${i + 1}`))

    expect(searchDishes(index, 'vino').hits).toHaveLength(8)
  })

  it('devuelve las palabras buscadas ya normalizadas, para poder resaltarlas', () => {
    expect(searchDishes([], 'Jamón  Ibérico').tokens).toEqual(['jamon', 'iberico'])
  })
})

describe('buildDishIndex con la carta real', () => {
  const index = buildDishIndex(es.carta.sets)

  it('incluye todas las referencias de la carta', () => {
    const total = Object.values(GROUPS).flatMap((group) => group.sets).reduce((sum, [, items]) => sum + items.length, 0)

    expect(index).toHaveLength(total)
  })

  it('permite encontrar cualquier plato por su nombre completo', () => {
    const notFound = index.filter((entry) => !searchDishes(index, entry.nombre).hits.some((hit) => hit.nombre === entry.nombre))

    expect(names(notFound)).toEqual([])
  })
})
