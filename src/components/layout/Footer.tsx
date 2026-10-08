import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { data } from '@/data'
import { useI18n } from '@/i18n'
import { Logo, TornEdge, Words } from '@/components/ui'
import { NAV_IDS } from '@/lib/constants'
import { openReserve } from '@/lib/events'
import { plainHours } from '@/lib/menuFormat'
import { SOCIAL_LINKS } from '@/lib/social'
import { BackToTop } from './BackToTop'

type DayKey = 'md' | 'dg' | 'll'

const PHONE = data.ubicacion.contacto.telefono
const PHONE_HREF = `tel:+34${PHONE.replace(/\s/g, '')}`

/** Línea de tique: concepto a la izquierda, puntos de relleno y valor a la derecha. */
function ReceiptRow ({ label, children }: { label: string, children: ReactNode }) {
  return (
    <div className='flex min-h-9 items-baseline'>
      <dt className='shrink-0'>{label}</dt>
      <span aria-hidden='true' className='leader' />
      <dd className='shrink-0 text-right'>{children}</dd>
    </div>
  )
}

const RECEIPT_LINK = '-my-2 inline-flex min-h-11 items-center underline decoration-brand underline-offset-4 transition-colors hover:text-brand motion-reduce:transition-none'

/**
 * Pie de página. La idea es el final de una comida: sobre un bloque en el azul de la marca queda "la cuenta",
 * un tique de papel con el horario, la dirección, el teléfono y las redes en tipografía de caja registradora.
 * A su lado, la última llamada a reservar y las secciones; debajo, el logotipo tan grande que se sale por el borde de la página.
 * El azul es el mismo acento de toda la web, usado aquí por única vez como fondo, con el estampado del
 * papel de bandeja encima.
 */
export function Footer () {
  const { ubicacion } = data
  const { t } = useI18n()
  const year = new Date().getFullYear()

  return (
    <footer>
      <div className='relative isolate overflow-clip bg-brand text-cream'>
        <TornEdge />
        {/*
          Papel de bandeja: el estampado "Casa Güell" del papel sobre el que se sirven los platos, aquí en claro
          sobre el azul. Se desvanece hacia el tique para no competir con él y se desliza despacio con el scroll.
        */}
        <div
          aria-hidden='true'
          data-print-drift
          className='paper-print-on-brand absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_92%)] md:[mask-image:linear-gradient(to_right,black_20%,transparent_78%)]'
        />

        <div className='mx-auto grid max-w-6xl gap-x-16 gap-y-12 px-6 pb-14 pt-20 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-center md:pb-20 md:pt-28'>
          {/* La última llamada a reservar de la página, y las secciones */}
          <div>
            <h2 data-split className='max-w-[10ch] font-display text-[clamp(3rem,7.4vw,5.75rem)] leading-[1.02] tracking-[-0.04em]'>
              <Words text={t.closing.title} mask />
            </h2>
            <div className='mt-8 flex flex-wrap items-center gap-x-6 gap-y-3'>
              <span data-magnetic className='inline-block'>
                <button
                  type='button'
                  onClick={openReserve}
                  className='press inline-flex min-h-12 items-center gap-3 rounded-full bg-cream px-6 font-body text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream motion-reduce:transition-none'
                >
                  {t.reserve.title}
                  <ArrowUpRight aria-hidden='true' size={17} strokeWidth={1.8} />
                </button>
              </span>
              <p className='text-sm text-cream/85'>
                {t.closing.phoneLabel}{' '}
                <a href={PHONE_HREF} className='font-mono2 text-cream underline decoration-cream/50 underline-offset-4 transition-colors hover:decoration-cream motion-reduce:transition-none'>
                  {PHONE}
                </a>
              </p>
            </div>
            <nav aria-label={t.nav.label} className='mt-10 border-t border-cream/25 pt-2'>
              <ul className='flex flex-wrap gap-x-6 text-sm font-medium'>
                {NAV_IDS.map((id) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className='inline-flex min-h-11 items-center underline decoration-cream/35 underline-offset-8 transition-colors hover:decoration-cream motion-reduce:transition-none'
                    >
                      {t.nav[id]}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* La cuenta: el tique con los datos prácticos */}
          <div className='receipt mx-auto w-full max-w-sm bg-surface px-6 pb-10 pt-7 font-mono2 text-xs leading-snug text-ink md:mr-0 md:rotate-2'>
            <div className='flex flex-col items-center gap-2 border-b border-dashed border-ink/30 pb-5 text-center'>
              <Logo className='text-2xl' />
              <p className='text-[11px] uppercase tracking-[0.18em] text-ink/70'>{t.hero.kicker}</p>
              <address className='not-italic text-ink/80'>{ubicacion.direccion}</address>
            </div>

            <dl className='border-b border-dashed border-ink/30 py-3'>
              {(Object.entries(ubicacion.horario) as Array<[DayKey, string | null]>).map(([day, hours]) => (
                <ReceiptRow key={day} label={t.ubicacio.days[day]}>
                  {hours != null ? plainHours(hours) : t.ubicacio.closed}
                </ReceiptRow>
              ))}
            </dl>

            <dl className='py-3'>
              <ReceiptRow label={t.reserve.phone}>
                <a href={PHONE_HREF} className={RECEIPT_LINK}>{PHONE}</a>
              </ReceiptRow>
              {SOCIAL_LINKS.map(({ name, handle, href }) => (
                <ReceiptRow key={name} label={name}>
                  <a href={href} target='_blank' rel='noopener noreferrer' className={RECEIPT_LINK}>{handle}</a>
                </ReceiptRow>
              ))}
            </dl>

            <a
              href='#ubicacio'
              className='mt-2 flex min-h-11 items-center justify-center border border-ink/60 text-[11px] uppercase tracking-[0.18em] transition-colors hover:border-brand hover:text-brand motion-reduce:transition-none'
            >
              {t.hero.ctaOnSom}
            </a>
          </div>
        </div>

        <div className='mx-auto flex max-w-6xl flex-col-reverse items-center gap-2 border-t border-cream/25 px-6 py-3 md:flex-row md:justify-between'>
          <p className='text-center font-mono2 text-[11px] uppercase tracking-widest text-cream/85'>
            © {year} Casa Güell · {t.footer.rights}
          </p>
          <BackToTop inverted />
        </div>

      </div>
    </footer>
  )
}
