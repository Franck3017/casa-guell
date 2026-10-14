import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { LEGAL_DOC_IDS } from '@/features/legal/content/types'
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
// La hoja de estilos y el JavaScript de entrada llevan un hash en el nombre.
const CSS_FILE = asset(/^index-.*\.css$/)
const JS_FILE = asset(/^index-.*\.js$/)

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

  // Al cambiar de pestaña la lista entra con el fundido corto de la casa (state-in) en vez de aparecer de
  // golpe. Va en el panel de cada sección, que es lo que se estrena tanto al elegir sección como al
  // cambiar de familia; en el de la familia sumaría un segundo fundido encima.
  it('las listas de la carta entran con el fundido de la casa, una sola vez', () => {
    const panels = menuSectionOf(html).match(/<div[^>]*role="tabpanel"[^>]*>/g) ?? []
    const fades = (panel: string): boolean => /class="[^"]*\bstate-in\b/.test(panel)
    const sections = panels.filter((panel) => panel.includes('-set-panel-'))
    const families = panels.filter((panel) => panel.includes('-family-panel-'))

    expect(sections).toHaveLength(Object.values(GROUPS).flatMap((group) => group.sets).length)
    expect(sections.filter((panel) => !fades(panel))).toEqual([])
    expect(families).toHaveLength(Object.keys(GROUPS).length)
    expect(families.filter(fades)).toEqual([])
  })

  // La información legal (aviso, privacidad, cookies, alérgenos y consumo) tiene que estar a un clic desde
  // cualquier página: sus cuatro enlaces van en el pie.
  it('enlaza desde el pie los cuatro documentos legales', () => {
    const footer = html.slice(html.indexOf('<footer'))

    for (const doc of LEGAL_DOC_IDS) {
      expect(footer).toContain(`href="/${locale}/legal#${doc}"`)
    }
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

// La información legal es una página propia en cada idioma. Va escrita en un archivo, como la portada: así
// el servidor la entrega con 200 a quien llega por el enlace, y se lee sin ejecutar JavaScript.
describe.each(['ca', 'es', 'en'] as const)('información legal generada /%s/legal', (locale) => {
  const html = read(`${locale}/legal.html`)
  const address = `https://casa-guell-drab.vercel.app/${locale}/legal`

  it('está en su idioma y con su título', () => {
    expect(html).toContain(`<html lang="${locale}"`)
    expect(html).toContain(`<title>${DICTS[locale].legal.title} · Casa Güell</title>`)
  })

  it('se presenta con su propia dirección, no con la de la portada', () => {
    expect(html).toContain(`<link rel="canonical" href="${address}" />`)
    expect(html).toContain(`<meta property="og:url" content="${address}" />`)
    expect(html).toContain(`<link rel="alternate" hreflang="${locale}" href="${address}" />`)
  })

  it('se escribe igual en las dos rutas que usan los alojamientos', () => {
    expect(read(`${locale}/legal/index.html`)).toBe(html)
  })

  it('trae los cuatro documentos ya pintados, cada uno con su ancla', () => {
    for (const doc of LEGAL_DOC_IDS) {
      expect(html).toContain(`<section id="${doc}"`)
    }
  })

  it('no deja contenido pendiente de colocar por script', () => {
    expect(html).not.toContain('<template id="B:')
    expect(html).not.toContain('$RC(')
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
  const css = read(CSS_FILE)
  const js = read(JS_FILE)

  // Tailwind solo debe leer src/. Estas dos clases salen en las guías de .agents/ y .claude/, no en la web.
  it('el CSS no arrastra clases de carpetas que no son de la aplicación', () => {
    expect(css).not.toContain('mix-blend-luminosity')
    expect(css).not.toContain('bg-zinc-900')
  })

  // El cambio de tema apaga la animación de la transición para dibujar encima su onda. Esa regla solo
  // puede valer mientras dura ese cambio (data-vt): aplicada a todas, los cambios de página y de idioma
  // se quedarían sin fundido y nada más lo delataría.
  it('la onda del cambio de tema no apaga las demás transiciones', () => {
    const selectors = [...css.matchAll(/([^{}]*::view-transition-(?:old|new)\(root\)[^{}]*)\{/g)]
      .flatMap((rule) => rule[1].split(','))
      .filter((selector) => selector.includes('::view-transition-'))

    expect(selectors.length).toBeGreaterThan(0)
    expect(selectors.filter((selector) => !selector.includes('[data-vt]'))).toEqual([])
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
    expect(gzipKb(CSS_FILE)).toBeLessThanOrEqual(maxOf('Peso del CSS'))
  })

  it('el JavaScript principal no pasa de su límite', () => {
    expect(gzipKb(JS_FILE)).toBeLessThanOrEqual(maxOf('Peso del JavaScript principal'))
  })
})
