export const LEGAL_DOC_IDS = ['aviso-legal', 'privacidad', 'cookies', 'consumidor'] as const
export type LegalDocId = (typeof LEGAL_DOC_IDS)[number]

export interface LegalBlock {
  heading: string
  /** Texto corrido. Puede llevar datos del titular entre llaves: «{nif}» (ver ../entity.ts). */
  paragraphs: string[]
  /** Organismos o páginas oficiales a los que remite el apartado. */
  links?: Array<{ label: string, href: string }>
}

export interface LegalDoc {
  id: LegalDocId
  title: string
  blocks: LegalBlock[]
}

/** Los documentos y sus rótulos. El título y la presentación de la página van con los textos de la web (legal.title, legal.intro). */
export interface LegalContent {
  updatedLabel: string
  /** Lo que se escribe en el hueco de un dato del titular que falta. */
  pendingLabel: string
  /** Aviso al principio de un documento al que le faltan datos. */
  pendingNotice: string
  /** Título de los avisos de la carta (alergias, IVA, pescado crudo, sobras) dentro de la información al consumidor. */
  noticesTitle: string
  /** Solo donde el texto se enseña en otro idioma: avisa de en cuáles está disponible. */
  fallbackNote?: string
  docs: LegalDoc[]
}
