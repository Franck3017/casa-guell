import { lazy, Suspense, useRef } from 'react'
import { ArrowUpRight, SquareParking, TrainFront, TramFront } from 'lucide-react'
import { ErrorBoundary, LoadError, Reveal, SectionTitle, TornEdge } from '@/components/ui'
import { data } from '@/data'
import { useNearViewport } from '@/hooks/useNearViewport'
import { useI18n } from '@/i18n'
import { MAPS_HREF } from '@/lib/place'

const RestaurantMap = lazy(async () =>
  await import('./RestaurantMap').then((m) => ({ default: m.RestaurantMap }))
)

/**
 * Sección de ubicación: la dirección y cómo llegar, y debajo el mapa de lado a lado, como una tira de
 * papel que acaba donde empieza el pie. El horario y el teléfono no se repiten aquí: están en el tique
 * del pie, justo debajo.
 * El mapa (MapLibre) es con diferencia lo más pesado de la web, y está casi al final: no se descarga
 * hasta que la sección está cerca de la pantalla. Quien no baja hasta aquí no lo paga.
 */
export function LocationSection () {
  const { t } = useI18n()
  const mapRef = useRef<HTMLDivElement>(null)
  const near = useNearViewport(mapRef)

  const ways = [
    { Icon: TrainFront, text: t.ubicacio.overlay.metro },
    { Icon: TramFront, text: t.ubicacio.overlay.tram },
    { Icon: SquareParking, text: t.ubicacio.overlay.parking }
  ]

  return (
    <section id='ubicacio' className='pt-20 md:pt-28'>
      <div className='mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-12 md:items-end md:gap-x-10'>
        <div className='md:col-span-7'>
          <SectionTitle title={t.ubicacio.title} />
        </div>

        <Reveal className='md:col-span-5'>
          <address className='font-display text-2xl not-italic leading-[1.2] tracking-[-0.02em] text-ink'>
            {data.ubicacion.direccion}
          </address>
          <ul aria-label={t.ubicacio.overlay.comArribar} className='mt-5 space-y-2 text-sm text-ink/70'>
            {ways.map(({ Icon, text }) => (
              <li key={text} className='flex items-center gap-3'>
                <Icon aria-hidden='true' size={17} strokeWidth={1.6} className='shrink-0 text-brand' />
                {text}
              </li>
            ))}
          </ul>
          <a
            href={MAPS_HREF}
            target='_blank'
            rel='noreferrer'
            className='group mt-4 inline-flex min-h-12 items-center gap-2 font-body text-sm font-semibold text-ink underline decoration-brand underline-offset-8 transition-colors hover:text-brand motion-reduce:transition-none'
          >
            {t.ubicacio.maps}
            <ArrowUpRight aria-hidden='true' size={16} strokeWidth={1.7} className='transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none' />
          </a>
        </Reveal>
      </div>

      {/* Altura fija también antes de que llegue el mapa: al cargar no empuja lo que hay debajo */}
      <div ref={mapRef} className='relative mt-12 h-[460px] bg-linen/40 md:mt-16 md:h-[600px]'>
        {near && (
          // Si el mapa no llega, la dirección y el enlace a Google Maps de arriba siguen sirviendo
          <ErrorBoundary fallback={<LoadError message={t.loadError.map} className='h-full' />}>
            <Suspense fallback={null}>
              <RestaurantMap />
            </Suspense>
          </ErrorBoundary>
        )}
        <TornEdge />
      </div>
    </section>
  )
}
