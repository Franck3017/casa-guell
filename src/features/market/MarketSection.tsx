import { Phone } from 'lucide-react'
import { Reveal, SectionTitle, TornEdge } from '@/components/ui'
import { IMG, imgSrcSet } from '@/lib/constants'
import { PHONE, PHONE_HREF } from '@/lib/place'
import { useI18n } from '@/i18n'
import { NewsletterSignup } from './NewsletterSignup'

/**
 * Mercado, en dos alturas. Arriba, la historia: a la izquierda el porqué (no hay carta fija) y, abajo del
 * todo, lo que se puede hacer hoy, que es llamar y preguntar; el teléfono va en grande y su filete queda a
 * la altura del pie de las fotos. A la derecha, las dos fotos de la compra del día, una junto a la otra.
 * Debajo, separada por un filete, la tira del boletín: es la otra forma de enterarse, y va aparte.
 */
export function MarketSection () {
  const { t } = useI18n()

  return (
    <section id='mercat' className='relative overflow-clip bg-linen/40'>
      <TornEdge />
      <TornEdge side='bottom' />
      <div className='mx-auto max-w-6xl px-6 py-24 md:py-32'>
        <div className='grid gap-14 md:grid-cols-12 md:gap-x-10'>
          <div className='flex flex-col md:col-span-5 md:justify-between'>
            <div>
              <SectionTitle title={t.mercat.title} />
              <Reveal>
                <p className='mt-8 max-w-[46ch] text-base leading-relaxed text-ink/70 md:text-lg'>
                  {t.mercat.desc}
                </p>
              </Reveal>
            </div>

            <div className='mt-12'>
              <Reveal>
                <a href={PHONE_HREF} className='group block'>
                  <span className='flex items-center gap-2.5 font-body text-sm font-semibold text-ink'>
                    <Phone aria-hidden='true' size={15} strokeWidth={1.8} className='shrink-0 text-brand' />
                    {t.mercat.accion}
                  </span>
                  <span className='mt-3 block whitespace-nowrap font-display text-[clamp(2.5rem,4.6vw,3.5rem)] leading-none tracking-[-0.03em] text-ink transition-colors duration-200 group-hover:text-brand motion-reduce:transition-none'>
                    {PHONE}
                  </span>
                </a>
              </Reveal>
              <span aria-hidden='true' data-draw className='mt-5 block h-0.5 bg-brand' />
            </div>
          </div>

          {/*
            Dos fotos reales de la compra del día: la cigala en la mano y la caja azul de la lonja.
            self-start: la pareja mide lo que mide la foto grande aunque la columna de texto sea más alta
            (tableta); así las dos fotos siempre acaban a la misma altura y el rótulo queda arriba.
          */}
          <div className='grid grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)] gap-3 md:col-span-7 md:gap-5 md:self-start'>
            <figure className='flex flex-col justify-between gap-6'>
              <figcaption className='font-mono2 text-[11px] uppercase leading-[1.7] tracking-widest text-ink/60'>
                {t.mercat.caption.split(' · ').map((line) => <span key={line} className='block'>{line}</span>)}
              </figcaption>
              <div data-wipe className='overflow-clip'>
                <img
                  src={IMG.cigalaMano}
                  srcSet={imgSrcSet(IMG.cigalaMano, 480, 1331)}
                  sizes='(min-width: 768px) 20vw, 34vw'
                  alt={t.mercat.imgAlt3}
                  width={1331}
                  height={2000}
                  loading='lazy'
                  className='aspect-[3/4] w-full object-cover object-[40%_55%]'
                />
              </div>
            </figure>
            <div data-wipe className='overflow-clip'>
              <img
                src={IMG.chefCigalas}
                srcSet={imgSrcSet(IMG.chefCigalas, 800, 1331)}
                sizes='(min-width: 768px) 34vw, 56vw'
                alt={t.mercat.imgAlt2}
                width={1331}
                height={2000}
                loading='lazy'
                className='aspect-[4/5] w-full object-cover object-[50%_58%]'
              />
            </div>
          </div>
        </div>

        <NewsletterSignup />
      </div>
    </section>
  )
}
