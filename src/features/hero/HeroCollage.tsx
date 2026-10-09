// features/hero/HeroCollage.tsx
import { HERO_PORTRAIT } from '@/lib/constants'
import { useI18n } from '@/i18n'
import { DishNotes } from './DishNotes'
import { Sketch } from './Sketch'
import { PAPER_SKETCH, PORTRAIT_SKETCH } from './sketchPaths'

/**
 * Collage del hero: hoja de papel de bandeja girada (detrás) y retrato del chef presentando el plato
 * destacado, con sus anotaciones a mano y su pie. Cada capa lleva sus envoltorios: deriva con el scroll >
 * boceto + contenido.
 */
export function HeroCollage () {
  const { t } = useI18n()

  return (
    // En escritorio el ancho también depende del alto de la pantalla: el collage es casi cuadrado y, con su
    // pie, tiene que caber entero bajo la barra de navegación (si no, el pie se corta en portátiles).
    <div className='mx-auto w-full max-w-[720px] md:ml-auto md:max-w-[clamp(400px,calc((100svh-13rem)/1.02),720px)]'>
      <div className='relative aspect-[1/1.02] w-full'>
        <div className='hero-drift-paper absolute -right-[3%] top-[9%] h-[80%] w-[58%]'>
          <div aria-hidden='true' className='relative h-full w-full -rotate-3'>
            <div data-hero-fill='paper' className='paper-print h-full w-full border border-ink/10 bg-linen/70' />
            <Sketch name='paper' geometry={PAPER_SKETCH} />
          </div>
        </div>

        <div className='hero-drift-portrait absolute left-[3%] top-0 w-[70%]'>
          <div className='relative'>
            <figure className='aspect-[4/5] overflow-hidden'>
              {/* Sin data-hero-fill: el retrato no se oculta para la entrada, se ve desde el primer pintado */}
              <img
                src={HERO_PORTRAIT.src}
                srcSet={HERO_PORTRAIT.srcSet}
                sizes={HERO_PORTRAIT.sizes}
                alt={t.hero.chefAlt}
                width={1024}
                height={1536}
                fetchPriority='high'
                className='h-full w-full bg-linen object-cover object-[50%_22%]'
              />
            </figure>
            <Sketch name='portrait' geometry={PORTRAIT_SKETCH} />
            <DishNotes />
          </div>
          {/* En escritorio el pie cuelga del retrato y deriva con él; así el retrato nunca lo tapa al hacer scroll */}
          <div data-hero-caption className='absolute left-0 top-full mt-3 hidden w-[57%] md:block'>
            <DishCaption />
          </div>
        </div>
      </div>

      {/* En móvil el pie va debajo del collage */}
      <div data-hero-caption className='mt-5 border-t border-ink/15 pt-4 md:hidden'>
        <DishCaption />
      </div>
    </div>
  )
}

function DishCaption () {
  const { t } = useI18n()
  return (
    <>
      <p data-hero-caption-line className='font-mono2 text-[11px] uppercase tracking-[0.16em] text-brand'>
        {t.hero.featuredLabel}
      </p>
      <p data-hero-caption-line className='mt-1.5 font-display text-[clamp(1.375rem,1.8vw,1.75rem)] leading-[1.08] tracking-[-0.03em] text-ink'>
        {t.hero.featuredDish}
      </p>
      <p data-hero-caption-line className='mt-1.5 text-balance text-sm text-ink/70'>{t.hero.featuredDescription}</p>
    </>
  )
}
