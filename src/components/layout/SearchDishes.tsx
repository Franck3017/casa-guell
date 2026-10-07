import { lazy, Suspense, useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useSearchFocus } from '@/hooks/useSearchFocus'
import { useI18n } from '@/i18n'
import type { DishIndex } from '@/lib/dishSearch'
import { openDish } from '@/lib/events'

// El motor de búsqueda (índice de platos y fotos) y el panel de resultados no hacen falta hasta que alguien
// usa el buscador: se piden al enfocarlo por primera vez y quedan fuera del archivo principal.
type SearchEngine = typeof import('@/lib/dishSearch')
const SearchResults = lazy(async () => await import('./search/SearchResults').then((m) => ({ default: m.SearchResults })))
const NO_RESULTS: { hits: DishIndex[], tokens: string[] } = { hits: [], tokens: [] }

/**
 * Buscador de platos de la cabecera. En reposo es un icono de 44 px que no empuja a sus vecinos; al
 * enfocarlo (clic, Tab, "/", Ctrl+K) se expande en absoluto por encima de la barra y lista resultados.
 * Aquí viven el estado (texto, foco, resultado marcado) y el campo; el índice y la consulta están en
 * lib/dishSearch (carga diferida), los atajos en useSearchFocus y el panel en ./search (carga diferida).
 */
export function SearchDishes () {
  const { t } = useI18n()
  const uid = useId()
  const listId = `${uid}-list`
  const optionId = (i: number): string => `${uid}-opt-${i}`

  const [focused, setFocused] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const [engine, setEngine] = useState<SearchEngine | null>(null)
  const requested = useRef(false)
  const loadEngine = (): void => {
    if (requested.current) return
    requested.current = true
    void import('@/lib/dishSearch').then(setEngine)
  }

  const index = useMemo(() => engine?.buildDishIndex(t.carta.sets) ?? [], [engine, t])
  // Hasta que llega el motor no hay resultados que enseñar; lo escrito se busca en cuanto está.
  const { hits, tokens } = useMemo(() => engine?.searchDishes(index, query) ?? NO_RESULTS, [engine, index, query])

  const open = focused || query !== ''
  const showPanel = focused && tokens.length > 0
  const hasHits = showPanel && hits.length > 0

  const blur = useCallback(() => setFocused(false), [])
  useSearchFocus(inputRef, wrapRef, blur)

  // Cada búsqueda nueva empieza en el primer resultado
  useEffect(() => setActive(0), [query])

  // La opción activa (teclado) siempre visible dentro del panel con scroll
  useEffect(() => {
    if (hasHits) document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, hasHits])

  const pick = (dish: DishIndex): void => {
    openDish(dish.macro, dish.setKey)
    setQuery('')
    setFocused(false)
    inputRef.current?.blur()
    document.getElementById('carta')?.scrollIntoView()
  }

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'ArrowDown' && hits.length > 0) {
      e.preventDefault()
      setActive((i) => (i + 1) % hits.length)
    } else if (e.key === 'ArrowUp' && hits.length > 0) {
      e.preventDefault()
      setActive((i) => (i - 1 + hits.length) % hits.length)
    } else if (e.key === 'Enter' && hasHits) {
      e.preventDefault()
      pick(hits[active])
    } else if (e.key === 'Escape') {
      // 1.º Escape borra el texto; el 2.º cierra el buscador
      if (query) setQuery('')
      else inputRef.current?.blur()
    }
  }

  return (
    <div
      ref={wrapRef}
      className='relative size-11 shrink-0'
      onBlur={(e) => {
        // Tab hacia fuera del buscador → cierra
        if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
    >
      <div
        onClick={() => inputRef.current?.focus()}
        title={t.search.hint}
        className={`absolute right-0 top-0 z-10 flex h-11 items-center overflow-hidden rounded-full border transition-[width,background-color,border-color] duration-200 ease-(--ease-out) motion-reduce:transition-none ${
          open
            ? 'w-[min(20rem,calc(100vw-2rem))] gap-2 border-brand bg-surface pl-[13px] pr-2'
            : 'w-11 cursor-pointer border-ink/15 bg-transparent pl-[13px] hover:border-ink/40'
        }`}
      >
        <svg
          viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'
          className='h-4 w-4 shrink-0 text-ink/60' aria-hidden='true'
        >
          <circle cx='11' cy='11' r='7' /><path d='m20 20-3.5-3.5' />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { setFocused(true); loadEngine() }}
          onKeyDown={onInputKeyDown}
          placeholder={t.search.placeholder}
          aria-label={t.search.label}
          role='combobox'
          aria-expanded={hasHits}
          aria-controls={hasHits ? listId : undefined}
          aria-activedescendant={hasHits ? optionId(active) : undefined}
          aria-autocomplete='list'
          autoComplete='off'
          spellCheck={false}
          enterKeyHint='search'
          // 16 px en móvil evita el zoom automático de iOS al enfocar
          className={`min-w-0 bg-transparent font-mono2 text-base text-ink outline-none placeholder:text-ink/55 md:text-xs ${open ? 'flex-1' : 'w-0 opacity-0'}`}
        />
        {query !== '' && (
          <button
            type='button'
            aria-label={t.search.clear}
            onClick={() => { setQuery(''); inputRef.current?.focus() }}
            className='press flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink'
          >
            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' className='h-3 w-3' aria-hidden='true'>
              <path d='M6 6l12 12M18 6 6 18' />
            </svg>
          </button>
        )}
      </div>

      {showPanel && (
        <Suspense fallback={null}>
        <SearchResults
          hits={hits}
          tokens={tokens}
          active={active}
          listId={listId}
          optionId={optionId}
          onActivate={setActive}
          onPick={pick}
        />
        </Suspense>
      )}
    </div>
  )
}
