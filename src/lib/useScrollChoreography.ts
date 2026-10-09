import { useLayoutEffect } from 'react'
import { loadGsapScrollTrigger } from '@/lib/gsapLoader'

/**
 * Coreografía de scroll de la página. Los componentes solo marcan qué son con atributos data-*;
 * aquí se decide cómo se mueven, para que todo comparta curvas y ritmo:
 *   data-split        titular: las palabras ([data-word]) suben desde detrás de su máscara
 *   data-ink          cita: las palabras ([data-word]) se entintan a medida que se hace scroll
 *   data-draw         filete que se traza de izquierda a derecha
 *   data-wipe         foto que se descubre de abajo arriba, con la imagen asentándose
 *   data-parallax     capa que se desplaza a otra velocidad (valor = % de recorrido)
 *   data-print-drift  papel de bandeja que se desliza bajo el texto
 *   data-magnetic     control que se deja atraer por el cursor (solo ratón)
 * Nada se oculta desde el CSS: si no hay JS o se pide reducir movimiento, todo se ve colocado.
 * GSAP y ScrollTrigger llegan en carga diferida; la coreografía se monta en cuanto están.
 */
export function useScrollChoreography (rerunKey: string): void {
  useLayoutEffect(() => {
    let cancelled = false
    let revert = (): void => {}

    void loadGsapScrollTrigger().then(({ gsap, ScrollTrigger }) => {
    if (cancelled) return
    const mm = gsap.matchMedia()
    revert = () => mm.revert()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
        gsap.from(el.querySelectorAll('[data-word]'), {
          yPercent: 115,
          rotate: 4,
          duration: 1,
          ease: 'power4.out',
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-ink]').forEach((el) => {
        gsap.from(el.querySelectorAll('[data-word]'), {
          opacity: 0.16,
          ease: 'none',
          stagger: 0.4,
          scrollTrigger: { trigger: el, start: 'top 82%', end: 'top 38%', scrub: 0.4 }
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-draw]').forEach((el) => {
        gsap.from(el, {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: 1.2,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true }
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-wipe]').forEach((el) => {
        const img = el.querySelector('img')
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 82%', once: true } })
        tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power4.inOut' })
        if (img != null) tl.from(img, { scale: 1.25, duration: 1.7, ease: 'power3.out' }, 0)
      })

      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        const amount = Number(el.dataset.parallax)
        gsap.fromTo(el, { yPercent: amount }, {
          yPercent: -amount,
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-print-drift]').forEach((el) => {
        gsap.to(el, {
          backgroundPosition: '-90px -160px',
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
        })
      })

      // El contenido diferido (carta, mapa) cambia la altura de la página: se recalculan los disparadores.
      let frame = 0
      const ro = new ResizeObserver(() => {
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(() => ScrollTrigger.refresh())
      })
      ro.observe(document.body)
      return () => { ro.disconnect(); cancelAnimationFrame(frame) }
    })

    mm.add('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)', () => {
      const offs: Array<() => void> = []
      gsap.utils.toArray<HTMLElement>('[data-magnetic]').forEach((el) => {
        const toX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
        const toY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
        const move = (e: PointerEvent): void => {
          const r = el.getBoundingClientRect()
          toX((e.clientX - (r.left + r.width / 2)) * 0.28)
          toY((e.clientY - (r.top + r.height / 2)) * 0.4)
        }
        const leave = (): void => { toX(0); toY(0) }
        el.addEventListener('pointermove', move)
        el.addEventListener('pointerleave', leave)
        offs.push(() => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) })
      })
      return () => offs.forEach((off) => off())
    })

    })

    return () => { cancelled = true; revert() }
  }, [rerunKey])
}
