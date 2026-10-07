/** Slugifica un nombre de plato para construir la ruta de su imagen. */
const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Ruta de la imagen del plato. Convención: /assets/img/dishes/<slug>.jpg */
export function dishImage (name: string): string {
  return `/assets/img/dishes/${slug(name)}.webp`
}
