// features/hero/Sketch.tsx
import type { SketchGeometry } from './sketchPaths'

/**
 * Boceto a pluma sobre una capa: marco y, si lo hay, sombreado. Oculto por defecto: solo lo enseña
 * la animación de entrada (useDrawnEntrance, que lo localiza por `data-sketch-layer`), así que sin JS
 * o con movimiento reducido la foto se ve tal cual, sin líneas encima.
 */
export function Sketch ({ name, geometry }: { name: string, geometry: SketchGeometry }) {
  const { w, h, frame, hatch } = geometry
  return (
    <svg
      data-sketch-layer={name}
      aria-hidden='true'
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio='none'
      fill='none'
      stroke='var(--cg-brand)'
      strokeLinecap='round'
      className='pointer-events-none absolute inset-0 h-full w-full overflow-visible'
      style={{ visibility: 'hidden' }}
    >
      {hatch.map((d) => <path key={d} data-sketch='hatch' d={d} strokeWidth={0.9} strokeOpacity={0.55} />)}
      {frame.map((d) => <path key={d} data-sketch='frame' d={d} strokeWidth={1.3} />)}
    </svg>
  )
}
