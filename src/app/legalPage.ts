import { lazy, useEffect, useState, type RefObject } from 'react'

const load = async () => await import('@/features/legal')

// La información legal va en un trozo aparte del de la portada: solo lo descarga quien la abre.
export const LegalPage = lazy(async () => await load().then((m) => ({ default: m.LegalPage })))

/**
 * Descarga ese trozo en cuanto sus enlaces asoman en pantalla y dice si ya ha llegado. Con la página
 * lista, el cambio se hace con transición; si aún no está (o no hay red), se navega sin ella, porque
 * fundir hacia una página todavía vacía se ve peor que no fundir.
 */
export function useLegalPageReady (links: RefObject<Element | null>): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const el = links.current
    if (el == null) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      load().then(() => setReady(true)).catch(() => setReady(false))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [links])

  return ready
}
