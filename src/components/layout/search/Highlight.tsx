import type { ReactNode } from 'react'
import { normalize } from '@/lib/dishSearch'

/** Resalta lo escrito sin distinguir tildes ni mayúsculas ("pina" marca "Piña"). */
export function Highlight ({ text, tokens }: { text: string, tokens: string[] }) {
  const src = text.normalize('NFC')
  const n = normalize(src)
  // Si normalizar cambia la longitud, las posiciones ya no coinciden: se muestra sin resaltar
  if (n.length !== src.length) return <>{src}</>

  const marked = new Array<boolean>(src.length).fill(false)
  for (const t of tokens) {
    let i = n.indexOf(t)
    while (i !== -1) {
      for (let k = i; k < i + t.length; k++) marked[k] = true
      i = n.indexOf(t, i + t.length)
    }
  }
  if (!marked.some(Boolean)) return <>{src}</>

  const parts: ReactNode[] = []
  let start = 0
  for (let i = 1; i <= src.length; i++) {
    if (i === src.length || marked[i] !== marked[start]) {
      const chunk = src.slice(start, i)
      parts.push(
        marked[start]
          ? <mark key={start} className='bg-transparent font-semibold text-ink'>{chunk}</mark>
          : chunk
      )
      start = i
    }
  }
  return <>{parts}</>
}
