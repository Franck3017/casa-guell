import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useI18n, type Locale } from '@/i18n'

/** Los idiomas se nombran en su propia lengua: quien lo busca debe reconocerlo aunque la página esté en otro. */
const OPTIONS: Array<{ value: Locale, code: string, name: string }> = [
  { value: 'ca', code: 'CA', name: 'Català' },
  { value: 'es', code: 'ES', name: 'Español' },
  { value: 'en', code: 'EN', name: 'English' }
]

/**
 * Cambiar de idioma es ocasional: en reposo solo se ve el idioma actual (un botón) y las opciones
 * se abren bajo demanda. Escape o un clic fuera lo cierran, y el foco vuelve al botón.
 * Con `inline` (menú móvil) no hay desplegable: los tres idiomas van a la vista, uno junto a otro. Allí hay
 * sitio de sobra y un desplegable anclado a la derecha del botón se saldría de la pantalla.
 */
export function LanguageSwitcher ({ inline = false }: { inline?: boolean }) {
  const { locale, setLocale, t } = useI18n()
  const [open, setOpen] = useState(false)
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (rootRef.current != null && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus() }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Flechas: moverse entre idiomas sin salir de la lista (ArrowDown desde el botón entra en ella)
  const onListKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const items = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])
    const at = items.indexOf(document.activeElement as HTMLButtonElement)
    const next = (at + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
    items[next]?.focus()
  }

  const onTriggerKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowDown') return
    e.preventDefault()
    setOpen(true)
    // la lista aún no existe en este instante: se enfoca la opción actual en cuanto se pinta
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus())
  }

  const current = OPTIONS.find((o) => o.value === locale) ?? OPTIONS[1]

  if (inline) {
    return (
      <div role='radiogroup' aria-label={t.lang.label} className='flex flex-wrap items-center gap-1'>
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type='button'
            role='radio'
            aria-checked={locale === o.value}
            onClick={() => setLocale(o.value)}
            className={`press inline-flex min-h-11 items-center rounded-full px-3.5 text-sm transition-colors ${
              locale === o.value ? 'bg-ink text-cream' : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
            }`}
          >
            {o.name}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      className='relative'
      onBlur={(e) => {
        // Tab hacia fuera de la lista la cierra (un clic fuera ya la cerraba)
        if (open && !rootRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      <button
        ref={triggerRef}
        type='button'
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onKeyDown={onTriggerKey}
        aria-label={`${t.lang.label}: ${current.name}`}
        onClick={() => setOpen((v) => !v)}
        className='press inline-flex h-11 items-center gap-1 rounded-full px-2 font-mono2 text-[11px] uppercase tracking-[0.1em] text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink sm:text-xs'
      >
        {current.code}
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' className={`h-3 w-3 transition-transform duration-200 ease-(--ease-out) motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} aria-hidden='true'>
          <path d='m6 9 6 6 6-6' />
        </svg>
      </button>

      {open && (
        <div
          id={listId}
          ref={listRef}
          role='radiogroup'
          aria-label={t.lang.label}
          onKeyDown={onListKey}
          className='elev absolute right-0 top-full z-50 mt-2 min-w-36 border border-ink/10 bg-surface p-1'
        >
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              type='button'
              role='radio'
              aria-checked={locale === o.value}
              onClick={() => { setLocale(o.value); setOpen(false) }}
              className={`flex min-h-11 w-full items-center justify-between gap-4 px-3 text-left text-sm transition-colors ${
                locale === o.value ? 'bg-ink/6 text-ink' : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
              }`}
            >
              <span>{o.name}</span>
              <span className='font-mono2 text-[11px] uppercase tracking-[0.1em] text-ink/60'>{o.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
