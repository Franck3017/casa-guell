import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { ca } from './locales/ca'
import { es } from './locales/es'
import { en } from './locales/en'
import type { Messages } from './types'

export type Locale = 'ca' | 'es' | 'en'
export const LOCALES: Locale[] = ['ca', 'es', 'en']
export const DEFAULT_LOCALE: Locale = 'ca'
const STORAGE_KEY = 'cg-locale'
const DICTS: Record<Locale, Messages> = { ca, es, en }

export function detectLocale (): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
  if (stored && LOCALES.includes(stored)) return stored
  const nav = navigator.language.toLowerCase()
  if (nav.startsWith('es')) return 'es'
  if (nav.startsWith('en')) return 'en'
  return DEFAULT_LOCALE
}

interface I18nCtx { locale: Locale, t: Messages, setLocale: (l: Locale) => void }
const Ctx = createContext<I18nCtx | null>(null)

export function I18nProvider ({ locale, children }: { locale: Locale, children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(STORAGE_KEY, next)
    // La misma elección en una cookie: el servidor (vercel.json) la lee para redirigir "/" al idioma elegido.
    document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`
    // Conserva sub-rutas futuras + hash + query al cambiar de idioma
    const rest = location.pathname.replace(new RegExp(`^/${locale}(?=/|$)`), '')
    navigate({ pathname: `/${next}${rest}`, search: location.search, hash: location.hash })
  }, [locale, location.pathname, location.search, location.hash, navigate])

  const value = useMemo(() => ({ locale, t: DICTS[locale], setLocale }), [locale, setLocale])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n (): I18nCtx {
  const ctx = useContext(Ctx)
  if (ctx == null) throw new Error('useI18n debe usarse dentro de <I18nProvider>')
  return ctx
}
