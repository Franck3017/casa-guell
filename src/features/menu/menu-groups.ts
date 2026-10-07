import { data } from '@/data'
import type { Messages } from '@/i18n/types'
import type { DigestiuGrup, MenuItem } from '@/types/data'

/** Familia de la carta. Coincide con las claves de `t.carta.tabs`. */
export type MacroKey = keyof Messages['carta']['tabs']
/** Sección dentro de una familia. Coincide con las claves de `t.carta.sets`. */
export type SetKey = keyof Messages['carta']['sets']

export interface MacroGroup {
  sets: Array<[SetKey, MenuItem[]]>
}

/**
 * Los digestivos llegan como una lista de nombres con un precio común para todo el grupo.
 * Se convierten en referencias normales; si el grupo no tiene precio (varía), se quedan sin él.
 */
const fromGroup = ({ items, precio }: DigestiuGrup): MenuItem[] =>
  items.map((nombre) => (precio != null ? { nombre, precio } : { nombre }))

const ci = data.carta_impresa
const digestivos = ci.espirituosos.digestivos

/** La carta en el orden en que se muestra: familias, y dentro de cada una sus secciones. */
export const GROUPS: Record<MacroKey, MacroGroup> = {
  cuina: {
    sets: [
      ['barra', ci.comida.la_barra],
      ['empezar', ci.comida.para_empezar],
      ['compartir', ci.comida.para_compartir],
      ['rematar', ci.comida.para_rematar],
      ['postres', ci.comida.postres]
    ]
  },
  begudes: {
    sets: [
      ['cocteles', ci.bebidas.cocteles],
      ['spritz', ci.bebidas.spritz],
      ['apertivo', ci.bebidas.apertivo],
      ['cervezas', ci.bebidas.cervezas],
      ['soft', ci.bebidas.soft_drinks]
    ]
  },
  esperits: {
    sets: [
      ['gin', ci.espirituosos.gin],
      ['ron', ci.espirituosos.ron],
      ['whisky', ci.espirituosos.whisky],
      ['tequila', ci.espirituosos.tequila],
      ['vodka', ci.espirituosos.vodka],
      ['copas', ci.espirituosos.copas_premium],
      ['chupitos', fromGroup(digestivos.chupito)],
      ['copes', fromGroup(digestivos.copa)],
      ['digestiu', fromGroup(digestivos.digestivo)]
    ]
  }
}

export const MACRO_KEYS = Object.keys(GROUPS) as MacroKey[]

/** Comprueba un valor llegado de fuera (un evento) antes de usarlo como familia. */
export const isMacroKey = (value: unknown): value is MacroKey =>
  typeof value === 'string' && value in GROUPS
