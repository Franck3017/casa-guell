import { writeFileSync } from 'node:fs'

const BASE = 'https://www.casaguellbcn.com'
const LOCALES = ['ca', 'es', 'en']
const today = new Date().toISOString().split('T')[0]

function alternates(pathFn) {
  return (
    LOCALES.map(
      (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${BASE}/${l}${pathFn(l)}"/>`,
    ).join('\n') +
    `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/ca${pathFn('ca')}"/>`
  )
}

const urls = LOCALES.map(
  (l) =>
    `  <url>\n    <loc>${BASE}/${l}</loc>\n    <lastmod>${today}</lastmod>\n${alternates(() => '')}\n  </url>`,
)

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`
writeFileSync('public/sitemap.xml', xml)
console.log(`✅ sitemap.xml generado con ${urls.length} URLs`)