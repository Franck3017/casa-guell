import { Reveal, SectionTitle, Words } from '@/components/ui'
import { IMG, imgSrcSet } from '@/lib/constants'
import { useI18n } from '@/i18n'

const PILLAR_KEYS = ['origen', 'mercat', 'foc'] as const

/**
 * Filosofía. A la izquierda, el retrato de Jordi en la sala, con su frase en una nota de papel de la casa
 * (el mismo papel de caja del tique del pie) prendida sobre la foto. A la derecha, los tres pilares, que
 * se quedan fijos mientras la foto pasa.
 */
export function PhilosophySection () {
  const { t } = useI18n()

  return (
    <section id='filosofia' className='mx-auto max-w-7xl px-6 py-24 md:py-32'>
      <SectionTitle title={t.filosofia.title} />

      <div className='mt-12 grid gap-16 md:mt-16 md:grid-cols-12 md:gap-x-10'>
        <figure className='md:col-span-6'>
          <div data-wipe className='overflow-clip'>
            <img
              src={IMG.chefSetas}
              srcSet={imgSrcSet(IMG.chefSetas, 800, 1331)}
              sizes='(min-width: 768px) 46vw, 92vw'
              alt={t.filosofia.imgAlt}
              width={1331}
              height={2000}
              loading='lazy'
              className='aspect-[4/5] w-full object-cover object-[50%_30%]'
            />
          </div>

          {/* Nota de la casa: se monta sobre la foto y se sale hacia la columna de texto */}
          {/* La sombra va en el envoltorio (drop-shadow): la máscara dentada del tique recortaría una box-shadow */}
          <figcaption className='relative -mt-24 ml-auto w-[88%] max-w-sm rotate-[1.5deg] drop-shadow-[0_10px_22px_rgb(0_0_0/0.22)] md:-mr-16 md:-mt-36 dark:drop-shadow-[0_10px_26px_rgb(0_0_0/0.7)]'>
            <div className='receipt bg-surface px-6 pb-9 pt-6 md:px-8 md:pt-8 dark:bg-[color-mix(in_srgb,var(--cg-surface)_86%,var(--cg-ink))]'>
              {/* La cita se entinta palabra a palabra con el scroll */}
              <blockquote data-ink className='font-display text-[clamp(1.5rem,2.3vw,2rem)] italic leading-[1.16] tracking-[-0.02em] text-ink'>
                “<Words text={t.filosofia.quote} />”
              </blockquote>
              <p className='mt-5 border-t border-dashed border-ink/30 pt-4 font-mono2 text-xs text-ink/70'>
                {t.filosofia.sign}
              </p>
            </div>
          </figcaption>
        </figure>

        <ul className='md:col-span-5 md:col-start-8 md:sticky md:top-32 md:self-start'>
          {PILLAR_KEYS.map((key, i) => (
            <li key={key}>
              <span
                aria-hidden='true'
                data-draw
                className={`block ${i === 0 ? 'h-0.5 bg-ink/60' : 'h-px bg-ink/20'}`}
              />
              <Reveal delay={i * 70} className='py-8 md:py-10'>
                <h3 className='font-display text-[clamp(1.75rem,2.6vw,2.25rem)] leading-[1.06] tracking-[-0.025em]'>
                  {t.filosofia.pilars[key].t}
                </h3>
                <p className='mt-3 max-w-[44ch] text-base leading-relaxed text-ink/70'>
                  {t.filosofia.pilars[key].d}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
