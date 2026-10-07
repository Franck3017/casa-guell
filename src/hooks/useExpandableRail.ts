import { useEffect, useRef, useState, type FocusEvent, type PointerEvent as ReactPointerEvent } from 'react'

/**
 * Estado de un control que en reposo enseña una sola opción y se despliega al usarlo.
 * Se despliega por tres vías: ratón encima, foco de teclado, o un toque en pantalla táctil (`open`).
 * Escape lo recoge aunque el ratón o el foco sigan encima (WCAG 1.4.13) y un toque fuera lo cierra.
 */
export function useExpandableRail<T extends HTMLElement> () {
  const [open, setOpen] = useState(false) // táctil: toque en la opción activa
  const [hover, setHover] = useState(false) // solo ratón
  const [focusVisible, setFocusVisible] = useState(false) // solo teclado
  const [dismissed, setDismissed] = useState(false) // Escape
  const expanded = !dismissed && (open || hover || focusVisible)
  const railRef = useRef<T>(null)

  // El descarte con Escape dura hasta que el control queda del todo en reposo.
  useEffect(() => {
    if (!hover && !focusVisible && !open) setDismissed(false)
  }, [hover, focusVisible, open])

  useEffect(() => {
    if (!expanded) return
    const onDown = (e: PointerEvent): void => {
      if (open && railRef.current != null && !railRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') { setDismissed(true); setOpen(false) }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [expanded, open])

  return {
    expanded,
    setOpen,
    /** Props para el contenedor del control: referencia y escuchas de ratón y foco. */
    railProps: {
      ref: railRef,
      onPointerEnter: (e: ReactPointerEvent<T>) => { if (e.pointerType === 'mouse') setHover(true) },
      onPointerLeave: () => setHover(false),
      onFocus: (e: FocusEvent<T>) => setFocusVisible(e.target.matches(':focus-visible')),
      onBlur: (e: FocusEvent<T>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusVisible(false)
      }
    }
  }
}
