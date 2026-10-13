import type { KeyboardEvent } from 'react'

const ALONG: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 }
const ACROSS: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 }

/**
 * Teclado de un grupo de opciones excluyentes (`role='radiogroup'`): las flechas pasan a la opción elegible
 * anterior o siguiente, la eligen y llevan el foco con ella. Así el grupo ocupa un solo paso de tabulación
 * por muchas opciones que tenga, que es lo que hacen los botones de opción del navegador.
 * Si el grupo es una rejilla y lo dice con `data-columns`, arriba y abajo van a la misma columna de la fila
 * de al lado, que es donde mira quien lo ve; si allí no hay opción elegible, el foco no se mueve.
 */
export function onRovingKeyDown (e: KeyboardEvent<HTMLElement>): void {
  const step = ALONG[e.key] ?? ACROSS[e.key]
  const active = document.activeElement as HTMLButtonElement
  const all = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'))
  if (step == null || !all.includes(active)) return
  e.preventDefault()

  const columns = Number(e.currentTarget.dataset.columns ?? 0)
  const eligible = all.filter((option) => !option.disabled)
  const next = columns > 0 && e.key in ACROSS
    ? all[all.indexOf(active) + step * columns]
    : eligible[(eligible.indexOf(active) + step + eligible.length) % eligible.length]
  if (next == null || next.disabled) return
  next.focus()
  next.click()
}
