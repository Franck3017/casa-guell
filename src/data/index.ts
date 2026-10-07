import raw from './casaGuell.json'
import type { CasaGuellData } from '@/types/data'
import { applyVariant, readVariant } from './variants'

const base = raw as unknown as CasaGuellData

/** En desarrollo, `?data=worst|empty|one|huge` sustituye la carta por un caso extremo. */
export const data: CasaGuellData = import.meta.env.DEV ? applyVariant(base, readVariant()) : base

// Solo en desarrollo: avisa si un plato supera lo que el diseño ha probado (nombre 80, texto 160 caracteres).
if (import.meta.env.DEV && readVariant() === 'demo') {
  const ci = base.carta_impresa
  const lists: Array<{ nombre: string, descripcion?: string, ingredientes?: string }> = [
    ...Object.values(ci.comida), ...Object.values(ci.bebidas),
    ...[ci.espirituosos.gin, ci.espirituosos.ron, ci.espirituosos.whisky, ci.espirituosos.tequila, ci.espirituosos.vodka, ci.espirituosos.copas_premium]
  ].flat()
  for (const it of lists) {
    const text = it.descripcion ?? it.ingredientes ?? ''
    if (it.nombre.length > 80 || text.length > 160) {
      console.warn(`[carta] "${it.nombre.slice(0, 40)}…" supera los límites de diseño (nombre ${it.nombre.length}/80, texto ${text.length}/160). Pruébalo con ?data=worst.`)
    }
  }
}
