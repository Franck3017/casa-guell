import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { loadGsapScrollTrigger } from '@/lib/gsapLoader'

const WIPE = 'power3.inOut'
const SHOWN = 'inset(0% 0% 0% 0%)'

/**
 * Pieza animada de la portada ("Casa Güell en cinco ideas"): seis escenas apiladas que se van destapando
 * una sobre otra, cada una con su frase y un gráfico que la cuenta, y que acaban en el rótulo de la casa.
 * Es una sola línea de tiempo en bucle. Solo corre mientras la pieza está en pantalla y se puede pausar.
 * Localiza sus piezas por atributos data-* (data-scene, data-word, data-char, data-plate, data-bubble,
 * data-bar, data-tick, data-hand, data-slow-fill, data-shortcut, data-route, data-film-kicker, data-cover).
 * Sin JS o con movimiento reducido no se monta nada: queda a la vista la última escena, el rótulo.
 */
export function useBrandFilm (stageRef: React.RefObject<HTMLElement | null>, rerunKey: string) {
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)
  const control = useRef<{ setUserPaused: (value: boolean) => void } | null>(null)

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (stage == null) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let cancelled = false
    let revert = (): void => {}

    void loadGsapScrollTrigger().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return
      let inView = false
      let userPaused = false

      const ctx = gsap.context(() => {
        const q = gsap.utils.selector(stage)
        const scene = (name: string) => q(`[data-scene="${name}"]`)
        const words = (name: string) => q(`[data-scene="${name}"] [data-word]`)
        const rise = { yPercent: 0, duration: 0.9, stagger: 0.08, ease: 'power4.out' }

        const tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: 'power3.out' } })

        // A · Producto de mercado: el plato se traza y la frase sube
        tl.fromTo(q('[data-plate]'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.15 }, 0)
          .fromTo(words('a'), { yPercent: 115 }, rise, 0.15)
          .fromTo(q('[data-plate-dot]'), { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2.4)', transformOrigin: '50% 50%' }, 1.1)

          // B · Xup-xup: la olla se abre desde el centro del plato y hierve
          .fromTo(scene('b'), { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 0.9, ease: WIPE }, 2.4)
          .fromTo(q('[data-char]'), { yPercent: 125, rotate: 9 }, { yPercent: 0, rotate: 0, duration: 0.6, stagger: 0.035, ease: 'back.out(1.9)' }, 2.75)
          .fromTo(q('[data-bubble]'), { yPercent: 0, autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.25, stagger: 0.11 }, 2.7)
          .to(q('[data-bubble]'), { yPercent: -1100, duration: 2.3, stagger: 0.11, ease: 'power1.in' }, 2.7)

          // C · Memoria catalana: sube como un caldo y cruzan las cuatro barras
          .fromTo(scene('c'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: SHOWN, duration: 0.8, ease: WIPE }, 5.0)
          .fromTo(q('[data-bar]'), { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left center', duration: 0.9, stagger: 0.09, ease: 'power4.inOut' }, 5.35)
          .fromTo(words('c'), { yPercent: 115 }, rise, 5.6)

          // D · Fuego lento: el reloj da una vuelta entera mientras la frase se llena despacio
          .fromTo(scene('d'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: SHOWN, duration: 0.8, ease: WIPE }, 7.6)
          .fromTo(words('d'), { yPercent: 115 }, rise, 7.9)
          .fromTo(q('[data-tick]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, stagger: 0.05 }, 8.0)
          .fromTo(q('[data-hand]'), { rotate: 0 }, { rotate: 360, svgOrigin: '50 50', duration: 2.5, ease: 'none' }, 8.0)
          .fromTo(q('[data-slow-fill]'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: SHOWN, duration: 1.7, ease: 'none' }, 8.75)

          // E · Sin atajos: el atajo recto se descarta y se dibuja el camino largo
          .fromTo(scene('e'),
            { clipPath: 'polygon(0% 0%, 0% 0%, -30% 100%, -30% 100%)' },
            { clipPath: 'polygon(0% 0%, 130% 0%, 100% 100%, -30% 100%)', duration: 0.9, ease: WIPE }, 10.6)
          .fromTo(words('e'), { yPercent: 115 }, rise, 11.0)
          .fromTo(q('[data-shortcut]'), { strokeDashoffset: 1, autoAlpha: 1 }, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.in' }, 11.2)
          .to(q('[data-shortcut]'), { autoAlpha: 0, duration: 0.3 }, 11.75)
          .fromTo(q('[data-route]'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power1.inOut' }, 11.75)

          // F · El rótulo de la casa
          .fromTo(scene('f'), { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 0.9, ease: WIPE }, 13.5)
          .fromTo(words('f'), { yPercent: 112 }, { ...rise, duration: 1.1, stagger: 0.12 }, 13.85)
          .fromTo(q('[data-film-underline]'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 14.5)
          .fromTo(q('[data-film-kicker]'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 14.7)

          // Cortina del color de la primera escena: el bucle vuelve a empezar sin corte
          .fromTo(q('[data-cover]'), { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: SHOWN, duration: 0.8, ease: WIPE }, 16.8)

        const sync = (): void => { if (inView && !userPaused) tl.play(); else tl.pause() }
        ScrollTrigger.create({
          trigger: stage,
          start: 'top 85%',
          end: 'bottom 15%',
          onToggle: (self) => { inView = self.isActive; sync() }
        })
        control.current = { setUserPaused: (value) => { userPaused = value; sync() } }
      }, stage)

      revert = () => ctx.revert()
      setReady(true)
    })

    return () => { cancelled = true; revert(); control.current = null; setReady(false); setPaused(false) }
  }, [stageRef, rerunKey])

  const toggle = useCallback(() => {
    setPaused((prev) => {
      control.current?.setUserPaused(!prev)
      return !prev
    })
  }, [])

  return { ready, paused, toggle }
}
