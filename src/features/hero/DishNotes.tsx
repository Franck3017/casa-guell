// features/hero/DishNotes.tsx
import { DISH_NOTES } from './sketchPaths'

// El trazo escala con la foto: en móvil el retrato es pequeño y la línea quedaría demasiado fina.
const THICKER_ON_PHONES = { loop: 'max-md:[stroke-width:3.4]', steam: 'max-md:[stroke-width:2.6]' }

/**
 * Anotaciones a mano sobre el retrato: rodean el plato de la semana, lo llevan con una flecha hasta su pie
 * de foto y, en reposo, dejan subir un poco de vapor. Van en blanco tiza y no en el azul de la pluma porque
 * se dibujan encima de la foto, donde el azul no se lee sobre la chaqueta.
 * Sin JS o con movimiento reducido el círculo y la flecha se ven ya dibujados; el vapor solo existe animado
 * (lo mueve useDrawnEntrance, que localiza cada trazo por `data-note`).
 */
export function DishNotes () {
  const { w, h, loop, arrow, arrowhead, steam } = DISH_NOTES
  return (
    <svg
      aria-hidden='true'
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio='none'
      fill='none'
      stroke='var(--cg-chalk)'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='pointer-events-none absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_0_1.5px_rgb(0_0_0/0.5)]'
    >
      {steam.map((d) => (
        <path key={d} data-note='steam' d={d} strokeWidth={1.5} className={THICKER_ON_PHONES.steam} style={{ visibility: 'hidden' }} />
      ))}
      <path data-note='loop' d={loop} strokeWidth={2.2} className={THICKER_ON_PHONES.loop} />
      {/* La flecha solo tiene sentido en escritorio, donde el pie cuelga justo debajo del retrato */}
      <g className='max-md:hidden'>
        <path data-note='arrow' d={arrow} strokeWidth={2.2} />
        <path data-note='arrowhead' d={arrowhead} strokeWidth={2.2} />
      </g>
    </svg>
  )
}
