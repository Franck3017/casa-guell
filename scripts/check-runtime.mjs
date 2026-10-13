// Comprobaciones que necesitan la web en marcha: accesibilidad (axe-core) y rendimiento (Lighthouse).
// Sirve dist/ comprimido como lo hace el alojamiento, abre un solo Chromium para las dos y compara con
// los límites de CONSTRAINTS.md, que se leen de ese archivo.
// Uso: node scripts/check-runtime.mjs [--strict]   (necesita dist/: lo deja `pnpm build`)
import { existsSync, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { AxeBuilder } from '@axe-core/playwright'
import lighthouse from 'lighthouse'
import { chromium } from 'playwright'
import { maxOf, minOf } from './constraints.mjs'

// Cada límite, por el nombre de su regla en CONSTRAINTS.md. `max`: no puede pasar de ahí; `min`: no puede bajar.
const LIMITS = {
  seriousA11y: { max: maxOf('Accesibilidad'), label: 'Fallos graves o críticos de accesibilidad' },
  cls: { max: maxOf('CLS'), label: 'CLS' },
  tbt: { max: maxOf('TBT'), label: 'Bloqueo total, TBT (ms)' },
  lcp: { max: maxOf('LCP de Lighthouse'), label: 'LCP (ms)' },
  score: { min: minOf('Nota de Lighthouse'), label: 'Nota de rendimiento de Lighthouse' }
}
const LIGHTHOUSE_RUNS = 3
// Por debajo de este índice el equipo está frenado (calor, ahorro de energía) y Lighthouse da tiempos
// que no son de la web: la medición de rendimiento no se da por válida.
const MIN_BENCHMARK_INDEX = 1000

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')
if (!existsSync(path.join(dist, 'es.html'))) {
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
const origin = `http://127.0.0.1:${await listen(server)}`

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

  // Rendimiento: Lighthouse en móvil sobre /es, varias pasadas y la mediana.
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
} finally {
  await browser.close()
  server.close()
}

const throttled = measured.bench < MIN_BENCHMARK_INDEX
let failed = 0
for (const [key, { min, max, label }] of Object.entries(LIMITS)) {
  const value = measured[key]
  const ok = (min == null || value >= min) && (max == null || value <= max)
  // Con el equipo frenado solo vale la accesibilidad, que no depende de la velocidad.
  const skipped = throttled && key !== 'seriousA11y'
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
