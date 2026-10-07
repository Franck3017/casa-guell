/**
 * Modelo de datos de Casa Güell.
 * Única fuente de verdad tipada para `src/data/casaGuell.json`.
 * Si el JSON crece (nuevas secciones de carta, idiomas, etc.), se extiende aquí.
 */

/* ------------------------------------------------------------------ */
/* Menú                                                                */
/* ------------------------------------------------------------------ */

/** Entrada genérica de cualquier carta (web o impresa). */
export interface MenuItem {
  /** Nombre del plato o bebida tal como aparece en la carta. */
  nombre: string
  /** Precio formateado con símbolo de euro. Ausente en listas con precio global. */
  precio?: string
  /** Precio en formato chupito (solo Copas Premium). */
  precio_chupito?: string
  /** Precio en formato copa (solo Copas Premium). */
  precio_copa?: string
  /** Descripción corta (carta web / comida impresa). */
  descripcion?: string
  /** Composición de la copa (carta de cócteles). */
  ingredientes?: string
  /** Alérgenos en texto (carta web): ["Gluten", "Peix", …]. */
  alergenos?: string[]
  /** Alérgenos codificados (carta impresa): "P.S.", "H.L.G.", … */
  alergenos_codigo?: string
}

/** Entrada de Copas Premium con doble precio (chupito / copa). */
export interface CopaPremiumItem extends MenuItem {
  precio_chupito: string
  precio_copa: string
}

/** Type guard: discrimina entradas con doble precio sin casts. */
export function isCopaPremium (item: MenuItem): item is CopaPremiumItem {
  return item.precio_chupito !== undefined && item.precio_copa !== undefined
}

/** Par [nombre de sección, platos] usado por el MenuBrowser. */
export type MenuSet = readonly [string, MenuItem[]]

/* ------------------------------------------------------------------ */
/* Filosofía                                                           */
/* ------------------------------------------------------------------ */

/** Uno de los tres pilares (L'origen / El mercat / El foc lent). */
export interface Pilar {
  numero: string
  titulo: string
  descripcion: string
}

export interface Filosofia {
  titulo: string
  pilares: Pilar[]
  cta_chef: { mensaje: string, firma: string }
}

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */

export interface Metadata {
  restaurante: string
  ubicacion_general: string
  lema_principal: string
  /** Mantras de la cinta infinita (marquee). */
  etiquetas_marquee: string[]
  web_consumo_responsable: string
}

/* ------------------------------------------------------------------ */
/* Cartas                                                              */
/* ------------------------------------------------------------------ */

/** Carta publicada en la web oficial. */
export interface CartaWeb {
  titulo: string
  subtitulo: string
  categorias: string[]
  platos_destacados: MenuItem[]
}

/** Bloque de comida de la carta impresa. */
export interface ComidaImpresa {
  la_barra: MenuItem[]
  para_empezar: MenuItem[]
  para_compartir: MenuItem[]
  para_rematar: MenuItem[]
  postres: MenuItem[]
}

/** Bloque de bebidas de la carta impresa. */
export interface BebidasImpresas {
  cocteles: MenuItem[]
  spritz: MenuItem[]
  apertivo: MenuItem[]
  cervezas: MenuItem[]
  soft_drinks: MenuItem[]
}

/** Grupo de digestivos con precio global fijo (o null si varía). */
export interface DigestiuGrup {
  precio: string | null
  items: string[]
}

export interface Digestivos {
  digestivo: DigestiuGrup
  chupito: DigestiuGrup
  copa: DigestiuGrup
}

/** Bloque de espirituosos de la carta impresa. */
export interface Espirituosos {
  gin: MenuItem[]
  ron: MenuItem[]
  whisky: MenuItem[]
  tequila: MenuItem[]
  vodka: MenuItem[]
  copas_premium: MenuItem[]
  digestivos: Digestivos
}

/** Carta impresa completa (comida + bebidas + espirituosos). */
export interface CartaImpresa {
  comida: ComidaImpresa
  bebidas: BebidasImpresas
  espirituosos: Espirituosos
}

/* ------------------------------------------------------------------ */
/* Resto de secciones                                                  */
/* ------------------------------------------------------------------ */

/** Leyenda de códigos de alérgenos: { G: "GLUTEN", H: "HUEVO", … }. */
export type AlergensLlegenda = Record<string, string>

export interface Mercat {
  titulo: string
  descripcion: string
  accion: string
}

export interface Ubicacio {
  titulo: string
  direccion: string
  /** { "Dimecres a Dissabte": "13:00 — 00:00", … } */
  horario: Record<string, string>
  contacto: {
    telefono: string
    redes_sociales: string[]
  }
}

/** Grupo de colores de marca: { beige_claro_principal: "#FAF8F5", … }. */
export type ColorGrup = Record<string, string>

/** Paleta completa agrupada: { primarios: ColorGrup, fondos: ColorGrup, … }. */
export type Colores = Record<string, ColorGrup>

/* ------------------------------------------------------------------ */
/* Raíz del documento                                                  */
/* ------------------------------------------------------------------ */

/** Estructura completa de `casaGuell.json`. */
export interface CasaGuellData {
  metadata: Metadata
  filosofia: Filosofia
  carta_web: CartaWeb
  carta_impresa: CartaImpresa
  alergenos_leyenda: AlergensLlegenda
  mercat: Mercat
  ubicacion: Ubicacio
  colores: Colores
}
