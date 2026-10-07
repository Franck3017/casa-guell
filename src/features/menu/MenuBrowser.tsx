import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { useI18n } from '@/i18n'
import { dishMedia, dishPreview, type DishMedia } from '@/lib/dishMedia'
import { OPEN_DISH, type OpenDishDetail } from '@/lib/events'
import { GROUPS, MACRO_KEYS, isMacroKey, type MacroKey } from './menu-groups'
import { MenuItemRow, type PreviewHandlers } from './MenuItemRow'

/** Tamaño de la foto flotante y separación respecto al cursor y al borde de la ventana. */
const PREVIEW = { width: 224, height: 280, gap: 20, margin: 12 }

/**
 * Teclado de una lista de pestañas (patrón WAI-ARIA): flechas, Inicio y Fin cambian de pestaña y
 * llevan el foco con ella. Solo la pestaña activa está en el orden de tabulación.
 */
function onTabKeys (e: KeyboardEvent<HTMLElement>, current: number, count: number, select: (i: number) => void): void {
  const next = e.key === 'ArrowRight'
    ? (current + 1) % count
    : e.key === 'ArrowLeft'
      ? (current - 1 + count) % count
      : e.key === 'Home' ? 0 : e.key === 'End' ? count - 1 : -1
  if (next < 0) return
  e.preventDefault()
  select(next)
  const tabs = e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]')
  tabs[next]?.focus()
}

/**
 * Foto flotante que acompaña al cursor sobre una referencia con imagen (solo ratón).
 * Se coloca escribiendo `transform` directamente, sin estado, y nunca se sale de la ventana:
 * cerca del borde derecho pasa al otro lado del cursor.
 */
function useDishPreview () {
  const [media, setMedia] = useState<DishMedia | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  const place = (e: PointerEvent): void => {
    const el = ref.current
    if (el == null) return
    const { width, height, gap, margin } = PREVIEW
    const fitsRight = e.clientX + gap + width + margin <= window.innerWidth
    const x = fitsRight ? e.clientX + gap : e.clientX - gap - width
    const y = Math.min(Math.max(e.clientY - height / 2, margin), window.innerHeight - height - margin)
    el.style.transform = `translate(${Math.max(x, margin)}px, ${y}px)`
  }

  // Al desplazar la página el cursor deja de estar sobre la referencia sin que llegue un "leave".
  useEffect(() => {
    if (media == null) return
    const hide = (): void => setMedia(null)
    window.addEventListener('scroll', hide, { passive: true, once: true })
    return () => window.removeEventListener('scroll', hide)
  }, [media])

  const handlers: PreviewHandlers = {
    onEnter: (m, e) => { place(e); setMedia(m) },
    onMove: place,
    onLeave: () => setMedia(null)
  }

  return { media, ref, handlers }
}

/**
 * Navegador de la carta: familias → secciones → referencias.
 * Son dos niveles de pestañas accesibles. Todas las secciones están siempre en el HTML y solo se
 * enseña la activa: así buscadores y asistentes leen la carta entera, no solo la primera pestaña.
 */
export function MenuBrowser () {
  const { t, locale } = useI18n()
  const uid = useId()
  const [macro, setMacro] = useState<MacroKey>('cuina')
  const [setIdx, setSetIdx] = useState(0)
  const { media: previewMedia, ref: previewRef, handlers: previewHandlers } = useDishPreview()

  // El buscador pide abrir la familia y la sección de un plato
  useEffect(() => {
    const onOpen = (e: Event): void => {
      const { macro: nextMacro, setKey } = (e as CustomEvent<OpenDishDetail>).detail
      if (!isMacroKey(nextMacro)) return
      const idx = GROUPS[nextMacro].sets.findIndex(([key]) => key === setKey)
      setMacro(nextMacro)
      // Si la sección no existe, se abre la primera de esa familia (nunca el índice de la familia anterior)
      setSetIdx(Math.max(idx, 0))
    }
    window.addEventListener(OPEN_DISH, onOpen)
    return () => window.removeEventListener(OPEN_DISH, onOpen)
  }, [])

  const selectMacro = (key: MacroKey): void => { setMacro(key); setSetIdx(0) }
  const plural = new Intl.PluralRules(locale)
  const macroTabId = (key: MacroKey): string => `${uid}-family-${key}`
  const macroPanelId = (key: MacroKey): string => `${uid}-family-panel-${key}`
  const setTabId = (key: string): string => `${uid}-set-${key}`
  const setPanelId = (key: string): string => `${uid}-set-panel-${key}`

  return (
    <div>
      {/* Familias */}
      <div
        role='tablist'
        aria-label={t.carta.title}
        onKeyDown={(e) => onTabKeys(e, MACRO_KEYS.indexOf(macro), MACRO_KEYS.length, (i) => selectMacro(MACRO_KEYS[i]))}
        className='flex flex-wrap gap-x-7 border-b border-ink/15'
      >
        {MACRO_KEYS.map((key) => {
          const selected = macro === key
          return (
            <button
              key={key}
              type='button'
              role='tab'
              id={macroTabId(key)}
              aria-selected={selected}
              aria-controls={macroPanelId(key)}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectMacro(key)}
              className={`press -mb-px inline-flex min-h-11 items-center border-b-2 font-mono2 text-[11px] uppercase tracking-[0.2em] transition-colors motion-reduce:transition-none ${
                selected ? 'border-ink text-ink' : 'border-transparent text-ink/65 hover:text-ink'
              }`}
            >
              {t.carta.tabs[key]}
            </button>
          )
        })}
      </div>

      {MACRO_KEYS.map((key) => {
        const { sets } = GROUPS[key]
        const activeMacro = macro === key
        const activeIdx = activeMacro ? Math.min(setIdx, sets.length - 1) : 0

        return (
          <div key={key} role='tabpanel' id={macroPanelId(key)} aria-labelledby={macroTabId(key)} hidden={!activeMacro}>
            {/* Secciones de la familia */}
            <div
              role='tablist'
              aria-label={t.carta.tabs[key]}
              onKeyDown={(e) => onTabKeys(e, activeIdx, sets.length, setSetIdx)}
              className='flex flex-wrap gap-x-1 pt-2'
            >
              {sets.map(([setKey], i) => {
                const selected = activeIdx === i
                return (
                  <button
                    key={setKey}
                    type='button'
                    role='tab'
                    id={setTabId(setKey)}
                    aria-selected={selected}
                    aria-controls={setPanelId(setKey)}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setSetIdx(i)}
                    className='press group inline-flex min-h-11 items-center'
                  >
                    <span className={`inline-flex h-8 items-center rounded-full px-3 text-xs transition-colors motion-reduce:transition-none ${
                      selected ? 'bg-ink text-cream' : 'text-ink/70 group-hover:bg-ink/5 group-hover:text-ink'
                    }`}
                    >
                      {t.carta.sets[setKey]}
                    </span>
                  </button>
                )
              })}
            </div>

            {sets.map(([setKey, items], i) => {
              const reserveThumb = items.some((item) => dishMedia(item.nombre) != null)
              const refsLabel = plural.select(items.length) === 'one' ? t.carta.refsOne : t.carta.refs

              return (
                <div key={setKey} role='tabpanel' id={setPanelId(setKey)} aria-labelledby={setTabId(setKey)} hidden={activeIdx !== i}>
                  {items.length === 0
                    ? <p role='status' className='mt-8 max-w-prose text-base text-ink/70'>{t.carta.empty}</p>
                    : (
                      <>
                        {/* Dos columnas que se leen de arriba abajo, como una carta impresa */}
                        <ul className='mt-6 gap-x-14 md:columns-2'>
                          {items.map((item, n) => (
                            <MenuItemRow key={`${item.nombre}-${n}`} item={item} reserveThumb={reserveThumb} preview={previewHandlers} />
                          ))}
                        </ul>
                        <p className='mt-6 font-mono2 text-[11px] uppercase tracking-widest text-ink/60'>
                          {t.carta.section}: {t.carta.sets[setKey]} · {items.length} {refsLabel}
                        </p>
                      </>
                      )}
                </div>
              )
            })}
          </div>
        )
      })}

      {/* Foto flotante que sigue al cursor (solo con ratón, en escritorio) */}
      <div
        ref={previewRef}
        aria-hidden='true'
        hidden={previewMedia == null}
        className='pointer-events-none fixed left-0 top-0 z-50 max-md:hidden'
      >
        {previewMedia != null && (
          <img
            src={dishPreview(previewMedia.src)}
            alt=''
            width={PREVIEW.width}
            height={PREVIEW.height}
            className='h-70 w-56 rounded-sm border border-ink/10 bg-linen object-cover shadow-[0_16px_40px_rgb(17_18_21/0.25)]'
          />
        )}
      </div>
    </div>
  )
}
