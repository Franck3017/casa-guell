import type { ReactNode } from 'react'
import { useI18n } from '@/i18n'
import type { DishIndex } from '@/lib/dishSearch'
import { displayName, formatPrice } from '@/lib/menuFormat'
import { DishThumb } from './DishThumb'
import { Highlight } from './Highlight'

interface SearchResultsProps {
  hits: DishIndex[]
  tokens: string[]
  /** Índice del resultado marcado (teclado o ratón). */
  active: number
  listId: string
  optionId: (i: number) => string
  onActivate: (i: number) => void
  onPick: (dish: DishIndex) => void
}

/**
 * Panel de resultados del buscador. Va en absoluto bajo el campo, así que no afecta al flujo de la
 * cabecera. `onMouseDown` evita que el campo pierda el foco al pulsar un resultado.
 */
export function SearchResults ({ hits, tokens, active, listId, optionId, onActivate, onPick }: SearchResultsProps) {
  const { t, locale } = useI18n()

  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      className='absolute right-0 top-full z-50 mt-2 overflow-hidden max-lg:fixed max-lg:inset-x-4 max-lg:top-[calc(env(safe-area-inset-top)+3.5rem)] max-lg:mt-1 sm:max-lg:inset-x-6 lg:w-96 rounded-lg border border-ink/10 bg-surface shadow-[0_12px_30px_rgb(17_18_21/0.10)]'
    >
      {hits.length === 0
        ? (
          <p role='status' className='px-4 py-6 text-center text-sm text-ink/50'>
            {t.search.noResults}
          </p>
          )
        : (
          <>
            <ul
              id={listId}
              role='listbox'
              aria-label={t.search.label}
              className='max-h-[min(28rem,65vh)] overflow-y-auto overscroll-contain p-1.5'
            >
              {hits.map((d, i) => (
                <li
                  key={`${d.setKey}-${d.nombre}`}
                  id={optionId(i)}
                  role='option'
                  aria-selected={i === active}
                  onMouseMove={() => { if (active !== i) onActivate(i) }}
                  onClick={() => onPick(d)}
                  className={`flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors ${
                    i === active ? 'bg-ink/5' : ''
                  }`}
                >
                  <DishThumb media={d.media} name={d.nombre} />
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium text-ink/80'>
                      <Highlight text={displayName(d.nombre)} tokens={tokens} />
                    </p>
                    <p className='mt-0.5 truncate text-xs text-ink/70'>
                      <span className='font-mono2 text-[11px] uppercase tracking-widest text-ink/60'>
                        {d.category}
                      </span>
                      {d.desc && (
                        <>
                          {' · '}
                          <Highlight text={d.desc} tokens={tokens} />
                        </>
                      )}
                    </p>
                  </div>
                  {d.precio && (
                    <span className='shrink-0 font-mono2 text-sm text-ink/70'>{formatPrice(d.precio, locale)}</span>
                  )}
                </li>
              ))}
            </ul>
            {/* Pista de teclado solo en escritorio; solo símbolos → no necesita traducción */}
            <div className='hidden items-center gap-3 border-t border-ink/5 px-3 py-2 md:flex'>
              <Kbd>↑↓</Kbd>
              <Kbd>↵</Kbd>
              <Kbd>esc</Kbd>
            </div>
          </>
          )}
    </div>
  )
}

function Kbd ({ children }: { children: ReactNode }) {
  return (
    <kbd className='rounded border border-ink/15 px-1 font-mono2 text-[11px] leading-4 text-ink/60'>
      {children}
    </kbd>
  )
}
