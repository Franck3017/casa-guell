import { useRef } from 'react'
import { Pause, Play } from 'lucide-react'
import { Logo, TornEdge, Words } from '@/components/ui'
import { useBrandFilm } from '@/hooks/useBrandFilm'
import { useI18n } from '@/i18n'

// Todo el tamaño de letra va en unidades del ancho de la pieza (cqw): la composición escala entera.
const SCENE = 'absolute inset-0 flex flex-col items-center justify-center overflow-clip px-[6cqw] text-center'
const PHRASE = 'relative font-display text-[13.5cqw] leading-[0.98] tracking-[-0.04em] text-balance md:text-[8.6cqw]'

// Marcas de la esfera del reloj. Faltan las de las 3 y las 9: caerían encima de la frase.
const TICKS = [0, 30, 60, 120, 150, 180, 210, 240, 300, 330]

// Burbujas de la olla: posición horizontal (%) y diámetro (cqw)
const BUBBLES = [[8, 5], [19, 3], [29, 6.5], [41, 3.5], [52, 5], [63, 3], [72, 6], [84, 4], [93, 5.5]] as const

/**
 * "Casa Güell en cinco ideas": pieza animada a todo el ancho, entre la filosofía y la carta. Seis escenas
 * apiladas (la última, el rótulo, queda encima y es lo que se ve sin animación). El movimiento está en
 * useBrandFilm; aquí solo se pintan las escenas. Las frases son las de la casa (t.film.phrases).
 * Es decorativa para lectores de pantalla, que reciben las cinco frases como una lista normal.
 */
export function BrandFilm () {
  const { t, locale } = useI18n()
  const stageRef = useRef<HTMLDivElement>(null)
  const { ready, paused, toggle } = useBrandFilm(stageRef, locale)
  const { market, simmer, memory, fire, shortcuts } = t.film.phrases

  return (
    <section aria-label={t.film.label} className='relative'>
      <ul className='sr-only'>
        {[market, simmer, memory, fire, shortcuts].map((phrase) => <li key={phrase}>{phrase}</li>)}
      </ul>

      <div
        ref={stageRef}
        aria-hidden='true'
        className='relative isolate aspect-[4/5] max-h-[88svh] w-full overflow-clip [container-type:inline-size] sm:aspect-[16/10] lg:aspect-[16/7]'
      >
        {/* A · Producto de mercado */}
        <div data-scene='a' className={`${SCENE} bg-brand text-cream`}>
          <div className='paper-print-on-brand absolute inset-0' />
          <svg viewBox='0 0 100 100' className='absolute left-1/2 top-1/2 h-[118%] w-[112%] -translate-x-1/2 -translate-y-1/2 overflow-visible' fill='none' stroke='currentColor'>
            <circle data-plate cx='50' cy='50' r='46' strokeWidth='0.35' pathLength={1} strokeDasharray={1} opacity='0.55' />
            <circle data-plate cx='50' cy='50' r='33' strokeWidth='0.25' pathLength={1} strokeDasharray={1} opacity='0.4' />
            <circle data-plate-dot cx='82.5' cy='17.5' r='2.2' fill='currentColor' stroke='none' />
          </svg>
          <p className={PHRASE}><Words text={market} mask /></p>
        </div>

        {/* B · Xup-xup */}
        <div data-scene='b' className={`${SCENE} bg-cream text-ink`}>
          {BUBBLES.map(([left, size]) => (
            <span
              key={left}
              data-bubble
              className='absolute top-full rounded-full border border-brand'
              style={{ left: `${left}%`, width: `${size}cqw`, height: `${size}cqw` }}
            />
          ))}
          <p className={`${PHRASE} italic text-brand`}>
            {simmer.split(' ').map((word, w) => (
              <span key={`${word}-${w}`}>
                {w > 0 && ' '}
                <span className='-mb-[0.2em] inline-block overflow-y-clip whitespace-nowrap pb-[0.2em] align-bottom'>
                  {[...word].map((char, c) => <span key={c} data-char className='inline-block'>{char}</span>)}
                </span>
              </span>
            ))}
          </p>
        </div>

        {/* C · Memoria catalana */}
        <div data-scene='c' className={`${SCENE} bg-ink text-cream`}>
          <div className='absolute inset-x-0 top-1/2 flex h-[62%] -translate-y-1/2 flex-col justify-between'>
            {[0, 1, 2, 3].map((bar) => <span key={bar} data-bar className='block h-[11%] bg-brand' />)}
          </div>
          <p className={PHRASE}><Words text={memory} mask /></p>
        </div>

        {/* D · Fuego lento */}
        <div data-scene='d' className={`${SCENE} bg-brand text-cream`}>
          <svg viewBox='0 0 100 100' className='absolute left-1/2 top-1/2 h-[104%] w-[96%] -translate-x-1/2 -translate-y-1/2 overflow-visible' stroke='currentColor' fill='none' strokeLinecap='round'>
            {TICKS.map((deg) => (
              <line key={deg} data-tick x1='50' y1='5' x2='50' y2={deg % 180 === 0 ? 11 : 8.5} strokeWidth='0.4' opacity='0.6' transform={`rotate(${deg} 50 50)`} />
            ))}
            {/* La aguja es un punto que recorre la esfera por fuera: no cruza la frase */}
            <circle data-hand cx='50' cy='7' r='1.7' fill='currentColor' stroke='none' />
          </svg>
          {/* La frase en contorno y, encima, la misma frase rellena que se va descubriendo */}
          <div className='relative grid'>
            <p className={`${PHRASE} col-start-1 row-start-1 text-transparent [-webkit-text-stroke:1px_var(--cg-cream)]`}>
              <Words text={fire} mask />
            </p>
            <p data-slow-fill className={`${PHRASE} col-start-1 row-start-1`}><Words text={fire} mask /></p>
          </div>
        </div>

        {/* E · Sin atajos */}
        <div data-scene='e' className={`${SCENE} bg-surface text-ink`}>
          <svg viewBox='0 0 200 100' preserveAspectRatio='none' className='absolute inset-0 h-full w-full' fill='none' strokeLinecap='round'>
            <path data-shortcut d='M12 86 L188 14' stroke='var(--cg-ink)' strokeOpacity='0.35' strokeWidth='0.5' pathLength={1} strokeDasharray={1} />
            <path
              data-route
              d='M12 86 C 30 60, 44 96, 62 78 S 78 22, 100 30 S 116 84, 140 70 S 150 12, 188 14'
              stroke='var(--cg-brand)' strokeWidth='0.8' pathLength={1} strokeDasharray={1}
            />
          </svg>
          <p className={PHRASE}><Words text={shortcuts} mask /></p>
        </div>

        {/* F · El rótulo. Va la última: sin animación es lo que queda a la vista */}
        <div data-scene='f' className={`${SCENE} bg-cream text-ink`}>
          <div className='relative'>
            <div className='overflow-y-clip pb-[0.06em]'>
              <Logo animated className='text-[14cqw] md:text-[12.5cqw]' />
            </div>
            <svg viewBox='0 0 300 14' preserveAspectRatio='none' className='absolute -bottom-[1.2cqw] left-0 h-[1.6cqw] w-full overflow-visible' fill='none'>
              <path
                data-film-underline
                d='M2 8 C 60 3, 120 11, 190 6 S 270 4, 298 7'
                stroke='var(--cg-brand)' strokeWidth='1.6' strokeLinecap='round' pathLength={1} strokeDasharray={1}
              />
            </svg>
          </div>
          <p data-film-kicker className='mt-[4.5cqw] font-mono2 text-[3.1cqw] uppercase tracking-[0.2em] text-ink/70 md:mt-[2.6cqw] md:text-[1.15cqw]'>
            {t.hero.kicker}
          </p>
        </div>

        <div data-cover className='paper-print-on-brand absolute inset-0 bg-brand [clip-path:inset(0%_0%_100%_0%)]' />
      </div>

      <TornEdge />
      <TornEdge side='bottom' />

      {ready && (
        <button
          type='button'
          onClick={toggle}
          aria-label={paused ? t.film.play : t.film.pause}
          className='press absolute bottom-7 right-4 inline-flex size-11 items-center justify-center rounded-full border border-ink/15 bg-surface/90 text-ink transition-colors hover:border-ink/40 sm:right-6'
        >
          {paused ? <Play aria-hidden='true' size={16} strokeWidth={1.8} /> : <Pause aria-hidden='true' size={16} strokeWidth={1.8} />}
        </button>
      )}
    </section>
  )
}
