import { useLayoutEffect } from 'react'
import { loadGsapDrawSvg } from '@/lib/gsapLoader'

/**
 * Entrada dibujada del hero: una pluma azul traza el marco de la hoja y del retrato y sombrea el retrato
 * a lápiz; debajo de cada boceto aparece la capa real y las líneas se retiran. "sin maquillaje" se escribe
 * y se subraya con el mismo trazo. El resto del titular y los botones no se animan.
 * Localiza sus piezas por atributos data-* (data-sketch-layer, data-sketch, data-hero-fill, data-hero-accent,
 * data-hero-caption, data-hero-wordmark). Solo corre si el usuario no ha pedido reducir el movimiento.
 * GSAP llega en carga diferida. Mientras tanto no hay parpadeo: un script de index.html ya ha ocultado por
 * CSS (clase `entrance-pending`) las piezas que se van a animar, y aquí se retira al tomar el control.
 */
export function useDrawnEntrance (sectionRef: React.RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const section = sectionRef.current
    if (section == null) return
    let cancelled = false
    let revert = (): void => {}

    void loadGsapDrawSvg().then((gsap) => {
      if (cancelled) return
      const mm = gsap.matchMedia()
      revert = () => mm.revert()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(section)
        const layers = q('[data-sketch-layer]')
        const lines = (layer: string, kind: string) => q(`[data-sketch-layer="${layer}"] [data-sketch="${kind}"]`)
        const fill = (layer: string) => q(`[data-hero-fill="${layer}"]`)

        gsap.set(layers, { visibility: 'visible' })
        gsap.set(q('[data-sketch]'), { drawSVG: '0%' })
        gsap.set(q('[data-hero-fill]'), { opacity: 0 })

        const pen = { drawSVG: '100%', ease: 'power2.inOut' }
        const tl = gsap.timeline({
          defaults: { ease: 'power3.out', force3D: true }
        })

        tl.fromTo(q('[data-hero-wordmark]'), { yPercent: 28, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 2 }, 0)

          .to(lines('paper', 'frame'), { ...pen, duration: 0.5, stagger: 0.1 }, 0)
          .to(fill('paper'), { opacity: 1, duration: 0.7 }, 0.65)
          .to(lines('paper', 'frame'), { autoAlpha: 0, duration: 0.6 }, 0.9)

          .to(lines('portrait', 'frame'), { ...pen, duration: 0.5, stagger: 0.11 }, 0.15)
          .to(lines('portrait', 'hatch'), { ...pen, duration: 0.4, stagger: 0.035 }, 0.55)
          .to(fill('portrait'), { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.6)
          .fromTo(fill('portrait'), { scale: 1.07 }, { scale: 1, duration: 1.8 }, 0.6)
          .to(lines('portrait', 'hatch'), { autoAlpha: 0, duration: 0.7, stagger: 0.015 }, 1.25)
          .to(lines('portrait', 'frame'), { autoAlpha: 0, duration: 0.6 }, 1.7)

          .fromTo(q('[data-hero-accent]'),
            { clipPath: 'inset(-12% 100% -12% -6%)' },
            { clipPath: 'inset(-12% -6% -12% -6%)', duration: 0.8 }, 0.3)
          .to(q('[data-sketch="underline"]'), { ...pen, duration: 0.7 }, 0.9)

          .fromTo(q('[data-hero-caption]'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.7)

        // Los estados iniciales ya están puestos por GSAP: se retira la clase que los sostenía por CSS.
        document.documentElement.classList.remove('entrance-pending')
      })
    })

    return () => { cancelled = true; revert() }
  }, [sectionRef])
}
