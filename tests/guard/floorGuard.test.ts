import { execFile, execFileSync } from 'node:child_process'
import { appendFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

// Cada caso copia un repositorio de prueba, le hace un cambio y lanza scripts/floor-guard.mjs contra él.
// Son procesos de verdad (git y node), así que van en paralelo y con más margen de tiempo que una prueba normal.
vi.setConfig({ testTimeout: 60_000 })

const GUARD = path.resolve('scripts/floor-guard.mjs')
const run = promisify(execFile)

const CONSTRAINTS = `# Límites

## Suelo

- Sin supresiones nuevas: \`@ts-ignore\`
- Sin secretos en el código

## Con números

| Regla | Límite | Lo comprueba | Cuándo | Si falla | Por qué |
|-------|--------|--------------|--------|----------|---------|
| Lint | 0 errores | \`pnpm run lint\` | cada edición | detiene | Rompe la web |
| Peso del JavaScript | ≤ 166 kB con gzip | \`pnpm test:build\` | fin de tarea | detiene | Lo que pesa hoy (155,2) más un 7 % |
| Nota de Lighthouse | ≥ 81 | \`node scripts/check-runtime.mjs\` | antes de subir | avisa | La de hoy (84) menos 3 puntos |

- Revisión de los avisos: hasta el 2026-10-27

## Medido hoy

| Métrica | Hoy | Sentido |
|---------|-----|---------|
| Nota medida | 84 | no puede bajar |
| LCP medido | 3685 ms | no puede subir |

## Excepciones

| ID | Regla | Ruta | Motivo | Responsable | Caduca |
|----|-------|------|--------|-------------|--------|
`

const FILES: Record<string, string> = {
  'CONSTRAINTS.md': CONSTRAINTS,
  'package.json': '{\n  "scripts": {\n    "lint": "oxlint src",\n    "check:fast": "pnpm run lint && node scripts/floor-guard.mjs"\n  }\n}\n',
  'scripts/check-runtime.mjs': "const ROUTES = ['/ca', '/es']\nconsole.log(ROUTES)\n",
  'scripts/check-navigation.mjs': "export const STEPS = ['portada', 'legal']\n",
  'src/a.ts': 'export const a = 1\n',
  'src/hooks/theme.ts': 'export const theme = 1\n',
  'tests/a.test.ts': "import { expect, it } from 'vitest'\n\nit('suma', () => {\n  const total = 1 + 1\n  expect(total).toBe(2)\n})\n"
}

const SUPPRESSION = '// @ts-ignore\nexport const b: number = "dos"\n'
const NEXT_YEAR = `${new Date().getFullYear() + 1}-12-31`

interface Repo {
  write: (file: string, text: string) => void
  append: (file: string, text: string) => void
  edit: (file: string, from: string | RegExp, to: string | ((...groups: string[]) => string)) => void
  remove: (file: string) => void
  git: (...args: string[]) => void
}
type Change = (repo: Repo) => void
interface Verdict { status: number, blocks: string[], notes: string[] }

function repoAt (dir: string): Repo {
  const at = (file: string): string => path.join(dir, file)
  return {
    write: (file, text) => { mkdirSync(path.dirname(at(file)), { recursive: true }); writeFileSync(at(file), text) },
    append: (file, text) => appendFileSync(at(file), text),
    edit: (file, from, to) => {
      const before = readFileSync(at(file), 'utf8')
      const after = before.replace(from, to as string)
      if (after === before) throw new Error(`El caso no cambia nada: no encuentro ${String(from)} en ${file}`)
      writeFileSync(at(file), after)
    },
    remove: (file) => unlinkSync(at(file)),
    git: (...args) => { execFileSync('git', args, { cwd: dir, stdio: 'ignore' }) }
  }
}

let root = ''
let template = ''

beforeAll(() => {
  root = mkdtempSync(path.join(tmpdir(), 'cg-floor-guard-'))
  template = path.join(root, 'plantilla')
  mkdirSync(template)
  const repo = repoAt(template)
  repo.git('init', '-q')
  repo.git('config', 'user.email', 'prueba@example.com')
  repo.git('config', 'user.name', 'prueba')
  repo.git('config', 'core.autocrlf', 'false')
  for (const [file, text] of Object.entries(FILES)) repo.write(file, text)
  repo.git('add', '.')
  repo.git('commit', '-q', '-m', 'inicio')
})

afterAll(() => {
  rmSync(root, { recursive: true, force: true })
})

/** Reglas que el vigilante nombra entre corchetes, una por línea. */
const rulesIn = (output: string): string[] => [...output.matchAll(/^ {2}\[(.+?)\]/gm)].map((match) => match[1])

/** Aplica el cambio a una copia del repositorio de prueba y devuelve lo que dice el vigilante. */
async function guard (change: Change, base = 'HEAD'): Promise<Verdict> {
  const dir = mkdtempSync(path.join(root, 'caso-'))
  cpSync(template, dir, { recursive: true })
  change(repoAt(dir))
  const output = await run(process.execPath, [GUARD, '--base', base], { cwd: dir }).then(
    ({ stdout, stderr }) => ({ status: 0, stdout, stderr }),
    (error: { code: number, stdout: string, stderr: string }) => ({ status: error.code, stdout: error.stdout, stderr: error.stderr })
  )
  return { status: output.status, blocks: rulesIn(output.stderr), notes: rulesIn(output.stdout) }
}

/** Deja en la base una excepción ya aprobada para las supresiones de src/hooks/. */
const withApprovedException = (expires: string, then: Change): Change => (repo) => {
  repo.append('CONSTRAINTS.md', `| W1 | comprobador silenciado | src/hooks/** | regla que aquí no aplica | Franck3017 | ${expires} |\n`)
  repo.git('commit', '-q', '-am', 'excepción W1')
  then(repo)
}

/** Sustituye el CONSTRAINTS.md de prueba por el del proyecto, ya en la base. */
const withRealConstraints = (then: Change): Change => (repo) => {
  repo.write('CONSTRAINTS.md', readFileSync('CONSTRAINTS.md', 'utf8'))
  repo.git('commit', '-q', '-am', 'el archivo real')
  then(repo)
}

describe('detiene el trabajo', () => {
  const cases: Array<[name: string, rule: string, change: Change]> = [
    ['una supresión nueva', 'comprobador silenciado', (repo) => repo.append('src/a.ts', SUPPRESSION)],
    ['una supresión en un archivo nuevo', 'comprobador silenciado', (repo) => repo.write('src/b.ts', SUPPRESSION)],
    ['una supresión en un archivo nuevo con eñe en el nombre', 'comprobador silenciado', (repo) => repo.write('src/pestaña.ts', SUPPRESSION)],
    ['un comentario TODO', 'trabajo a medias', (repo) => repo.write('src/b.ts', 'export const b = 2 // TODO terminar\n')],
    ['un catch vacío', 'trabajo a medias', (repo) => repo.append('src/a.ts', "try { JSON.parse('') } catch {}\n")],
    ['una prueba saltada con it.skip', 'prueba saltada', (repo) => repo.edit('tests/a.test.ts', "it('suma'", "it.skip('suma'")],
    ['una prueba saltada con it.skipIf', 'prueba saltada', (repo) => repo.edit('tests/a.test.ts', "it('suma'", "it.skipIf(true)('suma'")],
    ['un archivo de pruebas borrado', 'prueba borrada', (repo) => repo.remove('tests/a.test.ts')],
    ['un archivo de pruebas renombrado para que deje de ejecutarse', 'prueba borrada', (repo) => repo.git('mv', 'tests/a.test.ts', 'tests/a.ts.txt')],
    ['una aserción quitada', 'aserción quitada', (repo) => repo.edit('tests/a.test.ts', '  expect(total).toBe(2)\n', '')],
    ['un máximo subido', 'umbral rebajado', (repo) => repo.edit('CONSTRAINTS.md', '≤ 166 kB', '≤ 180 kB')],
    ['un mínimo bajado', 'umbral rebajado', (repo) => repo.edit('CONSTRAINTS.md', '| ≥ 81 |', '| ≥ 70 |')],
    ['un valor medido que no puede subir, subido', 'umbral rebajado', (repo) => repo.edit('CONSTRAINTS.md', '| 3685 ms |', '| 4200 ms |')],
    ['un valor medido que no puede bajar, bajado', 'umbral rebajado', (repo) => repo.edit('CONSTRAINTS.md', '| Nota medida | 84 |', '| Nota medida | 60 |')],
    ['un límite sin sentido escrito, cambiado', 'umbral cambiado', (repo) => repo.edit('CONSTRAINTS.md', '| 0 errores |', '| 3 errores |')],
    ['la fecha de revisión retrasada', 'umbral rebajado', (repo) => repo.edit('CONSTRAINTS.md', 'hasta el 2026-10-27', 'hasta el 2027-10-27')],
    ['una regla que pasa de detener a avisar', 'regla rebajada', (repo) => repo.edit('CONSTRAINTS.md', '| cada edición | detiene |', '| cada edición | avisa |')],
    ['una fila de la tabla quitada', 'regla quitada', (repo) => repo.edit('CONSTRAINTS.md', /\| Lint \|.*\n/, '')],
    ['una viñeta del suelo quitada', 'regla quitada', (repo) => repo.edit('CONSTRAINTS.md', '- Sin secretos en el código\n', '')],
    ['una excepción nueva', 'excepción nueva', (repo) => repo.append('CONSTRAINTS.md', `| W1 | comprobador silenciado | src/a.ts | prisa | alguien | ${NEXT_YEAR} |\n`)],
    ['un script de comprobación que pierde un paso', 'comprobación quitada', (repo) => repo.edit('package.json', ' && node scripts/floor-guard.mjs', '')],
    ['un script de comprobación que desaparece', 'comprobación quitada', (repo) => repo.edit('package.json', '    "lint": "oxlint src",\n', '')],
    ['una supresión que cubría una excepción ya caducada', 'comprobador silenciado', withApprovedException('2020-01-01', (repo) => repo.append('src/hooks/theme.ts', SUPPRESSION))],
    ['una excepción aprobada a la que se le alarga la fecha', 'excepción cambiada', withApprovedException(NEXT_YEAR, (repo) => repo.edit('CONSTRAINTS.md', NEXT_YEAR, '2099-12-31'))],
    ['el primer máximo del CONSTRAINTS.md del proyecto, subido', 'umbral rebajado', withRealConstraints((repo) => repo.edit('CONSTRAINTS.md', /≤ (\d+)/, (_, n) => `≤ ${Number(n) + 1000}`))],
    ['la fecha de revisión del CONSTRAINTS.md del proyecto, retrasada', 'umbral rebajado', withRealConstraints((repo) => repo.edit('CONSTRAINTS.md', /hasta el (\d{4})/, (_, year) => `hasta el ${Number(year) + 1}`))]
  ]

  for (const [name, rule, change] of cases) {
    it.concurrent(name, async () => {
      expect(await guard(change)).toMatchObject({ status: 1, blocks: [rule] })
    })
  }
})

describe('pasa en silencio', () => {
  const cases: Array<[name: string, change: Change]> = [
    ['un repositorio sin cambios', () => {}],
    ['código nuevo sin atajos', (repo) => repo.write('src/b.ts', 'export const b = 2\n')],
    ['un máximo apretado', (repo) => repo.edit('CONSTRAINTS.md', '≤ 166 kB', '≤ 150 kB')],
    ['un mínimo subido', (repo) => repo.edit('CONSTRAINTS.md', '| ≥ 81 |', '| ≥ 90 |')],
    ['un valor medido que mejora', (repo) => repo.edit('CONSTRAINTS.md', '| 3685 ms |', '| 3000 ms |')],
    ['un límite apretado junto con el número de su motivo', (repo) => repo.edit('CONSTRAINTS.md', '≤ 166 kB con gzip | `pnpm test:build` | fin de tarea | detiene | Lo que pesa hoy (155,2)', '≤ 150 kB con gzip | `pnpm test:build` | fin de tarea | detiene | Lo que pesa hoy (140,2)')],
    ['la fecha de revisión adelantada', (repo) => repo.edit('CONSTRAINTS.md', 'hasta el 2026-10-27', 'hasta el 2026-10-20')],
    ['una regla que pasa de avisar a detener', (repo) => repo.edit('CONSTRAINTS.md', '| antes de subir | avisa |', '| antes de subir | detiene |')],
    ['una aserción añadida', (repo) => repo.edit('tests/a.test.ts', '  expect(total).toBe(2)\n', '  expect(total).toBe(2)\n  expect(total).toBeGreaterThan(1)\n')],
    ['un archivo de pruebas renombrado que sigue siendo una prueba', (repo) => repo.git('mv', 'tests/a.test.ts', 'tests/suma.test.ts')],
    ['un plato cuyo nombre lleva la palabra TODO', (repo) => repo.write('src/data/carta.json', '{ "nombre": "MENÚ TODO INCLUIDO" }\n')],
    ['una excepción aprobada que se retira', withApprovedException(NEXT_YEAR, (repo) => repo.edit('CONSTRAINTS.md', /\| W1 \|.*\n/, ''))]
  ]

  for (const [name, change] of cases) {
    it.concurrent(name, async () => {
      expect(await guard(change)).toEqual({ status: 0, blocks: [], notes: [] })
    })
  }
})

describe('lo deja anotado para revisar, sin detener', () => {
  const cases: Array<[name: string, note: string, change: Change]> = [
    ['una aserción reescrita', 'aserción reescrita', (repo) => { repo.edit('tests/a.test.ts', 'const total', 'const sum'); repo.edit('tests/a.test.ts', 'expect(total)', 'expect(sum)') }],
    ['un cambio en un script de comprobación', 'comprobación cambiada', (repo) => repo.edit('scripts/check-runtime.mjs', ", '/es'", '')],
    ['un cambio en la comprobación de navegación', 'comprobación cambiada', (repo) => repo.edit('scripts/check-navigation.mjs', ", 'legal'", '')],
    ['un paso distinto en un script de package.json', 'comprobación cambiada', (repo) => repo.edit('package.json', 'oxlint src', 'oxlint src tests')],
    ['una supresión en una ruta con excepción aprobada y vigente', 'comprobador silenciado, exento por W1', withApprovedException(NEXT_YEAR, (repo) => repo.append('src/hooks/theme.ts', SUPPRESSION))]
  ]

  for (const [name, note, change] of cases) {
    it.concurrent(name, async () => {
      expect(await guard(change)).toEqual({ status: 0, blocks: [], notes: [note] })
    })
  }
})

describe('no da por limpio lo que no ha podido comprobar', () => {
  it('sale con 2 cuando no existe la referencia con la que comparar', async () => {
    expect((await guard(() => {}, 'no-existe')).status).toBe(2)
  })
})
