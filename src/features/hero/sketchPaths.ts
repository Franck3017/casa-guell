// features/hero/sketchPaths.ts
// Geometría de los bocetos a pluma del hero: genera los trazos (atributo `d` de SVG) de marcos y sombreados.
// Es código puro, sin React ni DOM; el resultado se calcula una vez al cargar el módulo.

type Point = [number, number]

/** Azar con semilla: el mismo boceto en cada carga. */
function seeded (seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

const fmt = (n: number): string => n.toFixed(1)

/** Curva suave que pasa cerca de los puntos: da el pulso irregular de una línea hecha a mano. */
function smoothPath (pts: Point[]): string {
  let d = `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`
  for (let i = 1; i < pts.length - 1; i++) {
    const [cx, cy] = pts[i]
    const last = i === pts.length - 2
    const ex = last ? pts[i + 1][0] : (cx + pts[i + 1][0]) / 2
    const ey = last ? pts[i + 1][1] : (cy + pts[i + 1][1]) / 2
    d += `Q${fmt(cx)} ${fmt(cy)} ${fmt(ex)} ${fmt(ey)}`
  }
  return d
}

/** Recta trazada a pulso entre dos puntos: tres desvíos pequeños perpendiculares a la línea. */
function sketchLine (rand: () => number, a: Point, b: Point, wobble: number): string {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy)
  const pts: Point[] = [a]
  for (let i = 1; i < 4; i++) {
    const off = (rand() - 0.5) * 2 * wobble
    pts.push([a[0] + dx * (i / 4) - (dy / len) * off, a[1] + dy * (i / 4) + (dx / len) * off])
  }
  pts.push(b)
  return smoothPath(pts)
}

/** Marco de boceto: cuatro líneas que se pasan de las esquinas, como en un dibujo de arquitecto. */
function sketchFrame (w: number, h: number, seed: number): string[] {
  const rand = seeded(seed)
  const o = () => w * (0.035 + rand() * 0.05)
  const wob = w * 0.006
  return [
    sketchLine(rand, [-o(), 0], [w + o(), 0], wob),
    sketchLine(rand, [w, -o()], [w, h + o()], wob),
    sketchLine(rand, [w + o(), h], [-o(), h], wob),
    sketchLine(rand, [0, h + o()], [0, -o()], wob)
  ]
}

/** Sombreado a lápiz: diagonales paralelas de ida y vuelta, con los extremos desiguales. */
function sketchHatch (w: number, h: number, count: number, seed: number): string[] {
  const rand = seeded(seed)
  const lines: string[] = []
  for (let i = 1; i <= count; i++) {
    const c = ((w + h) / (count + 1)) * i + (rand() - 0.5) * w * 0.03
    let a: Point = [Math.min(c, w), c - Math.min(c, w)]
    let b: Point = [Math.max(0, c - h), c - Math.max(0, c - h)]
    // Los extremos no llegan siempre al borde: el lápiz se levanta antes
    const inA = rand() * 0.1
    const inB = rand() * 0.1
    const ax = a[0] + (b[0] - a[0]) * inA; const ay = a[1] + (b[1] - a[1]) * inA
    const bx = b[0] + (a[0] - b[0]) * inB; const by = b[1] + (a[1] - b[1]) * inB
    a = [ax, ay]; b = [bx, by]
    lines.push(i % 2 === 0 ? sketchLine(rand, a, b, w * 0.008) : sketchLine(rand, b, a, w * 0.008))
  }
  return lines
}

export interface SketchGeometry {
  /** Lienzo del boceto, en la misma proporción que la capa que cubre (así el trazo no se deforma). */
  w: number
  h: number
  frame: string[]
  hatch: string[]
}

/** Retrato del chef: marco y sombreado a lápiz. */
export const PORTRAIT_SKETCH: SketchGeometry = {
  w: 400,
  h: 500,
  frame: sketchFrame(400, 500, 11),
  hatch: sketchHatch(400, 500, 15, 23)
}

/** Hoja de papel de bandeja: solo marco. */
export const PAPER_SKETCH: SketchGeometry = {
  w: 390,
  h: 500,
  frame: sketchFrame(390, 500, 5),
  hatch: []
}

/**
 * Círculo hecho a mano alrededor de algo: una vuelta y un poco más, que se va abriendo y no cierra justo
 * donde empezó. Arranca arriba a la izquierda y gira en sentido contrario a las agujas del reloj.
 */
function sketchLoop (cx: number, cy: number, rx: number, ry: number, tiltDeg: number, seed: number): string {
  const rand = seeded(seed)
  const tilt = (tiltDeg * Math.PI) / 180
  const steps = 16
  const pts: Point[] = []
  for (let i = 0; i <= steps; i++) {
    const k = i / steps
    const t = ((215 - 400 * k) * Math.PI) / 180
    const grow = 0.97 + 0.08 * k
    const x = rx * grow * Math.cos(t) + (rand() - 0.5) * 3
    const y = ry * grow * Math.sin(t) + (rand() - 0.5) * 3
    pts.push([cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)])
  }
  return smoothPath(pts)
}

export interface DishNotesGeometry {
  /** Mismo lienzo que el boceto del retrato: las notas van colocadas sobre esa foto concreta. */
  w: number
  h: number
  loop: string
  arrow: string
  arrowhead: string
  steam: string[]
}

/**
 * Anotaciones sobre el retrato: el círculo que rodea la bandeja del brioche, la flecha que baja hasta el
 * pie de foto y el vapor del plato. Las coordenadas salen de la foto `chef_brioche.webp` con su recorte
 * actual (object-position 50% 22%): si cambia la foto o el recorte, hay que recolocarlas.
 */
export const DISH_NOTES: DishNotesGeometry = {
  w: 400,
  h: 500,
  loop: sketchLoop(290, 332, 112, 56, -23.5, 7),
  arrow: 'M192 414 C176 462 96 452 34 486',
  arrowhead: 'M48 485.3 L34 486 L42.1 474.6',
  steam: [
    'M258 312 c7 -9 -7 -17 0 -27 s6 -15 0 -24',
    'M297 295 c7 -9 -7 -17 0 -27 s6 -15 0 -24',
    'M332 285 c7 -9 -7 -17 0 -27 s6 -15 0 -24'
  ]
}
