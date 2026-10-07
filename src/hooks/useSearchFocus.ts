import { useEffect, type RefObject } from 'react'
import { OPEN_SEARCH } from '@/lib/events'

/**
 * Formas de llegar al buscador y de salir de él sin tocarlo directamente:
 *  - Ctrl/⌘+K y "/" lo enfocan ("/" solo si no se está escribiendo en otro campo).
 *  - El evento global OPEN_SEARCH lo enfoca desde otros componentes.
 *  - Un toque o clic fuera lo cierra (en iOS tocar fuera no siempre hace blur).
 */
export function useSearchFocus (
  inputRef: RefObject<HTMLInputElement | null>,
  wrapRef: RefObject<HTMLElement | null>,
  onOutside: () => void
): void {
  useEffect(() => {
    const focus = (): void => inputRef.current?.focus()

    const onKey = (e: KeyboardEvent): void => {
      const el = document.activeElement as HTMLElement | null
      const tag = (el?.tagName ?? '').toLowerCase()
      const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || !!el?.isContentEditable
      const shortcut = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'
      if (shortcut || (e.key === '/' && !typing)) {
        e.preventDefault()
        focus()
      }
    }
    const onDown = (e: PointerEvent): void => {
      if (wrapRef.current != null && !wrapRef.current.contains(e.target as Node)) onOutside()
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_SEARCH, focus)
    document.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_SEARCH, focus)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [inputRef, wrapRef, onOutside])
}
