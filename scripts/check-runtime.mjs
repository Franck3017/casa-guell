// Comprobaciones que necesitan la web en marcha: accesibilidad (axe-core), navegación (check-navigation.mjs)
// y rendimiento (Lighthouse). Abre un solo Chromium para las tres y compara con los límites de
// CONSTRAINTS.md, que se leen de ese archivo.
// Mide uno de dos bancos, cada uno con sus límites de LCP y TBT:
//   - sin --url, el build de dist/ servido desde este equipo, comprimido como lo hace el alojamiento;
//   - con --url, una web ya publicada.
// Uso: node scripts/check-runtime.mjs [--strict] [--url <dirección>] [--only accesibilidad|navegacion|rendimiento]
// (sin --url necesita dist/: lo deja `pnpm build`; --only lanza una sola parte, para no esperar a las otras)
import { existsSync, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { AxeBuilder } from '@axe-core/playwright'
import lighthouse from 'lighthouse'
import { chromium } from 'playwright'
import { checkNavigation } from './check-navigation.mjs'
import { maxOf, minOf } from './constraints.mjs'

const urlAt = process.argv.indexOf('--url')
let published = null
if (urlAt > -1) {
  try {
    published = new URL(process.argv[urlAt + 1]).origin
  } catch {
    console.error('check-runtime: --url necesita una dirección completa, por ejemplo https://ejemplo.com')
    process.exit(2)
  }
}

const PARTS = ['accesibilidad', 'navegacion', 'rendimiento']
const onlyAt = process.argv.indexOf('--only')
const only = onlyAt > -1 ? process.argv[onlyAt + 1] : null
if (only != null && !PARTS.includes(only)) {
  console.error(`check-runtime: --only admite ${PARTS.join(', ')}`)
  process.exit(2)
}
const wants = (part) => only == null || only === part

// Cada límite, por el nombre de su regla en CONSTRAINTS.md. `max`: no puede pasar de ahí; `min`: no puede bajar.
// En local, Lighthouse carga al LCP recursos que en la web publicada llegan después del primer pintado:
// por eso el LCP y el TBT tienen una regla para cada banco.
const TIMING_RULES = published == null
  ? { lcp: 'LCP de Lighthouse', tbt: 'TBT' }
  : { lcp: 'LCP en producción', tbt: 'TBT en producción' }
// `part`: la parte que lo mide. Con --only se juzga solo lo de la parte pedida.
const LIMITS = {
  seriousA11y: { part: 'accesibilidad', max: maxOf('Accesibilidad'), label: 'Fallos graves o críticos de accesibilidad' },
  navigation: { part: 'navegacion', max: maxOf('Navegación'), label: 'Fallos de navegación (transiciones y scroll)' },
  cls: { part: 'rendimiento', max: maxOf('CLS'), label: 'CLS' },
  tbt: { part: 'rendimiento', max: maxOf(TIMING_RULES.tbt), label: 'Bloqueo total, TBT (ms)' },
  lcp: { part: 'rendimiento', max: maxOf(TIMING_RULES.lcp), label: 'LCP (ms)' },
  score: { part: 'rendimiento', min: minOf('Nota de Lighthouse'), label: 'Nota de rendimiento de Lighthouse' }
}
const LIGHTHOUSE_RUNS = 3
// Por debajo de este índice el equipo está frenado (calor, ahorro de energía) y Lighthouse da tiempos
// que no son de la web: la medición de rendimiento no se da por válida.
const MIN_BENCHMARK_INDEX = 1000

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')
if (published == null && !existsSync(path.join(dist, 'es.html'))) {
  console.error('check-runtime: falta dist/. Lanza `pnpm build` antes.')
  process.exit(2)
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain'
}
// Lo que es texto viaja comprimido, como en el alojamiento.
const COMPRESSED = /\.(html|js|css|json|svg|xml|txt)$/
const isServable = (file) => file.startsWith(dist) && existsSync(file) && statSync(file).isFile()

const server = createServer((req, res) => {
  // /es puede ser es.html o es/index.html. Lo que no existe recibe la página de las rutas desconocidas.
  const base = path.join(dist, decodeURIComponent(new URL(req.url, 'http://x').pathname))
  const file = [base, `${base}.html`, path.join(base, 'index.html')].find(isServable) ?? path.join(dist, '404.html')
  const ext = path.extname(file)
  const headers = { 'Content-Type': TYPES[ext] ?? 'application/octet-stream', 'Cache-Control': 'no-store' }
  if (COMPRESSED.test(ext)) {
    res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip' })
    res.end(gzipSync(readFileSync(file)))
  } else {
    res.writeHead(200, headers)
    res.end(readFileSync(file))
  }
})
const listen = (srv) => new Promise((resolve) => srv.listen(0, '127.0.0.1', () => resolve(srv.address().port)))
const origin = published ?? `http://127.0.0.1:${await listen(server)}`

// Un puerto libre para que Lighthouse se conecte al mismo navegador que usa axe: así llega ya en marcha,
// y no mide el arranque en frío de un navegador recién abierto, que en algunos equipos falsea la nota.
const probe = createServer()
const debugPort = await listen(probe)
await new Promise((resolve) => probe.close(resolve))
const browser = await chromium.launch({ args: [`--remote-debugging-port=${debugPort}`] })

const measured = {}
const notes = []
try {
  // Accesibilidad: las tres portadas en claro y una en oscuro, con la entrada ya terminada.
  if (wants('accesibilidad')) {
    const context = await browser.newContext()
    const page = await context.newPage()
    let serious = 0
    for (const [route, colorScheme] of [['/ca', 'light'], ['/es', 'light'], ['/en', 'light'], ['/es', 'dark']]) {
      await page.emulateMedia({ reducedMotion: 'reduce', colorScheme })
      await page.goto(origin + route, { waitUntil: 'networkidle' })
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      for (const v of violations.filter((x) => x.impact === 'critical' || x.impact === 'serious')) {
        serious += v.nodes.length
        notes.push(`  ${route} (${colorScheme}) · ${v.impact} · ${v.id}: ${v.help} — ${v.nodes.length} elemento(s), p. ej. ${v.nodes[0].target.join(' ')}`)
      }
    }
    await context.close()
    measured.seriousA11y = serious
  }

  // Navegación: los cambios de página y de idioma, con su transición y su scroll.
  if (wants('navegacion')) {
    const failures = await checkNavigation(browser, origin)
    measured.navigation = failures.length
    notes.push(...failures.map((failure) => `  navegación · ${failure}`))
  }

  // Rendimiento: Lighthouse en móvil sobre /es, varias pasadas y la mediana.
  if (wants('rendimiento')) {
    const runs = []
    for (let i = 0; i < LIGHTHOUSE_RUNS; i++) {
      const { lhr } = await lighthouse(`${origin}/es`, { port: debugPort, onlyCategories: ['performance'], output: 'json', logLevel: 'error' })
      const value = (audit) => lhr.audits[audit].numericValue
      runs.push({
        score: Math.round(lhr.categories.performance.score * 100),
        lcp: Math.round(value('largest-contentful-paint')),
        cls: Number(value('cumulative-layout-shift').toFixed(3)),
        tbt: Math.round(value('total-blocking-time')),
        bench: Math.round(lhr.environment.benchmarkIndex)
      })
    }
    const median = (key) => runs.map((r) => r[key]).sort((a, b) => a - b)[Math.floor(runs.length / 2)]
    for (const key of ['score', 'lcp', 'cls', 'tbt', 'bench']) measured[key] = median(key)
    notes.push(`  Lighthouse, ${LIGHTHOUSE_RUNS} pasadas: ${runs.map((r) => `nota ${r.score} · LCP ${r.lcp} · CLS ${r.cls} · TBT ${r.tbt}`).join(' | ')} · índice del equipo ${measured.bench}`)
  }
} finally {
  await browser.close()
  if (server.listening) server.close()
}

console.log(`check-runtime: ${published == null ? 'build local (dist/)' : `web publicada, ${published}`}`)
const throttled = measured.bench != null && measured.bench < MIN_BENCHMARK_INDEX
let failed = 0
for (const [key, { part, min, max, label }] of Object.entries(LIMITS)) {
  // Con --only, lo que no se ha lanzado no se juzga. Lo que sí se ha lanzado y no ha dado valor, falla.
  if (!wants(part)) continue
  const value = measured[key]
  const ok = value != null && (min == null || value >= min) && (max == null || value <= max)
  // Con el equipo frenado solo valen la accesibilidad y la navegación, que no dependen de la velocidad.
  const skipped = throttled && key !== 'seriousA11y' && key !== 'navigation'
  if (!ok && !skipped) failed++
  let verdict = ok ? 'bien ' : 'FALLA'
  if (skipped) verdict = 'sin validez'
  const limit = min != null ? `mínimo ${min}` : `máximo ${max}`
  console.log(`${verdict} · ${label}: ${value} (${limit})`)
}
console.log(notes.join('\n'))
if (throttled) console.log(`\ncheck-runtime: el equipo va frenado (índice ${measured.bench}, mínimo ${MIN_BENCHMARK_INDEX}). El rendimiento no se ha podido medir con garantías: repítelo con el equipo descansado.`)

// Sin --strict, lo que falle aquí es un aviso: se informa y no detiene nada (ver CONSTRAINTS.md).
// Con --strict sale con 1 si algo falla y con 2 si el rendimiento no se ha podido medir.
const strict = process.argv.includes('--strict')
if (!strict) {
  if (failed > 0) console.log(`\ncheck-runtime: ${failed} límite(s) superado(s). Es un aviso; con --strict detendría el trabajo.`)
  process.exit(0)
}
if (failed > 0) process.exit(1)
process.exit(throttled ? 2 : 0)
