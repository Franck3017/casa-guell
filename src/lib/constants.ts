export const IMG = {
  chefCigalas: '/assets/img/mercat2.webp',
  chefSetas: '/assets/img/chef_jordi.webp',
  chefBrioche: '/assets/img/chef_brioche.webp',
  cigalaMano: '/assets/img/mercat3.webp'
} as const

/**
 * Retrato del hero: la imagen más grande de la primera pantalla. La piden el <img> (HeroCollage) y el
 * <link rel="preload"> del HTML prerenderizado, que tienen que coincidir en srcset y sizes para que el
 * navegador no la descargue dos veces.
 */
export const HERO_PORTRAIT = {
  src: IMG.chefBrioche,
  srcSet: `${IMG.chefBrioche.replace('.webp', '-640.webp')} 640w, ${IMG.chefBrioche.replace('.webp', '-800.webp')} 800w, ${IMG.chefBrioche} 1024w`,
  // Ocupa el 70 % del collage: en móvil, el ancho de pantalla menos los márgenes; en escritorio, como mucho 720 px
  sizes: '(min-width: 768px) 504px, calc(70vw - 34px)'
} as const

export const NAV_IDS =['filosofia', 'carta', 'mercat', 'ubicacio'] as const
export type NavId = (typeof NAV_IDS)[number]

/**
 * srcset de una foto con versiones reducidas junto al original (`foto-800.webp` junto a `foto.webp`).
 * El navegador elige según `sizes` y la densidad de pantalla; el original es la versión grande.
 */
export function imgSrcSet (src: string, small: number, original: number): string {
  return `${src.replace('.webp', `-${small}.webp`)} ${small}w, ${src} ${original}w`
}
