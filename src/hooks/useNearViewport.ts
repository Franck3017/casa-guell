import { useEffect, useState, type RefObject } from 'react'

/**
 * Devuelve `true` cuando el elemento está cerca de entrar en pantalla (a menos de `margin` de distancia),
 * y ya no vuelve a `false`. Sirve para no descargar algo pesado hasta que de verdad va a hacer falta.
 * Sin navegador (prerenderizado del build) devuelve `true`: el HTML se genera con el contenido completo.
 */
export function useNearViewport (ref: RefObject<Element | null>, margin = '800px'): boolean {
  const [near, setNear] = useState(() => typeof window === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (near || el == null) return
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((entry) => entry.isIntersecting)) setNear(true) },
      { rootMargin: `${margin} 0px` }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin, near])

  return near
}
