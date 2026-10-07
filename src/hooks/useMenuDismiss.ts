import { useEffect } from 'react'

const DESKTOP = '(min-width: 1024px)'

/**
 * Mientras el menú móvil está abierto: la página no se desplaza por detrás, y Escape o pasar a ancho
 * de escritorio (donde el panel no existe) lo cierran. Al cerrarse, todo vuelve a como estaba.
 */
export function useMenuDismiss (open: boolean, close: () => void): void {
  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent): void => { if (e.key === 'Escape') close() }
    const desktop = window.matchMedia(DESKTOP)
    const onDesktop = (): void => { if (desktop.matches) close() }
    document.addEventListener('keydown', onKey)
    desktop.addEventListener('change', onDesktop)
    return () => {
      root.style.overflow = previous
      document.removeEventListener('keydown', onKey)
      desktop.removeEventListener('change', onDesktop)
    }
  }, [open, close])
}
