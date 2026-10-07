export const IMG = {
  chefCigalas: '/assets/img/mercat2.webp',
  chefSetas: '/assets/img/chef_jordi.webp',
  chefBrioche: '/assets/img/chef_brioche.webp',
  cigalaMano: '/assets/img/mercat3.webp'
} as const

export const NAV_IDS = ['filosofia', 'carta', 'mercat', 'ubicacio'] as const
export type NavId = (typeof NAV_IDS)[number]

/**
 * srcset de una foto con versiones reducidas junto al original (`foto-800.webp` junto a `foto.webp`).
 * El navegador elige según `sizes` y la densidad de pantalla; el original es la versión grande.
 */
export function imgSrcSet (src: string, small: number, original: number): string {
  return `${src.replace('.webp', `-${small}.webp`)} ${small}w, ${src} ${original}w`
}
