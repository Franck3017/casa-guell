// Último paso del build: escribe cada página de cada idioma (la portada y la información legal) con el
// contenido ya pintado y su <head>. Así buscadores, asistentes y redes sociales la leen sin ejecutar
// JavaScript, y un servidor estático responde a /ca, /es/legal… con un archivo real.
// Requiere dist/ (vite build) y dist-ssr/ (vite build --ssr src/entry-prerender.tsx).
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const ssr = path.join(root, 'dist-ssr')

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const escapeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

/** Sustituye el atributo content de una etiqueta <meta>; falla si la etiqueta no está en la plantilla. */
function setMeta (html, attr, key, content) {
  const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`)
  if (!re.test(html)) throw new Error(`La plantilla no tiene <meta ${attr}="${key}">`)
  return html.replace(re, `$1${escapeAttr(content)}$2`)
}

const { renderPage, headFor, LOCALES, PAGES, ROBOTS } = await import(pathToFileURL(path.join(ssr, 'entry-prerender.js')).href)
const template = await readFile(path.join(dist, 'index.html'), 'utf8')
if (!template.includes('<div id="root"></div>')) throw new Error('La plantilla no tiene <div id="root"></div>')

for (const { locale, page } of LOCALES.flatMap((locale) => PAGES.map((page) => ({ locale, page })))) {
  const head = headFor(locale, page)
  const body = await renderPage(locale, page)

  let html = template.replace(/<html lang="[^"]*"/, `<html lang="${locale}"`)
  // Las versiones en otros idiomas que anuncia la plantilla son las de la portada: aquí, las de esta página
  html = html.replace(/(<link rel="alternate" hreflang="[^"]+" href="[^"]+)(" \/>)/g, `$1${page}$2`)
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeText(head.title)}</title>`)
  html = setMeta(html, 'name', 'description', head.description)
  html = setMeta(html, 'property', 'og:title', head.title)
  html = setMeta(html, 'property', 'og:description', head.description)

  const extra = [
    `<link rel="canonical" href="${head.canonical}" />`,
    `<meta name="robots" content="${head.robots}" />`,
    `<meta property="og:url" content="${head.canonical}" />`,
    `<meta property="og:locale" content="${head.ogLocale}" />`,
    `<meta property="og:image:alt" content="${escapeAttr(head.title)}" />`,
    `<meta name="twitter:title" content="${escapeAttr(head.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(head.description)}" />`,
    `<meta name="twitter:image" content="${head.ogImage}" />`,
    ...Object.entries(head.jsonLd).map(([id, data]) =>
      `<script id="${id}" type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`)
  ].map((line) => `    ${line}`).join('\n')

  html = html.replace('</head>', `${extra}\n  </head>`)
  html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`)

  // Dos copias: <ruta>/index.html (servidores que resuelven carpetas) y <ruta>.html (los que resuelven
  // "URL limpias"). Cada alojamiento usa una u otra para responder a /<idioma> y a /<idioma>/legal.
  const file = path.join(dist, `${locale}${page}`)
  await mkdir(file, { recursive: true })
  await writeFile(path.join(file, 'index.html'), html)
  await writeFile(`${file}.html`, html)
  console.log(`  prerender /${locale}${page}  ${(html.length / 1024).toFixed(0)} kB`)
}

// Página para rutas que no existen: la aplicación vacía, marcada noindex. La usan como respuesta 404
// los servidores estáticos que buscan un 404.html (GitHub Pages, Netlify, Cloudflare Pages, entre otros).
await writeFile(
  path.join(dist, '404.html'),
  template.replace('</head>', `    <meta name="robots" content="${ROBOTS.noindex}" />\n  </head>`)
)

await rm(ssr, { recursive: true, force: true })
