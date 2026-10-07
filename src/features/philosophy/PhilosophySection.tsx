import { Reveal, SectionTitle, Words } from '@/components/ui'
import { useI18n } from '@/i18n'

const PILLAR_KEYS = ['origen', 'mercat', 'foc'] as const

export function PhilosophySection () {
  const { t } = useI18n()

  return (
    <section id='filosofia' className='mx-auto max-w-6xl px-6 py-24 md:py-32'>
      <div className='grid gap-14 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:gap-20'>
        <div className='md:sticky md:top-32 md:self-start'>
          <SectionTitle title={t.filosofia.title} />
          <div className='mt-12'>
            {/* La cita se entinta palabra a palabra con el scroll */}
            <blockquote data-ink className='max-w-[22ch] font-display text-[clamp(1.75rem,3vw,2.5rem)] italic leading-[1.14] tracking-[-0.02em] text-ink'>
              “<Words text={t.filosofia.quote} />”
            </blockquote>
            <Reveal>
              <p className='mt-5 font-mono2 text-[11px] uppercase tracking-[0.2em] text-ink/60'>
                {t.filosofia.sign}
              </p>
            </Reveal>
          </div>
        </div>

        <ol className='md:pt-3'>
          {PILLAR_KEYS.map((key, i) => (
            <li key={key}>
              <span
                aria-hidden='true'
                data-draw
                className={`block ${i === 0 ? 'h-0.5 bg-ink/60' : 'h-px bg-ink/20'}`}
              />
              <Reveal delay={i * 70} className='grid grid-cols-[auto_1fr] gap-x-5 py-8 md:gap-x-8 md:py-10'>
                <span aria-hidden='true' className='pt-2 font-mono2 text-xs text-brand'>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className='font-display text-[clamp(1.75rem,2.6vw,2.25rem)] leading-[1.06] tracking-[-0.025em]'>
                    {t.filosofia.pilars[key].t}
                  </h3>
                  <p className='mt-3 max-w-[44ch] text-base leading-relaxed text-ink/70'>
                    {t.filosofia.pilars[key].d}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
