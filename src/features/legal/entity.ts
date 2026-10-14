// Quién responde de la web y de los datos. Lo que va aquí lo exige la ley en el aviso legal y en la
// política de privacidad (LSSI art. 10, RGPD art. 13), y solo lo sabe el titular: no se inventa.
// `null` es un dato obligatorio que falta (la página lo marca como pendiente); `undefined`, uno opcional
// que no aplica (lo que dependa de él no se escribe).
import { PHONE } from '@/lib/place'

type Lang = 'ca' | 'es'

export interface LegalEntity {
  /** Nombre y apellidos o razón social de quien explota el restaurante. */
  holder: string | null
  nif: string | null
  /** Domicilio del titular. Puede no ser el del restaurante. */
  address: string | null
  /** Correo para avisos legales y para ejercer los derechos de protección de datos. */
  email: string | null
  phone: string
  /** Datos de inscripción en el Registro Mercantil, si el titular es una sociedad. */
  registry: string | undefined
  /** Cuánto se guardan los datos de una reserva, dicho en cada idioma («durante un año desde la visita»). */
  retention: Record<Lang, string> | null
}

export const ENTITY: LegalEntity = {
  holder: null,
  nif: null,
  address: null,
  email: null,
  phone: PHONE,
  registry: undefined,
  retention: null
}

export const TOKENS = ['holder', 'nif', 'address', 'email', 'phone', 'registry', 'retention'] as const
type Token = (typeof TOKENS)[number]

/** Los datos obligatorios que faltan. Con alguno pendiente, los documentos no están para publicarse. */
export const pendingFields = (entity: LegalEntity = ENTITY): Token[] => TOKENS.filter((token) => entity[token] === null)

export type Filled = Array<string | { pending: Token }>

/**
 * Un párrafo con sus datos puestos: «{nif}» se cambia por su valor. Lo que falta se devuelve señalado,
 * para que quien pinta lo marque en vez de dejar un hueco. Si el párrafo depende de un dato opcional que
 * no hay, no se escribe (null).
 */
export function fill (paragraph: string, lang: Lang, entity: LegalEntity = ENTITY): Filled | null {
  const parts: Filled = []
  const push = (text: string): void => {
    const last = parts[parts.length - 1]
    if (typeof last === 'string') parts[parts.length - 1] = last + text
    else if (text !== '') parts.push(text)
  }

  for (const piece of paragraph.split(/(\{\w+\})/)) {
    const token = /^\{(\w+)\}$/.exec(piece)?.[1] as Token | undefined
    if (token == null || !TOKENS.includes(token)) { push(piece); continue }
    const value = entity[token]
    if (value === undefined) return null
    if (value === null) parts.push({ pending: token })
    else push(typeof value === 'string' ? value : value[lang])
  }
  return parts
}
