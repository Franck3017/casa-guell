// features/hero/DishNotes.tsx
import { DISH_NOTES } from './sketchPaths'

// El trazo escala con la foto: en móvil el retrato es pequeño y la línea quedaría demasiado fina.
const THICKER_ON_PHONES = { loop: 'max-md:[stroke-width:3.4]', steam: 'max-md:[stroke-width:2.6]' }

const CHALK_SHADOW = 'drop-shadow-[0_0_1.5px_rgb(0_0_0/0.5)]'

// Caja de cada hilo de vapor, en unidades del lienzo: el trazo (51 de alto) con margen para su sombra.
const WISP = { w: 20, h: 60, left: 10, top: 55 }

/**
 * Anotaciones a mano sobre el retrato: rodean el plato de la semana, lo llevan con una flecha hasta su pie
 * de foto y, en reposo, dejan subir un poco de vapor. Van en blanco tiza y no en el azul de la pluma porque
 * se dibujan encima de la foto, donde el azul no se lee sobre la chaqueta.
 * Sin JS o con movimiento reducido el círculo y la flecha se ven ya dibujados; el vapor solo existe animado.
 * El círculo y la flecha los dibuja useDrawnEntrance (los localiza por `data-note`); el vapor lo mueve el CSS.
 */
export function DishNotes () {
  const { w, h, loop, arrow, arrowhead } = DISH_NOTES
  return (
    <>
      <Steam />
      <svg
        aria-hidden='true'
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio='none'
        fill='none'
        stroke='var(--cg-chalk)'
        strokeLinecap='round'
        strokeLinejoin='round'
        className={`pointer-events-none absolute inset-0 h-full w-full overflow-visible ${CHALK_SHADOW}`}
      >
        <path data-note='loop' d={loop} strokeWidth={2.2} className={THICKER_ON_PHONES.loop} />
        {/* La flecha solo tiene sentido en escritorio, donde el pie cuelga justo debajo del retrato */}
        <g className='max-md:hidden'>
          <path data-note='arrow' d={arrow} strokeWidth={2.2} />
          <path data-note='arrowhead' d={arrowhead} strokeWidth={2.2} />
        </g>
      </svg>
    </>
  )
}

/**
 * Vapor del plato: tres hilos. Cada uno es una ventana que recorta (el <span>) y, dentro, su trazo ya
 * dibujado (el <svg>). La animación está en globals.css (.steam-wisp), que explica por qué va así; `--i`
 * escalona los hilos. Las posiciones salen del mismo lienzo que el resto de las anotaciones.
 */
function Steam () {
  const { w, h, steam, steamCurve } = DISH_NOTES
  return (
    <>
      {steam.map(([x, y], i) => (
        <span
          key={`${x}-${y}`}
          aria-hidden='true'
          className='steam-wisp pointer-events-none absolute overflow-hidden'
          style={{
            left: `${((x - WISP.left) / w) * 100}%`,
            top: `${((y - WISP.top) / h) * 100}%`,
            width: `${(WISP.w / w) * 100}%`,
            height: `${(WISP.h / h) * 100}%`,
            '--i': i
          } as React.CSSProperties}
        >
          <svg
            viewBox={`${x - WISP.left} ${y - WISP.top} ${WISP.w} ${WISP.h}`}
            preserveAspectRatio='none'
            fill='none'
            stroke='var(--cg-chalk)'
            strokeLinecap='round'
            className={`block h-full w-full ${CHALK_SHADOW}`}
          >
            <path d={`M${x} ${y} ${steamCurve}`} strokeWidth={1.5} className={THICKER_ON_PHONES.steam} />
          </svg>
        </span>
      ))}
    </>
  )
}
