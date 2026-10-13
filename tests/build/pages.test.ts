import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { GROUPS } from '@/features/menu/menu-groups'
import { ca } from '@/i18n/locales/ca'
import { en } from '@/i18n/locales/en'
import { es } from '@/i18n/locales/es'
import { displayName } from '@/lib/menuFormat'
import { maxOf } from '../../scripts/constraints.mjs'

// Estas pruebas leen lo que deja `pnpm build` en dist/. Se lanzan con `pnpm test:build`, que compila antes.
if (!existsSync('dist/es.html')) throw new Error('Falta dist/: lanza `pnpm test:build`, que compila antes de probar.')

const read = (file: string): string => readFileSync(`dist/${file}`, 'utf8')
const count = (text: string, piece: string): number => text.split(piece).length - 1
const gzipKb = (file: string): number => gzipSync(readFileSync(`dist/${file}`), { level: 9 }).length / 1000
const asset = (pattern: RegExp): string => {
  const name = readdirSync('dist/assets').find((file) => pattern.test(file))
  if (name == null) throw new Error(`No hay ningún archivo ${pattern} en dist/assets`)
  return `assets/${name}`
}

const DICTS = { ca, es, en }
/** Los nombres de la carta tal como se pintan, uno por plato (alguno se repite en más de una sección). */
const dishNames = Object.values(GROUPS).flatMap((group) => group.sets).flatMap(([, items]) => items.map((item) => displayName(item.nombre)))
/** Como escribe React un texto en el HTML. */
const escapeHtml = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
/** El trozo de página que va de la sección de la carta a la siguiente. */
const menuSectionOf = (html: string): string => {
  const start = html.indexOf('id="carta"')
  const end = html.indexOf('id="mercat"')
  if (start === -1 || end <= start) throw new Error('No encuentro la sección de la carta (id="carta") seguida de la del mercado (id="mercat")')
  return html.slice(start, end)
}

describe.each(['ca', 'es', 'en'] as const)('portada generada /%s', (locale) => {
  const html = read(`${locale}.html`)

  it('está en su idioma y con su título', () => {
    expect(html).toContain(`<html lang="${locale}"`)
    expect(html).toContain(`<title>${DICTS[locale].meta.title}</title>`)
  })

  it('se escribe igual en las dos rutas que usan los alojamientos', () => {
    expect(read(`${locale}/index.html`)).toBe(html)
  })

  // React adopta este HTML al arrancar: la carta tiene que venir entera y en su sitio, no en un bloque
  // aparte que un script coloca después (así salía cuando su código se cargaba por separado).
  it('trae todos los platos de la carta dentro de su sección', () => {
    const menuSection = menuSectionOf(html)
    const timesInTheMenu = (name: string): number => dishNames.filter((other) => other === name).length

    const missing = [...new Set(dishNames)].filter((name) => count(menuSection, `>${escapeHtml(name)}<`) < timesInTheMenu(name))

    expect(missing).toEqual([])
  })

  it('no deja contenido pendiente de colocar por script', () => {
    expect(html).not.toContain('<template id="B:')
    expect(html).not.toContain('$RC(')
  })

  it('precarga la foto del hero una sola vez', () => {
    expect(count(html, '<link rel="preload" as="image"')).toBe(1)
  })

  it('lleva el esqueleto de carga del mapa', () => {
    expect(html).toContain('data-boneyard="restaurant-map"')
  })
})

describe('página para rutas que no existen', () => {
  const html = read('404.html')

  it('va vacía, para que la aplicación se monte de cero', () => {
    expect(html).toContain('<div id="root"></div>')
  })

  it('pide a los buscadores que no la indexen', () => {
    expect(html).toContain('<meta name="robots" content="noindex, follow" />')
  })
})

describe('archivos de la aplicación', () => {
  const css = read(asset(/^index-.*\.css$/))
  const js = read(asset(/^index-.*\.js$/))

  // Tailwind solo debe leer src/. Estas dos clases salen en las guías de .agents/ y .claude/, no en la web.
  it('el CSS no arrastra clases de carpetas que no son de la aplicación', () => {
    expect(css).not.toContain('mix-blend-luminosity')
    expect(css).not.toContain('bg-zinc-900')
  })

  it('la réplica con la que boneyard mide el mapa no entra en producción', () => {
    expect(js).not.toContain('h-[67px]')
  })
})

// Presupuestos de peso, en kB con gzip. Los números están en CONSTRAINTS.md, con su motivo: si un cambio
// los supera a propósito, se suben allí y se dice por qué en el commit.
describe('peso de lo que se descarga al entrar', () => {
  it('el HTML de la portada no pasa de su límite', () => {
    expect(gzipKb('es.html')).toBeLessThanOrEqual(maxOf('Peso del HTML de la portada'))
  })

  it('el CSS no pasa de su límite', () => {
    expect(gzipKb(asset(/^index-.*\.css$/))).toBeLessThanOrEqual(maxOf('Peso del CSS'))
  })

  it('el JavaScript principal no pasa de su límite', () => {
    expect(gzipKb(asset(/^index-.*\.js$/))).toBeLessThanOrEqual(maxOf('Peso del JavaScript principal'))
  })
})
