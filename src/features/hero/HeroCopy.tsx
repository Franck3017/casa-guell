// features/hero/HeroCopy.tsx
import { ArrowUpRight } from 'lucide-react'
import { useI18n } from '@/i18n'
import { openReserve } from '@/lib/events'

/** Columna de texto del hero: titular con "sin maquillaje" subrayado a pluma, entradilla y las dos acciones. */
export function HeroCopy () {
  const { t } = useI18n()

  return (
    <div className='hero-drift-copy'>
      <h1 className='max-w-[13ch] font-display text-[clamp(3.5rem,7.3vw,5.9rem)] leading-[1.02] tracking-[-0.04em] text-ink'>
        {t.hero.lema1}{' '}
        <em data-hero-accent className='relative inline-block pb-1 text-brand'>
          {t.hero.lema2}
          {/* Subrayado a pluma: decorativo, se dibuja al final de la frase */}
          <svg
            aria-hidden='true'
            viewBox='0 0 300 14'
            preserveAspectRatio='none'
            className='pointer-events-none absolute -bottom-[0.04em] left-0 h-[0.16em] w-full overflow-visible'
          >
            <path
              data-sketch='underline'
              d='M2 8 C 60 3, 120 11, 190 6 S 270 4, 298 7 C 240 9, 150 12, 70 11'
              fill='none'
              stroke='var(--cg-brand)'
              strokeOpacity={0.6}
              strokeWidth={1.6}
              strokeLinecap='round'
            />
          </svg>
        </em>
      </h1>
      <p className='mt-7 max-w-[46ch] text-base leading-[1.65] text-ink/70 md:text-lg'>
        {t.hero.intro}
      </p>

      <div className='mt-8 flex flex-wrap items-center gap-x-6 gap-y-4'>
        <button
          onClick={openReserve}
          className='press inline-flex min-h-12 items-center gap-3 rounded-full bg-ink px-6 font-body text-sm font-semibold text-cream transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand motion-reduce:transition-none'
        >
          {t.reserve.title}
          <ArrowUpRight aria-hidden='true' size={17} strokeWidth={1.8} />
        </button>
        <a
          href='#carta'
          className='group inline-flex min-h-12 items-center gap-2 font-body text-sm font-semibold text-ink underline decoration-ink/25 underline-offset-8 transition-colors hover:text-brand hover:decoration-brand focus-visible:outline-offset-4'
        >
          {t.hero.ctaCarta}
          <ArrowUpRight aria-hidden='true' size={16} strokeWidth={1.7} className='transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none' />
        </a>
      </div>
    </div>
  )
}
