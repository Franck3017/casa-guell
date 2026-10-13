import { useEffect, useRef, type KeyboardEvent, type RefObject } from 'react'

// Lo que recibe el foco con Tab. Quedan fuera los controles con tabindex -1: en un grupo que se recorre con
// las flechas (los días, las horas) solo uno está en el orden de tabulación.
const FOCUSABLE = ['a[href]', 'button:not([disabled])', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]']
  .map((selector) => selector + ':not([tabindex="-1"])')
  .join(', ')

interface DialogFocusOptions {
  open: boolean
  close: () => void
  /** Contenedor dentro del cual debe quedarse el foco. */
  panelRef: RefObject<HTMLElement | null>
  /** Elemento que recibe el foco al abrir. */
  initialRef: RefObject<HTMLElement | null>
}

/**
 * Comportamiento de un diálogo modal: al abrir enfoca `initialRef`, Escape cierra, el fondo no hace
 * scroll, Tab y Shift+Tab dan la vuelta dentro del panel y, al cerrar, el foco vuelve a donde estaba.
 * `rememberFocus` se llama justo antes de abrir, si entre medias el foco puede cambiar de sitio; si no se
 * llama, se toma el que haya al abrir. `trapFocus` va en el onKeyDown del diálogo.
 */
export function useDialogFocus ({ open, close, panelRef, initialRef }: DialogFocusOptions) {
  const returnFocusRef = useRef<HTMLElement | null>(null)
  // `close` puede cambiar en cada render: el efecto usa siempre la última sin volver a montarse.
  const closeRef = useRef(close)
  useEffect(() => { closeRef.current = close })

  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent): void => { if (e.key === 'Escape') closeRef.current() }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    // Si quien abre no ha apuntado antes dónde estaba el foco (rememberFocus), se apunta aquí, antes de moverlo
    returnFocusRef.current ??= document.activeElement instanceof HTMLElement ? document.activeElement : null
    initialRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      returnFocusRef.current?.focus()
      returnFocusRef.current = null
    }
  }, [open, initialRef])

  const rememberFocus = (): void => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
  }

  const trapFocus = (e: KeyboardEvent<HTMLElement>): void => {
    const panel = panelRef.current
    if (e.key !== 'Tab' || panel == null) return
    // Lo que no se pinta (una columna que solo sale en pantallas anchas) tampoco puede recibir el foco
    const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((item) => item.getClientRects().length > 0)
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    const outside = active == null || !panel.contains(active)
    // El foco puede estar en algo que no entra en la vuelta (un título enfocado al abrir): cuenta por su
    // sitio en el documento, o el navegador lo sacaría del diálogo al no encontrar nada antes o después.
    const where = (item: HTMLElement): number => active == null ? 0 : item.compareDocumentPosition(active)
    if (e.shiftKey && (outside || active === first || (where(first) & Node.DOCUMENT_POSITION_PRECEDING) !== 0)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && (outside || active === last || (where(last) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0)) {
      e.preventDefault()
      first.focus()
    }
  }

  return { rememberFocus, trapFocus }
}
