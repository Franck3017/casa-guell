#!/usr/bin/env node
// Vigila el suelo de CONSTRAINTS.md mirando solo lo que cambia: lo que hay entre origin/main y el árbol de
// trabajo (commits sin subir, cambios sin commit y archivos nuevos). Busca los atajos con los que se pone
// una comprobación en verde sin arreglar nada.
//
// Detiene (salida 1) lo que rebaja el listón sin duda: un comprobador silenciado, trabajo a medias, una
// prueba saltada, borrada o con menos aserciones, un script de comprobación que pierde un paso y, en
// CONSTRAINTS.md, un umbral rebajado, una regla quitada o pasada a aviso y una excepción nueva o ampliada.
// Anota sin detener (salida 0) lo que puede ser una rebaja o no serlo: una aserción reescrita o un cambio
// en los archivos que hacen las comprobaciones. Endurecer el listón no hace ruido.
//
// Una excepción de CONSTRAINTS.md exime su regla en su ruta cuando ya está en la base (aprobada y subida)
// y no ha caducado. La que llega en el mismo cambio que la rebaja no vale.
//
// Es superficial a propósito: mira líneas con expresiones regulares. Atrapa el camino corto, no a quien
// quiera esconder un cambio. Adaptado de la referencia de la skill constraint-driven-development
// (addyosmani/agent-skills). Sus casos están en tests/guard/floorGuard.test.ts.
// Uso: node scripts/floor-guard.mjs [--base <ref>]   (por defecto, origin/main)
// Sale con 0 si está limpio, 1 si hay algo que arreglar y 2 si no ha podido comprobarlo.
import { execFileSync } from 'node:child_process'
import { closeSync, existsSync, openSync, readFileSync, readSync } from 'node:fs'

const baseArg = process.argv.indexOf('--base')
const base = baseArg > -1 ? process.argv[baseArg + 1] : 'origin/main'

// core.quotePath=false: git da las rutas con eñes y tildes tal cual, en vez de escaparlas entre comillas.
// Un fallo es null, y null nunca cuenta como limpio.
const git = (args) => {
  try {
    return execFileSync('git', ['-c', 'core.quotePath=false', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 256 * 1024 * 1024 })
  } catch {
    return null
  }
}
const bail = (msg) => { console.error(`floor-guard: ${msg}`); process.exit(2) }

const top = git(['rev-parse', '--show-toplevel'])?.trim()
if (!top) bail('esto no es un repositorio de git')
process.chdir(top)

const mergeBase = git(['merge-base', base, 'HEAD'])?.trim()
if (!mergeBase) bail(`no hay punto común con ${base}`)

// -M: un archivo movido se ve como movido, diga lo que diga la configuración de git de cada equipo.
const diff = git(['diff', '--unified=0', '-M', mergeBase, '--'])
if (diff === null) bail(`no se ha podido comparar con ${mergeBase}`)

// Lo que dice el diff: las líneas añadidas y quitadas, cada una con su archivo, y los archivos borrados
// y movidos. `---` y `+++` solo son cabeceras entre la línea `diff` de un archivo y su primer `@@`;
// dentro de un bloque todo es contenido (un `++i` añadido se ve como `+++i`).
const parseDiff = (text) => {
  const added = []
  const removed = []
  const deleted = []
  const renamed = []
  const pathOf = (s) => s.trim().replace(/^[ab]\//, '')
  let file = ''
  let oldFile = ''
  let inHeader = false
  for (const line of text.split('\n')) {
    if (line.startsWith('diff ')) inHeader = true
    else if (line.startsWith('@@')) inHeader = false
    else if (inHeader) {
      if (line.startsWith('rename from ')) oldFile = line.slice(12).trim()
      else if (line.startsWith('rename to ')) renamed.push({ from: oldFile, to: line.slice(10).trim() })
      else if (line.startsWith('--- ')) oldFile = pathOf(line.slice(4))
      else if (line.startsWith('+++ ')) {
        const newFile = pathOf(line.slice(4))
        file = newFile === '/dev/null' ? oldFile : newFile
        if (newFile === '/dev/null') deleted.push(file)
      }
    } else if (line.startsWith('+')) added.push({ file, text: line.slice(1) })
    else if (line.startsWith('-')) removed.push({ file, text: line.slice(1) })
  }
  return { added, removed, deleted, renamed }
}
const { added, removed, deleted, renamed } = parseDiff(diff)

// El diff no ve los archivos nuevos sin añadir: se leen enteros y todo su contenido cuenta como añadido.
// Se saltan los binarios (un byte nulo al principio, el criterio de git) y los repositorios anidados,
// que git lista como carpeta.
const untracked = git(['ls-files', '--others', '--exclude-standard', '-z'])
if (untracked === null) bail('no se han podido listar los archivos nuevos')
const isBinary = (f) => {
  const fd = openSync(f, 'r')
  try {
    const head = Buffer.alloc(8000)
    return head.subarray(0, readSync(fd, head, 0, head.length, 0)).includes(0)
  } finally {
    closeSync(fd)
  }
}
for (const f of untracked.split('\0').filter((name) => name !== '' && !name.endsWith('/'))) {
  try {
    if (isBinary(f)) continue
    for (const text of readFileSync(f, 'utf8').split('\n')) added.push({ file: f, text })
  } catch {
    bail(`no se ha podido leer el archivo nuevo ${f}`)
  }
}

const findings = []
const notices = []
const clip = (text) => text.trim().slice(0, 160)
const flag = (rule, f, text) => findings.push({ rule, file: f, text: clip(text) })
const note = (rule, f, text) => notices.push({ rule, file: f, text: clip(text) })
const filesIn = (lines, keep) => [...new Set(lines.map((l) => l.file))].filter(keep)

const isTest = (f) => /\.(test|spec)\./.test(f)
// Este archivo, sus pruebas y las guías instaladas nombran los patrones que se buscan: no se miran a sí mismos.
const isExempt = (f) => /^scripts\/floor-guard\.mjs$|^tests\/guard\/|^\.claude\/|^\.agents\/|^CONSTRAINTS\.md$|^pnpm-lock\.yaml$/.test(f)
// Los archivos que hacen las comprobaciones: un cambio en ellos puede hacer que comprueben menos.
const isChecker = (f) => /^scripts\/(floor-guard|check-runtime|constraints)\.mjs$|^vitest\.config\.ts$|^tests\/setup\.ts$/.test(f)

const SUPPRESSIONS = /@ts-ignore|@ts-nocheck|@ts-expect-error|eslint-disable|oxlint-disable|istanbul ignore|v8 ignore/
// TODO y FIXME solo cuentan dentro de un comentario: «todo» también es una palabra, y la carta va en mayúsculas.
const STUBS = /throw new Error\(.*[Nn]ot implemented|catch\s*\(\w*\)\s*\{\s*\}|catch\s*\{\s*\}|(\/\/|\/\*|^\s*\*|#|<!--)\s*(TODO|FIXME)\b/
const SKIPS = /\.(skip|skipIf|runIf|todo|only|fails)\b|\bx(it|test|describe)\(/
const ASSERTION = /\b(expect|assert)\b/

for (const { file: f, text } of added) {
  if (isExempt(f)) continue
  if (SUPPRESSIONS.test(text)) flag('comprobador silenciado', f, text)
  if (STUBS.test(text)) flag('trabajo a medias', f, text)
  if (isTest(f) && SKIPS.test(text)) flag('prueba saltada', f, text)
}

for (const f of deleted) {
  if (isTest(f)) flag('prueba borrada', f, 'archivo eliminado (si solo lo has movido, añade las dos rutas con git add)')
  if (isChecker(f)) flag('comprobación quitada', f, 'archivo eliminado')
}
for (const { from, to } of renamed) {
  if (isTest(from) && !isTest(to)) flag('prueba borrada', from, `ahora es ${to}, que no se ejecuta como prueba`)
  if (isChecker(from) && !isChecker(to)) flag('comprobación quitada', from, `ahora es ${to}`)
}

// Una aserción menos es una rebaja. Una reescrita (se quita una línea y se pone otra) puede serlo o no.
for (const f of filesIn(removed, (name) => isTest(name) && !deleted.includes(name))) {
  const gone = removed.filter((l) => l.file === f && ASSERTION.test(l.text))
  if (gone.length === 0) continue
  const fewer = gone.length - added.filter((l) => l.file === f && ASSERTION.test(l.text)).length
  const example = gone[0].text.trim()
  if (fewer > 0) flag('aserción quitada', f, `${fewer} menos que antes, p. ej. ${example}`)
  else note('aserción reescrita', f, `${gone.length}, p. ej. ${example}`)
}

for (const f of filesIn(removed, (name) => isChecker(name) && !deleted.includes(name))) {
  note('comprobación cambiada', f, `${removed.filter((l) => l.file === f).length} línea(s) quitada(s) o cambiada(s): que no compruebe menos que antes`)
}

// Un script de comprobación de package.json que pierde un paso, o que desaparece, comprueba menos. Si
// solo cambia un paso por otro, se anota.
const checkScript = (text) => {
  const m = text.match(/^\s*"((?:lint|typecheck|check|test)[^"]*)":\s*"(.*)",?\s*$/)
  return m && { name: m[1], steps: m[2].split('&&').map((step) => step.trim()) }
}
const scriptsIn = (lines) => lines.filter((l) => l.file === 'package.json').map((l) => checkScript(l.text)).filter(Boolean)
const scriptsNow = scriptsIn(added)
for (const was of scriptsIn(removed)) {
  const now = scriptsNow.find((s) => s.name === was.name)
  const lost = was.steps.filter((step) => !now?.steps.includes(step))
  if (lost.length === 0) continue
  if (!now) flag('comprobación quitada', 'package.json', `desaparece el script ${was.name}`)
  else if (now.steps.length < was.steps.length) flag('comprobación quitada', 'package.json', `${was.name} pierde: ${lost.join(' · ')}`)
  else note('comprobación cambiada', 'package.json', `${was.name}: ${lost.join(' · ')}  ->  ${now.steps.filter((step) => !was.steps.includes(step)).join(' · ')}`)
}

// CONSTRAINTS.md: se compara entero, el de la base con el de ahora. Una regla es una viñeta o una fila de
// tabla, y se reconoce por el texto de la viñeta antes de los dos puntos o por la primera celda de la fila.
// Los apartados que solo explican (lo que no se cumple, lo que no se comprueba) no llevan reglas.
const cells = (t) => t.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim())
const isRow = (t) => t.trim().startsWith('|')
const isSeparator = (t) => isRow(t) && /^[-: ]+$/.test(cells(t)[0])
const isException = (t) => /^\| *(W|E)\d+ *\|/.test(t.trim())
const ruleKey = (t) => {
  const s = t.trim()
  if (isRow(s)) return cells(s)[0]
  if (/^[-*] /.test(s)) return s.slice(2).split(':')[0].trim()
  return null
}
const EXPLAINS_ONLY = /no se cumplen|no se comprueba/i
const rulesOf = (text) => {
  const lines = text.split('\n').map((line) => line.trim())
  const rules = []
  let guarded = true
  lines.forEach((line, i) => {
    if (line.startsWith('#')) guarded = !EXPLAINS_ONLY.test(line)
    // La fila de guiones y la cabecera que lleva encima dan forma a la tabla: no son reglas.
    else if (guarded && ruleKey(line) !== null && !isSeparator(line) && !isSeparator(lines[i + 1] ?? '')) rules.push(line)
  })
  return rules
}
const rulesBefore = rulesOf(git(['show', `${mergeBase}:CONSTRAINTS.md`]) ?? '')
const rulesNow = rulesOf(existsSync('CONSTRAINTS.md') ? readFileSync('CONSTRAINTS.md', 'utf8') : '')

// Cada número lleva un sentido que se lee de lo que tiene alrededor: un mínimo (≥, "mínimo", "no puede
// bajar") se rebaja bajándolo, y un máximo (≤, "máximo", "hasta el", "no puede subir"), subiéndolo. Si el
// sentido no se puede leer, se avisa de cualquier cambio.
const MIN_BEFORE = /(>=|>|≥|al menos|mínimo|no menos de)\s*$/
const MAX_BEFORE = /(<=|<|≤|como mucho|máximo|no más de|no pasa de|hasta el|antes del)\s*$/
const MIN_AFTER = /^\s*\S*\s*\|?\s*(no puede bajar|no puede caer)/
const MAX_AFTER = /^\s*\S*\s*\|?\s*(no puede subir|no puede crecer)/
const direction = (before, after) => {
  if (MIN_BEFORE.test(before) || MIN_AFTER.test(after)) return 'min'
  if (MAX_BEFORE.test(before) || MAX_AFTER.test(after)) return 'max'
  return null
}
// Dónde están los números de una regla. En una fila de tabla, en su segunda celda (el límite o el valor
// medido); la tercera puede decir el sentido, y el resto es explicación, que cambia sin que cambie el
// listón. En una viñeta, en toda la línea. Una fecha cuenta como un solo número.
const thresholds = (t) => {
  const row = isRow(t) ? cells(t) : null
  const scope = row ? (row[1] ?? '') : t
  const tail = row ? ` | ${row[2] ?? ''}` : ''
  return [...scope.matchAll(/\d{4}-\d{2}-\d{2}|\d+(?:[.,]\d+)?/g)].map((m) => ({
    raw: m[0],
    n: Number(m[0].replaceAll('-', '').replace(',', '.')),
    dir: direction(scope.slice(Math.max(0, m.index - 24), m.index).toLowerCase(), (scope.slice(m.index + m[0].length) + tail).slice(0, 40).toLowerCase())
  }))
}
// Lo primero que empeora entre los números de una regla, emparejados por sentido y por orden.
const weakened = (before, after) => {
  for (const dir of ['min', 'max', null]) {
    const now = after.filter((x) => x.dir === dir)
    for (const [i, was] of before.filter((x) => x.dir === dir).entries()) {
      if (!now[i]) return { verdict: 'umbral quitado', change: was.raw }
      if (now[i].n === was.n) continue
      const worse = dir === null || (dir === 'min' ? now[i].n < was.n : now[i].n > was.n)
      if (worse) return { verdict: dir ? 'umbral rebajado' : 'umbral cambiado', change: `${was.raw} -> ${now[i].raw}` }
    }
  }
  return null
}

// Excepción: | ID | Regla | Ruta | Motivo | Responsable | Caduca |. La regla se escribe con el nombre que
// este archivo da entre corchetes, y la ruta admite * y **.
const date = new Date()
const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const escapeRegex = (s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
const globToRegex = (glob) => new RegExp(`^${glob.split('**').map((part) => part.split('*').map(escapeRegex).join('[^/]*')).join('.*')}$`)
const exceptionOf = (t) => {
  const [id, rule = '', path = '', , , expires = ''] = cells(t).map((cell) => cell.replaceAll('`', ''))
  return { id, rule: rule.toLowerCase(), path, expires, valid: /^\d{4}-\d{2}-\d{2}$/.test(expires) && expires >= today }
}

const STOPS = /\|\s*detiene\s*\|/
for (const line of rulesNow.filter(isException)) {
  const before = rulesBefore.find((x) => ruleKey(x) === ruleKey(line))
  if (!before) { flag('excepción nueva', 'CONSTRAINTS.md', line); continue }
  const was = exceptionOf(before)
  const now = exceptionOf(line)
  if (now.rule !== was.rule || now.path !== was.path || now.expires > was.expires) flag('excepción cambiada', 'CONSTRAINTS.md', `${before}  ->  ${line}`)
}
// Quitar una excepción endurece: no hace ruido.
for (const before of rulesBefore.filter((x) => !isException(x))) {
  const key = ruleKey(before)
  const line = rulesNow.find((x) => ruleKey(x) === key)
  if (!line) { flag('regla quitada', 'CONSTRAINTS.md', before); continue }
  if (line === before) continue
  if (STOPS.test(before) && !STOPS.test(line)) flag('regla rebajada', 'CONSTRAINTS.md', `${key}: deja de detener`)
  const worse = weakened(thresholds(before), thresholds(line))
  if (worse) flag(worse.verdict, 'CONSTRAINTS.md', `${key}: ${worse.change}`)
}

// Solo valen las excepciones que ya estaban en la base, y nunca para lo que toca al propio CONSTRAINTS.md.
const approved = rulesBefore.filter(isException).map(exceptionOf)
const blocking = []
for (const finding of findings) {
  const exception = finding.file === 'CONSTRAINTS.md' ? undefined : approved.find((e) => e.rule === finding.rule && globToRegex(e.path).test(finding.file))
  if (!exception) blocking.push(finding)
  else if (!exception.valid) blocking.push({ ...finding, text: `${finding.text}  (la excepción ${exception.id} ya no vale: caducó el ${exception.expires})` })
  else notices.push({ ...finding, rule: `${finding.rule}, exento por ${exception.id}` })
}

const print = (list, log) => { for (const f of list) log(`  [${f.rule}] ${f.file}: ${f.text}`) }
if (notices.length > 0) {
  console.log(`floor-guard: ${notices.length} cosa(s) para revisar, que no detienen:`)
  print(notices, console.log)
}
if (blocking.length === 0) { console.log('floor-guard: limpio'); process.exit(0) }
console.error(`floor-guard: ${blocking.length} cosa(s) que rebajan el listón:`)
print(blocking, console.error)
console.error('\nArregla el código. Si la rebaja es a propósito, la decide una persona: una excepción en CONSTRAINTS.md, con responsable y fecha de caducidad, vale desde que está subida a main.')
process.exit(1)
