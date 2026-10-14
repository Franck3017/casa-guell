export const OPEN_DISH = 'cg:open-dish'
export const OPEN_RESERVE = 'cg:open-reserve'
export const OPEN_SEARCH = 'cg:open-search'
export const PAGE_READY = 'cg:page-ready'

/** Qué familia y sección de la carta hay que abrir. Quien lo recibe valida que existan. */
export interface OpenDishDetail {
  macro: string
  setKey: string
}

export function openDish (macro: string, setKey: string) {
  window.dispatchEvent(new CustomEvent<OpenDishDetail>(OPEN_DISH, { detail: { macro, setKey } }))
}

export function openReserve () {
  window.dispatchEvent(new CustomEvent(OPEN_RESERVE))
}

export function openSearch () {
  window.dispatchEvent(new CustomEvent(OPEN_SEARCH))
}

/**
 * Lo avisa al montarse una página cuyo código llega después que su ruta. Quien coloca el scroll al
 * cambiar de dirección (useArrivalScroll) lo repite entonces, ya con el contenido delante.
 */
export function pageReady () {
  window.dispatchEvent(new CustomEvent(PAGE_READY))
}
