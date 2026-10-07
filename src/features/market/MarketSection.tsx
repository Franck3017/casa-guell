import { Reveal, SectionTitle, TornEdge } from '@/components/ui'
import { data } from '@/data'
import { IMG, imgSrcSet } from '@/lib/constants'
import { useI18n } from '@/i18n'
import { NewsletterSignup } from './NewsletterSignup'

const PHONE = data.ubicacion.contacto.telefono
const PHONE_HREF = `tel:+34${PHONE.replace(/\s/g, '')}`

export function MarketSection () {
  const { t } = useI18n()

  return (
    <section id='mercat' className='relative overflow-clip bg-linen/40'>
      <TornEdge />
      <TornEdge side='bottom' />
      <div className='mx-auto grid max-w-6xl gap-14 px-6 py-24 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:items-center md:gap-20 md:py-32'>
        {/* Dos fotos reales de la compra del día: la caja azul de la lonja y la cigala */}
        <div className='md:order-first'>
          <div className='relative pb-16 pr-[14%] md:pb-20'>
            <div data-wipe className='overflow-clip'>
            <img
              src={IMG.chefCigalas}
              srcSet={imgSrcSet(IMG.chefCigalas, 800, 1331)}
              sizes='(min-width: 768px) 40vw, 90vw'
              alt={t.mercat.imgAlt2}
              width={1331}
              height={2000}
              loading='lazy'
              className='aspect-[4/5] w-full object-cover object-[50%_58%]'
            />
            </div>
            <div data-parallax='-22' className='absolute bottom-0 right-0 w-[38%] border-[6px] border-cream'>
              <img
                src={IMG.cigalaMano}
                srcSet={imgSrcSet(IMG.cigalaMano, 480, 1331)}
                sizes='(min-width: 768px) 16vw, 36vw'
                alt={t.mercat.imgAlt3}
                width={1331}
                height={2000}
                loading='lazy'
                className='aspect-[3/4] w-full object-cover object-[40%_55%]'
              />
            </div>
          </div>
          <p className='mt-3 font-mono2 text-[11px] uppercase tracking-widest text-ink/60'>
            {t.mercat.caption}
          </p>
        </div>

        <div>
          <SectionTitle title={t.mercat.title} />
          <Reveal>
          <p className='mt-8 max-w-[52ch] text-base leading-relaxed text-ink/70 md:text-lg'>
            {t.mercat.desc}
          </p>
          <a
            href={PHONE_HREF}
            className='group mt-8 inline-flex min-h-12 flex-wrap items-center gap-x-4 gap-y-1 font-body text-sm font-semibold text-ink underline decoration-brand underline-offset-8 transition-colors hover:text-brand motion-reduce:transition-none'
          >
            {t.mercat.accion}
            <span className='font-mono2 text-sm font-normal text-brand'>{PHONE}</span>
          </a>

          <NewsletterSignup />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
