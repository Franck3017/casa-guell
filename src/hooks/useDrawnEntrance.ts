import { useLayoutEffect } from 'react'
import { loadGsapDrawSvg } from '@/lib/gsapLoader'

// Cada cuánto sale una bocanada de vapor: los 2,6 s que dura (ver .steam-wisp en globals.css) y 3,4 s de reposo
const STEAM_EVERY_MS = 6000

/**
 * Entrada dibujada del hero: una pluma azul traza el marco de la hoja de papel, que aparece debajo, y
 * enmarca el retrato; después las líneas se retiran. "sin maquillaje" se escribe y se subraya con el mismo
 * trazo. Luego una tiza rodea el plato de la semana, tira una flecha hasta su pie y el pie se escribe;
 * después, de vez en cuando, sube un poco de vapor del plato. El resto del titular y los botones no se animan.
 * El retrato no espera a nada de esto: es la imagen más grande de la primera pantalla y está a la vista
 * desde que la página se pinta, llegue cuando llegue el JavaScript. La pluma dibuja alrededor de él.
 * Localiza sus piezas por atributos data-* (data-sketch-layer, data-sketch, data-hero-fill, data-hero-accent,
 * data-hero-caption, data-hero-caption-line, data-hero-wordmark, data-note). Solo corre si el usuario no ha
 * pedido reducir el movimiento.
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
        const frame = (layer: string) => q(`[data-sketch-layer="${layer}"] [data-sketch="frame"]`)
        const paper = q('[data-hero-fill]')
        const note = (kind: string) => q(`[data-note="${kind}"]`)

        // Vapor: lo anima el CSS (.steam-wisp en globals.css), no GSAP, para que el navegador lo mueva sin
        // repintar. Aquí solo se da la salida de cada bocanada: la primera pone data-steam en el hero, con
        // lo que arranca la animación, y las siguientes la vuelven a reproducir cada 6 s. Entre una y otra
        // no queda ninguna animación en marcha.
        const steamFrom = (delay: number): (() => void) => {
          let inView = true
          let timer = 0
          const puff = (): void => {
            timer = window.setTimeout(puff, STEAM_EVERY_MS)
            // Con el hero fuera de pantalla no sale vapor
            if (!inView) return
            if (section.dataset.steam == null) { section.dataset.steam = ''; return }
            for (const animation of section.getAnimations({ subtree: true })) {
              if (animation instanceof CSSAnimation && animation.animationName.startsWith('steam-')) animation.play()
            }
          }
          timer = window.setTimeout(puff, delay * 1000)
          const watcher = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting })
          watcher.observe(section)
          return () => {
            window.clearTimeout(timer)
            watcher.disconnect()
            delete section.dataset.steam
          }
        }

        // Si GSAP llega después de que el temporizador de index.html haya destapado el hero (conexión o
        // equipo lentos), el visitante ya lo está viendo entero: ocultarlo otra vez para animarlo sería un
        // parpadeo. Se queda como está y solo se añade el vapor.
        if (!document.documentElement.classList.contains('entrance-pending')) return steamFrom(1.2)

        gsap.set(layers, { visibility: 'visible' })
        gsap.set(q('[data-sketch]'), { drawSVG: '0%' })
        gsap.set(paper, { opacity: 0 })
        gsap.set([note('loop'), note('arrow'), note('arrowhead')], { drawSVG: '0%' })
        gsap.set(q('[data-hero-caption]'), { autoAlpha: 0 })

        const pen = { drawSVG: '100%', ease: 'power2.inOut' }
        const tl = gsap.timeline({
          defaults: { ease: 'power3.out', force3D: true }
        })

        tl.fromTo(q('[data-hero-wordmark]'), { yPercent: 28, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 2 }, 0)

          .to(frame('paper'), { ...pen, duration: 0.5, stagger: 0.1 }, 0)
          .to(paper, { opacity: 1, duration: 0.7 }, 0.65)
          .to(frame('paper'), { autoAlpha: 0, duration: 0.6 }, 0.9)

          // El retrato ya está a la vista: la pluma lo enmarca y se retira antes de que entre la tiza
          .to(frame('portrait'), { ...pen, duration: 0.5, stagger: 0.11 }, 0.15)
          .to(frame('portrait'), { autoAlpha: 0, duration: 0.6 }, 1.3)

          .fromTo(q('[data-hero-accent]'),
            { clipPath: 'inset(-12% 100% -12% -6%)' },
            { clipPath: 'inset(-12% -6% -12% -6%)', duration: 0.8 }, 0.3)
          .to(q('[data-sketch="underline"]'), { ...pen, duration: 0.7 }, 0.9)

          // Anotaciones: círculo alrededor del plato, flecha hasta el pie y el pie que se escribe
          .to(note('loop'), { drawSVG: '100%', duration: 0.85, ease: 'power2.inOut' }, 1.9)
          .to(note('arrow'), { drawSVG: '100%', duration: 0.45, ease: 'power2.in' }, 2.7)
          .to(note('arrowhead'), { drawSVG: '100%', duration: 0.18, ease: 'power1.out' }, 3.15)
          .set(q('[data-hero-caption]'), { autoAlpha: 1 }, 3.05)

        // El pie existe dos veces (colgado del retrato en escritorio, bajo el collage en móvil) y solo se ve
        // una. Cada copia escribe sus líneas por su cuenta: en un solo escalonado, la visible esperaría a la oculta.
        q('[data-hero-caption]').forEach((caption) => {
          tl.fromTo(caption.querySelectorAll('[data-hero-caption-line]'),
            { clipPath: 'inset(-15% 100% -15% 0%)' },
            { clipPath: 'inset(-15% -3% -15% 0%)', duration: 0.5, stagger: 0.22, ease: 'power2.out' }, 3.1)
        })

        const stopSteam = steamFrom(4.6)

        // Los estados iniciales ya están puestos por GSAP: se retira la clase que los sostenía por CSS.
        document.documentElement.classList.remove('entrance-pending')
        return stopSteam
      })
    })

    return () => { cancelled = true; revert() }
  }, [sectionRef])
}
