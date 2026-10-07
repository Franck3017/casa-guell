// GSAP en carga diferida. Solo se usa dentro de efectos (animaciones), así que no hace falta para pintar la
// página: sacarlo del archivo principal lo aligera. Cada cargador pide su parte una sola vez y la comparte.

type Gsap = typeof import('gsap').default
type ScrollTriggerStatic = typeof import('gsap/ScrollTrigger').ScrollTrigger

let core: Promise<Gsap> | null = null
let withDrawSvg: Promise<Gsap> | null = null
let withScrollTrigger: Promise<{ gsap: Gsap, ScrollTrigger: ScrollTriggerStatic }> | null = null

/** El núcleo de GSAP. */
export function loadGsap (): Promise<Gsap> {
  core ??= import('gsap').then((m) => m.default)
  return core
}

/** GSAP con DrawSVG registrado (trazos que se dibujan). */
export function loadGsapDrawSvg (): Promise<Gsap> {
  withDrawSvg ??= Promise.all([loadGsap(), import('gsap/DrawSVGPlugin')]).then(([gsap, m]) => {
    gsap.registerPlugin(m.DrawSVGPlugin)
    return gsap
  })
  return withDrawSvg
}

/** GSAP con ScrollTrigger registrado (animaciones ligadas al scroll). */
export function loadGsapScrollTrigger (): Promise<{ gsap: Gsap, ScrollTrigger: ScrollTriggerStatic }> {
  withScrollTrigger ??= Promise.all([loadGsap(), import('gsap/ScrollTrigger')]).then(([gsap, m]) => {
    gsap.registerPlugin(m.ScrollTrigger)
    return { gsap, ScrollTrigger: m.ScrollTrigger }
  })
  return withScrollTrigger
}
