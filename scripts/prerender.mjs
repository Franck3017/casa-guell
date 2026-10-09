// Último paso del build: escribe dist/<idioma>/index.html con el contenido ya pintado y el <head> de ese
// idioma. Así buscadores, asistentes y redes sociales leen la página sin ejecutar JavaScript, y un servidor
// estático responde a /ca, /es y /en con un archivo real.
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

const { renderPage, headFor, LOCALES } = await import(pathToFileURL(path.join(ssr, 'entry-prerender.js')).href)
const template = await readFile(path.join(dist, 'index.html'), 'utf8')
if (!template.includes('<div id="root"></div>')) throw new Error('La plantilla no tiene <div id="root"></div>')

for (const locale of LOCALES) {
  const head = headFor(locale)
  const body = await renderPage(locale)

  let html = template.replace(/<html lang="[^"]*"/, `<html lang="${locale}"`)
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeText(head.title)}</title>`)
  html = setMeta(html, 'name', 'description', head.description)
  html = setMeta(html, 'property', 'og:title', head.title)
  html = setMeta(html, 'property', 'og:description', head.description)

  const extra = [
    `<link rel="canonical" href="${head.canonical}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<meta property="og:url" content="${head.canonical}" />`,
    `<meta property="og:locale" content="${head.ogLocale}" />`,
    `<meta property="og:image:alt" content="${escapeAttr(head.title)}" />`,
    `<meta name="twitter:title" content="${escapeAttr(head.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(head.description)}" />`,
    `<meta name="twitter:image" content="${head.ogImage}" />`,
    // La foto del hero es lo más grande de la primera pantalla: se pide cuanto antes, y con el mismo
    // srcset y sizes que su <img> para que el navegador elija el mismo archivo y no la baje dos veces
    `<link rel="preload" as="image" href="${head.heroImage.src}" imagesrcset="${head.heroImage.srcSet}" imagesizes="${head.heroImage.sizes}" fetchpriority="high" />`,
    ...Object.entries(head.jsonLd).map(([id, data]) =>
      `<script id="${id}" type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`)
  ].map((line) => `    ${line}`).join('\n')

  html = html.replace('</head>', `${extra}\n  </head>`)
  html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`)

  // Dos copias: <idioma>/index.html (servidores que resuelven carpetas) y <idioma>.html (los que resuelven
  // "URL limpias"). Cada alojamiento usa una u otra para responder a /<idioma>.
  await mkdir(path.join(dist, locale), { recursive: true })
  await writeFile(path.join(dist, locale, 'index.html'), html)
  await writeFile(path.join(dist, `${locale}.html`), html)
  console.log(`  prerender /${locale}  ${(html.length / 1024).toFixed(0)} kB`)
}

// Página para rutas que no existen: la aplicación vacía, marcada noindex. La usan como respuesta 404
// los servidores estáticos que buscan un 404.html (GitHub Pages, Netlify, Cloudflare Pages, entre otros).
await writeFile(
  path.join(dist, '404.html'),
  template.replace('</head>', '    <meta name="robots" content="noindex, follow" />\n  </head>')
)

await rm(ssr, { recursive: true, force: true })
