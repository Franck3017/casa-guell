import type { ReactNode } from 'react'
import { useI18n, type Locale } from '@/i18n'

export type AllergenKey =
  | 'gluten' | 'crustaceo' | 'huevo' | 'pescado' | 'lacteo' | 'soja'
  | 'frutos' | 'apio' | 'mostaza' | 'sesamo' | 'sulfitos' | 'molusco' | 'altramuz'

export const ALLERGEN_KEYS: AllergenKey[] = [
  'gluten', 'crustaceo', 'huevo', 'pescado', 'lacteo', 'soja',
  'frutos', 'apio', 'mostaza', 'sesamo', 'sulfitos', 'molusco', 'altramuz',
]

/** Códigos de carta impresa (G, H, L…) y nombres de carta web → clave interna. */
const CODE_MAP: Record<string, AllergenKey> = {
  G: 'gluten', GLUTEN: 'gluten',
  C: 'crustaceo', CRUSTACEO: 'crustaceo',
  H: 'huevo', HUEVO: 'huevo', OU: 'huevo',
  P: 'pescado', PESCADO: 'pescado', PEIX: 'pescado',
  L: 'lacteo', LACTEO: 'lacteo', LACTIS: 'lacteo', LECHE: 'lacteo',
  S: 'soja', SOJA: 'soja',
  F: 'frutos', 'FRUTOS SECOS': 'frutos', 'FRUITS DE CLOSCA': 'frutos', 'TREE NUTS': 'frutos',
  A: 'apio', APIO: 'apio', API: 'apio',
  M: 'mostaza', MOSTAZA: 'mostaza', MOSTASSA: 'mostaza',
  SE: 'sesamo', SESAMO: 'sesamo', SESAM: 'sesamo', SESAME: 'sesamo',
  SU: 'sulfitos', SULFITOS: 'sulfitos', SULFITS: 'sulfitos', SULPHITES: 'sulfitos',
  MO: 'molusco', MOLUSCOS: 'molusco', MOLUSCS: 'molusco', MOLLUSCS: 'molusco',
  AL: 'altramuz', ALTRAMUCES: 'altramuz', TRAMUSSOS: 'altramuz', LUPIN: 'altramuz',
}

export const LABELS: Record<AllergenKey, Record<Locale, string>> = {
  gluten:    { ca: 'Gluten', es: 'Gluten', en: 'Gluten' },
  crustaceo: { ca: 'Crustacis', es: 'Crustáceos', en: 'Crustaceans' },
  huevo:     { ca: 'Ou', es: 'Huevo', en: 'Egg' },
  pescado:   { ca: 'Peix', es: 'Pescado', en: 'Fish' },
  lacteo:    { ca: 'Lactis', es: 'Lácteos', en: 'Dairy' },
  soja:      { ca: 'Soja', es: 'Soja', en: 'Soy' },
  frutos:    { ca: 'Fruits de closca', es: 'Frutos de cáscara', en: 'Tree nuts' },
  apio:      { ca: 'Api', es: 'Apio', en: 'Celery' },
  mostaza:   { ca: 'Mostassa', es: 'Mostaza', en: 'Mustard' },
  sesamo:    { ca: 'Sèsam', es: 'Sésamo', en: 'Sesame' },
  sulfitos:  { ca: 'Sulfits', es: 'Sulfitos', en: 'Sulphites' },
  molusco:   { ca: 'Mol·luscs', es: 'Moluscos', en: 'Molluscs' },
  altramuz:  { ca: 'Tramussos', es: 'Altramuces', en: 'Lupin' },
}

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

export const ICONS: Record<AllergenKey, () => ReactNode> = {
  gluten: () => (
    <Svg>
      <path d="M12 22V9" />
      <path d="M12 13c-3.5 0-5-2.5-5-5 3.5 0 5 2.5 5 5Z" />
      <path d="M12 13c3.5 0 5-2.5 5-5-3.5 0-5 2.5-5 5Z" />
      <path d="M12 9c-3 0-4-2-4-4 3 0 4 2 4 4Z" />
      <path d="M12 9c3 0 4-2 4-4-3 0-4 2-4 4Z" />
    </Svg>
  ),
  crustaceo: () => (
    <Svg>
      <path d="M7 7c0 6 4 10 10 10" />
      <path d="M17 17c2 0 4-1.5 4-3.5" />
      <path d="M7 7c0-2 1.5-4 4-4" />
      <path d="M11 3c1.5 0 2.5 1 3 2" />
      <path d="M7 7h4" />
      <path d="M8 11h4" />
      <path d="M10 14h4" />
    </Svg>
  ),
  huevo: () => (
    <Svg>
      <path d="M12 3c3.5 0 6.5 4.5 6.5 9a6.5 6.5 0 0 1-13 0C5.5 7.5 8.5 3 12 3Z" />
    </Svg>
  ),
  pescado: () => (
    <Svg>
      <path d="M6 12c2.5-3.5 6-5 9-5 2.5 0 4.5 2 5.5 5-1 3-3 5-5.5 5-3 0-6.5-1.5-9-5Z" />
      <path d="M6 12 3 9v6l3-3Z" />
      <circle cx="16" cy="11" r="0.6" />
    </Svg>
  ),
  lacteo: () => (
    <Svg>
      <path d="M10 3h4" />
      <path d="M10 3v3l-2 3v11a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V9l-2-3V3" />
      <path d="M8 13h8" />
    </Svg>
  ),
  soja: () => (
    <Svg>
      <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14Z" />
      <circle cx="10" cy="14" r="1.6" />
      <circle cx="13" cy="11" r="1.6" />
      <circle cx="16" cy="8" r="1.6" />
    </Svg>
  ),
  frutos: () => (
    <Svg>
      <path d="M12 4c4 0 7 3.5 7 8s-3 8-7 8-7-3.5-7-8 3-8 7-8Z" />
      <path d="M12 4v16" />
      <path d="M8.5 9c1.5 1 1.5 3 0 4" />
      <path d="M15.5 9c-1.5 1-1.5 3 0 4" />
    </Svg>
  ),
  apio: () => (
    <Svg>
      <path d="M10 21c0-6 0-10 2-14" />
      <path d="M12 7c0-2 1.5-4 3.5-4 0 2-1.5 4-3.5 4Z" />
      <path d="M12 10c0-2-1.5-4-3.5-4 0 2 1.5 4 3.5 4Z" />
      <path d="M14 21c0-5 0-8 1.5-11" />
    </Svg>
  ),
  mostaza: () => (
    <Svg>
      <path d="M10 3h4v3h-4Z" />
      <path d="M9 6h6l1 3v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9l1-3Z" />
      <path d="M8 13h8" />
    </Svg>
  ),
  sesamo: () => (
    <Svg>
      <ellipse cx="8" cy="8" rx="1.8" ry="2.6" transform="rotate(-20 8 8)" />
      <ellipse cx="15" cy="10" rx="1.8" ry="2.6" transform="rotate(15 15 10)" />
      <ellipse cx="10" cy="15" rx="1.8" ry="2.6" transform="rotate(-10 10 15)" />
    </Svg>
  ),
  sulfitos: () => (
    <Svg>
      <path d="M8 3h8c0 5-1.5 8-4 8s-4-3-4-8Z" />
      <path d="M12 11v8" />
      <path d="M9 21h6" />
    </Svg>
  ),
  molusco: () => (
    <Svg>
      <path d="M12 4c5 0 8 4 8 9 0 4-3 7-8 7s-8-3-8-7c0-5 3-9 8-9Z" />
      <path d="M12 4v16" />
      <path d="M8 6c-1 4-1 9 0 13" />
      <path d="M16 6c1 4 1 9 0 13" />
    </Svg>
  ),
  altramuz: () => (
    <Svg>
      <path d="M12 21v-8" />
      <circle cx="12" cy="6" r="1.6" />
      <circle cx="9.5" cy="9" r="1.6" />
      <circle cx="14.5" cy="9" r="1.6" />
      <circle cx="10.5" cy="12" r="1.6" />
      <circle cx="13.5" cy="12" r="1.6" />
    </Svg>
  ),
}

const norm = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\s+/g, ' ').trim()

/** Acepta código de carta impresa ('H.L.G.') o array de nombres (carta web). */
export function parseAllergens(value?: string | string[] | null): AllergenKey[] {
  if (!value) return []
  const tokens = Array.isArray(value) ? value : value.split(/[.,;]/)
  const out: AllergenKey[] = []
  for (const tok of tokens) {
    const k = CODE_MAP[norm(tok)]
    if (k && !out.includes(k)) out.push(k)
  }
  return out
}

function AllergenChip({ k }: { k: AllergenKey }) {
  const { locale } = useI18n()
  const label = LABELS[k][locale]
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className="flex h-6 w-6 items-center justify-center rounded-full border border-ink/15 text-ink/60 transition-colors hover:border-brand hover:text-brand"
    >
      {ICONS[k]()}
    </span>
  )
}

/** Fila de iconos de alérgenos; fallback a texto si algún código no tiene icono. */
export function AllergenIcons({ value }: { value?: string | string[] | null }) {
  const keys = parseAllergens(value)
  if (keys.length === 0) {
    if (!value) return null
    return (
      <p className="mt-1 font-mono2 text-[11px] uppercase tracking-widest text-ink/60">
        {Array.isArray(value) ? value.join(' · ') : value}
      </p>
    )
  }
  return (
    <span className="mt-1.5 flex flex-wrap gap-1.5">
      {keys.map((k) => <AllergenChip key={k} k={k} />)}
    </span>
  )
}

/** Leyenda visible icono → nombre, al pie de la carta. */
export function AllergenLegend() {
  const { locale, t } = useI18n()
  return (
    <div className="mt-10 border-t border-ink/10 pt-6">
      <p className="font-mono2 text-[11px] uppercase tracking-widest text-ink/60">
        {t.carta.allergenLegend}
      </p>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {ALLERGEN_KEYS.map((k) => (
          <li key={k} className="flex items-center gap-2 text-xs text-ink/60">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-ink/15 text-ink/65">
              {ICONS[k]()}
            </span>
            {LABELS[k][locale]}
          </li>
        ))}
      </ul>
    </div>
  )
}