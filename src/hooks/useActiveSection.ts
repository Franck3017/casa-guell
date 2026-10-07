import { useEffect, useState } from 'react'

/** Devuelve el id de la sección actualmente visible en el viewport. */
export function useActiveSection (ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-45% 0px -45% 0px' }
    )
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el != null) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [ids])

  return active
}
