import { useLayoutEffect, useRef } from 'react'
import { loadGsap } from '@/lib/gsapLoader'

interface Motion {
  /** Enseña u oculta el panel, animando si se puede. */
  set: (open: boolean) => void
}

/** Sin GSAP todavía (o con movimiento reducido): el panel aparece y desaparece sin transición. */
function instant (panel: HTMLElement): Motion {
  return {
    set: (open) => {
      panel.style.visibility = open ? 'visible' : 'hidden'
      panel.style.opacity = open ? '1' : '0'
    }
  }
}

/**
 * Coreografía del panel de menú. Abrir: baja una hoja de papel con el canto rasgado por delante y, con la
 * hoja ya en marcha, se trazan los filetes, suben los nombres de las secciones desde detrás de su máscara
 * y aparecen las herramientas. Cerrar: lo mismo al revés y más deprisa (salir no debe hacer esperar).
 * Todo va en una línea de tiempo que se reproduce o se invierte, así que abrir y cerrar a medias no salta.
 * GSAP llega en carga diferida: si alguien abre el menú antes, el panel aparece sin animación.
 */
export function useMenuMotion (panelRef: React.RefObject<HTMLDivElement | null>, open: boolean) {
  const motion = useRef<Motion | null>(null)
  const openRef = useRef(open)

  useLayoutEffect(() => {
    const panel = panelRef.current
    if (panel == null) return
    motion.current = instant(panel)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelled = false
    let revert = (): void => {}

    void loadGsap().then((gsap) => {
      if (cancelled) return
      let timeline: gsap.core.Timeline | null = null
      const ctx = gsap.context(() => {
        timeline = gsap.timeline({
          paused: true,
          defaults: { ease: 'power3.out' },
          onReverseComplete: () => { gsap.set(panel, { autoAlpha: 0 }) }
        })
          .fromTo('[data-menu-sheet]', { yPercent: -104 }, { yPercent: 0, duration: 0.65, ease: 'power4.out' }, 0)
          .fromTo('[data-menu-line]', { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left center', duration: 0.6, stagger: 0.05 }, 0.14)
          .fromTo('[data-menu-word]', { yPercent: 115 }, { yPercent: 0, duration: 0.6, stagger: 0.055 }, 0.16)
          .fromTo('[data-menu-tools]', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.45 }, 0.4)
      }, panel)
      const tl = timeline as gsap.core.Timeline | null
      if (tl == null) return

      // Si el menú ya estaba abierto cuando llegó GSAP, la línea de tiempo se coloca al final sin animar.
      if (openRef.current) tl.progress(1)
      else gsap.set(panel, { autoAlpha: 0 })

      motion.current = {
        set: (next) => {
          if (next) {
            gsap.set(panel, { autoAlpha: 1 })
            tl.timeScale(1).play()
          } else {
            tl.timeScale(1.8).reverse()
          }
        }
      }
      revert = () => ctx.revert()
    })

    return () => { cancelled = true; revert(); motion.current = null }
  }, [panelRef])

  useLayoutEffect(() => {
    const changed = openRef.current !== open
    openRef.current = open
    // En el primer render el panel está cerrado y oculto: no hay nada que hacer.
    if (changed) motion.current?.set(open)
  }, [open])
}
