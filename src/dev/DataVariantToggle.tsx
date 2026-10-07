import { DATA_VARIANTS, readVariant, type DataVariant } from '@/data/variants'

const LABEL: Record<DataVariant, string> = {
  demo: 'Demo data',
  worst: 'Worst case',
  empty: 'Empty',
  one: 'One',
  huge: '1,000 rows'
}

/** Selector dev-only (no se monta en producción): recarga con `?data=` para que la elección persista. */
export function DataVariantToggle () {
  const current = readVariant()

  const choose = (v: DataVariant) => {
    const url = new URL(window.location.href)
    if (v === 'demo') url.searchParams.delete('data')
    else url.searchParams.set('data', v)
    window.location.assign(url)
  }

  return (
    <div
      role='radiogroup'
      aria-label='Dataset'
      style={{
        position: 'fixed', bottom: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 70,
        display: 'flex', gap: 2, padding: 3, borderRadius: 999, background: '#e5e5e5',
        fontFamily: 'system-ui, sans-serif', fontSize: 12, boxShadow: '0 1px 4px rgb(0 0 0 / .2)'
      }}
    >
      {DATA_VARIANTS.map((v) => (
        <button
          key={v}
          role='radio'
          aria-checked={current === v}
          onClick={() => choose(v)}
          style={{
            padding: '5px 10px', borderRadius: 999, border: 0, cursor: 'pointer', whiteSpace: 'nowrap',
            background: current === v ? '#fff' : 'transparent', color: '#111',
            fontWeight: current === v ? 600 : 400
          }}
        >
          {LABEL[v]}
        </button>
      ))}
    </div>
  )
}
