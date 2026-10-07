import { useEffect, useRef, type KeyboardEvent, type RefObject } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

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
 * `rememberFocus` se llama justo antes de abrir; `trapFocus` va en el onKeyDown del diálogo.
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
    initialRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      returnFocusRef.current?.focus()
    }
  }, [open, initialRef])

  const rememberFocus = (): void => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
  }

  const trapFocus = (e: KeyboardEvent<HTMLElement>): void => {
    const panel = panelRef.current
    if (e.key !== 'Tab' || panel == null) return
    const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (e.shiftKey && (active === first || !panel.contains(active))) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && (active === last || !panel.contains(active))) {
      e.preventDefault()
      first.focus()
    }
  }

  return { rememberFocus, trapFocus }
}
