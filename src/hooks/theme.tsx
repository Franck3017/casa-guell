import {
  createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState,
  type MouseEvent as ReactMouseEvent, type ReactNode
} from 'react'

export type ThemeChoice = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'
/** Punto de origen del wipe: un click o el elemento que lo dispara (teclado incluido) */
export type OriginSource = ReactMouseEvent | HTMLElement

interface ThemeCtx {
  choice: ThemeChoice
  resolved: ResolvedTheme
  setChoice: (c: ThemeChoice, from?: OriginSource) => void
  cycle: (from?: OriginSource) => void
}

const Ctx = createContext<ThemeCtx | null>(null)
const STORAGE_KEY = 'cg-theme'

/* ---- Storage seguro: puede lanzar en modo privado o con cookies bloqueadas ---- */
function readStored (): ThemeChoice {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s === 'light' || s === 'dark' ? s : 'system'
  } catch { return 'system' }
}

function writeStored (c: ThemeChoice) {
  try {
    if (c === 'system') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, c)
  } catch { /* sin persistencia: el tema sigue aplicándose en esta sesión */ }
}

/* ---- View Transitions (wipe circular desde el control) ---- */
interface ViewTransitionLike { ready: Promise<void>, finished: Promise<void> }
type StartVT = (cb: () => void) => ViewTransitionLike

function applyResolved (r: ResolvedTheme) {
  document.documentElement.classList.toggle('dark', r === 'dark')
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', r === 'dark' ? '#0B0B0C' : '#FAF8F5')
}

function systemDark (): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** El tema que se ve con una elección dada: «auto» sigue al sistema. */
function resolveTheme (choice: ThemeChoice, systemIsDark: boolean): ResolvedTheme {
  if (choice !== 'system') return choice
  return systemIsDark ? 'dark' : 'light'
}

/** El click de teclado trae clientX/Y = 0: siempre se parte del centro del elemento */
function originOf (src?: OriginSource): { x: number, y: number } | undefined {
  const el = (src == null) ? null : src instanceof HTMLElement ? src : (src.currentTarget as HTMLElement | null)
  if (el == null) return undefined
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

let vtToken = 0

/** animate=false para cambios no iniciados por el usuario (sistema, otra pestaña): entra tu fundido @property */
function commitWithWipe (next: ResolvedTheme, origin?: { x: number, y: number }, animate = true) {
  const doc = document as Document & { startViewTransition?: StartVT }
  const root = document.documentElement
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const changes = root.classList.contains('dark') !== (next === 'dark')

  if (!changes || !animate || reduce || !doc.startViewTransition) { applyResolved(next); return }

  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? window.innerHeight / 2
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

  const token = ++vtToken
  root.setAttribute('data-vt', '')
  const vt = doc.startViewTransition(() => applyResolved(next))

  vt.ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 520, easing: getComputedStyle(root).getPropertyValue('--ease-wipe').trim() || 'cubic-bezier(0.35, 0, 0.15, 1)', pseudoElement: '::view-transition-new(root)' }
    )
  }).catch(() => { /* transición saltada por un cambio rápido: no es un error */ })

  // data-vt se quita al TERMINAR (no en ready) y solo si sigue siendo la última transición
  vt.finished.catch(() => {}).finally(() => {
    if (token === vtToken) root.removeAttribute('data-vt')
  })
}

export function ThemeProvider ({ children, shortcut = true }: { children: ReactNode, shortcut?: boolean }) {
  /* El HTML prerenderizado no sabe nada de quien visita: sale con el tema en «auto» y claro, y el primer
     render tiene que dar eso mismo para que React pueda adoptarlo. La elección guardada y el tema del
     sistema se leen al montar, antes de pintar; si coinciden con ese punto de partida no se repinta nada. */
  const [choice, setChoiceState] = useState<ThemeChoice>('system')
  const [sysDark, setSysDark] = useState(false)
  const choiceRef = useRef(choice)
  useEffect(() => { choiceRef.current = choice }, [choice])

  const resolved = resolveTheme(choice, sysDark)

  useLayoutEffect(() => {
    const stored = readStored()
    const dark = systemDark()
    choiceRef.current = stored
    // Los dos valores viven fuera de React (almacenamiento y sistema) y no se pueden leer antes de montar
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoiceState(stored)
    setSysDark(dark)
    /* Red de seguridad: al montar, el DOM debe coincidir con la elección guardada
       (evita que un script del <head> desincronizado deje la clase .dark equivocada) */
    applyResolved(resolveTheme(stored, dark))
  }, [])

  const setChoice = useCallback((c: ThemeChoice, from?: OriginSource) => {
    choiceRef.current = c
    setChoiceState(c)
    writeStored(c)
    commitWithWipe(resolveTheme(c, systemDark()), originOf(from))
  }, [])

  const cycle = useCallback((from?: OriginSource) => {
    const order: ThemeChoice[] = ['light', 'system', 'dark'] // mismo orden que el control
    setChoice(order[(order.indexOf(choiceRef.current) + 1) % order.length], from)
  }, [setChoice])

  /* Sistema en vivo: sin wipe, es un cambio que el usuario no provocó */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => {
      setSysDark(e.matches)
      if (choiceRef.current === 'system') commitWithWipe(e.matches ? 'dark' : 'light', undefined, false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  /* Sync entre pestañas: también sin wipe */
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      const v: ThemeChoice = e.newValue === 'light' || e.newValue === 'dark' ? e.newValue : 'system'
      setChoiceState(v)
      choiceRef.current = v
      commitWithWipe(resolveTheme(v, systemDark()), undefined, false)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  /* Atajo T. WCAG 2.1.4: una tecla sola debe poder desactivarse → prop `shortcut` */
  useEffect(() => {
    if (!shortcut) return
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.key.toLowerCase() !== 't' || e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if ((t?.closest?.('input,textarea,select,[contenteditable="true"],[role="textbox"],[role="combobox"]')) != null) return
      cycle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cycle, shortcut])

  const value = useMemo(() => ({ choice, resolved, setChoice, cycle }), [choice, resolved, setChoice, cycle])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useTheme (): ThemeCtx {
  const ctx = useContext(Ctx)
  if (ctx == null) throw new Error('useTheme debe usarse dentro de <ThemeProvider>')
  return ctx
}
