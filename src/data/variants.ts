/**
 * Variantes de datos SOLO PARA DESARROLLO (prueba de casos extremos de la carta).
 * Se eligen con `?data=worst|empty|one|huge` y entran por el mismo punto que los datos
 * reales (`src/data/index.ts`), nunca tocando el marcado ni el CSS.
 */
import type { CasaGuellData, MenuItem } from '@/types/data'

export type DataVariant = 'demo' | 'worst' | 'empty' | 'one' | 'huge'
export const DATA_VARIANTS: DataVariant[] = ['demo', 'worst', 'empty', 'one', 'huge']

export function readVariant (): DataVariant {
  const v = new URLSearchParams(window.location.search).get('data')
  return (DATA_VARIANTS as string[]).includes(v ?? '') ? (v as DataVariant) : 'demo'
}

/* Casos extremos verosímiles para un restaurante catalán: platos de nombre largo,
   producto "según mercado" sin importe, una botella de gama alta, texto con marcas, etc. */
const LONG_DESC = 'Canelones caseros rellenos de rustido de la abuela (ternera, cerdo y pollo cocidos a fuego lento durante seis horas), gratinados con bechamel de ceps y parmesano, servidos en cazuela de barro individual con un hilo de aceite de oliva virgen extra.'

const WORST_BARRA: MenuItem[] = [
  { nombre: 'Canelons de rostit de la iaia amb beixamel de ceps i gratinat de parmesà', precio: '14,50 €', descripcion: LONG_DESC, alergenos_codigo: 'G.H.L.N.S.M.P' },
  { nombre: 'Té', alergenos_codigo: '' },
  { nombre: 'Gambes de Palamós al ajillo, ración para compartir 🍤', precio: 'Según mercado', descripcion: 'Producto del día.' },
  { nombre: 'Pernil & trufa <b>negra</b> **bio**', precio: '9,90 €', descripcion: 'Texto con <i>marcas</i> & entidades &amp; asteriscos **no deben interpretarse**.' },
  { nombre: 'Vega Sicilia Único Reserva Especial 2009, botella', precio: '1284.50 €', descripcion: '  Botella  de   cosecha limitada  ' },
  { nombre: 'Fricandó', precio: '  12,00  €  ', descripcion: 'Línea uno\nLínea dos con salto de línea' }
]

const WORST_EMPEZAR: MenuItem[] = [
  { nombre: 'Crema de calabaza asada con aceite de trufa blanca y crujiente de jamón ibérico de bellota', precio: '11,00 €', descripcion: 'Ración individual.', alergenos_codigo: 'L.G.F.C.A.S.M.N.P.H.B' },
  { nombre: 'Ensaladilla', precio: '7,00 €' }
]

const WORST_COCTEL: MenuItem = {
  nombre: 'Espresso Martini de la casa con vodka infusionado en café de especialidad',
  precio: '12,00 €',
  ingredientes: 'Vodka infusionado con café de Etiopía lavado, licor de café artesano, espresso doble recién extraído, sirope de vainilla de Madagascar, sal ahumada y tres granos de café de especialidad como guarnición'
}

const WORST_COPA: MenuItem = {
  nombre: 'Macallan Rare Cask Highland Single Malt Scotch Whisky 43%',
  precio_chupito: '28,00 €',
  precio_copa: '1.284,00 €'
}

/** Aplica la variante a una copia profunda; los datos originales no se tocan. */
export function applyVariant (base: CasaGuellData, variant: DataVariant): CasaGuellData {
  if (variant === 'demo') return base
  const d = structuredClone(base)
  const { comida, bebidas, espirituosos } = d.carta_impresa
  const lists = [
    comida.la_barra, comida.para_empezar, comida.para_compartir, comida.para_rematar, comida.postres,
    bebidas.cocteles, bebidas.spritz, bebidas.apertivo, bebidas.cervezas, bebidas.soft_drinks,
    espirituosos.gin, espirituosos.ron, espirituosos.whisky, espirituosos.tequila, espirituosos.vodka,
    espirituosos.copas_premium
  ]

  if (variant === 'worst') {
    comida.la_barra.unshift(...WORST_BARRA)
    comida.para_empezar.unshift(...WORST_EMPEZAR)
    bebidas.cocteles.unshift(WORST_COCTEL)
    espirituosos.copas_premium.unshift(WORST_COPA)
  } else if (variant === 'empty') {
    for (const l of lists) l.length = 0
    for (const g of Object.values(espirituosos.digestivos)) g.items.length = 0
  } else if (variant === 'one') {
    for (const l of lists) l.length = Math.min(l.length, 1)
    for (const g of Object.values(espirituosos.digestivos)) g.items.length = Math.min(g.items.length, 1)
  } else {
    const seed = comida.la_barra.slice()
    comida.la_barra = Array.from({ length: 1000 }, (_, i) => ({
      ...seed[i % seed.length],
      nombre: `${seed[i % seed.length].nombre} ${i + 1}`
    }))
  }
  return d
}
