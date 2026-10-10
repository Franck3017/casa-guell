import { lazy, Suspense, useRef } from 'react'
import { Skeleton } from 'boneyard-js/react'
import { ArrowUpRight, SquareParking, TrainFront, TramFront } from 'lucide-react'
import { ErrorBoundary, LoadError, Reveal, SectionTitle, TornEdge } from '@/components/ui'
import { data } from '@/data'
import { useNearViewport } from '@/hooks/useNearViewport'
import { useI18n } from '@/i18n'
import { MAPS_HREF } from '@/lib/place'
import { RestaurantPin } from './RestaurantPin'

const RestaurantMap = lazy(async () =>
  await import('./RestaurantMap').then((m) => ({ default: m.RestaurantMap }))
)

/** Alto de la franja del mapa. Lo comparte la réplica con la que se mide el esqueleto de carga. */
const MAP_HEIGHT = 'h-[460px] md:h-[600px]'

/** Color de los huesos: tinta al 12 %, el tono de los filetes, que sirve en los dos temas. */
const BONE_COLOR = 'color-mix(in srgb, var(--cg-ink) 12%, transparent)'

/**
 * Réplica estática de lo que el mapa pone sobre el plano: el rótulo clavado en el centro y, abajo a la
 * derecha, los botones (con el tamaño que les da MapControls). En la web no se ve nunca: la pinta boneyard
 * cuando captura, en desarrollo, para medir dónde va cada pieza.
 */
function MapFixture () {
  return (
    <div className={`relative ${MAP_HEIGHT}`}>
      <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full'>
        <RestaurantPin />
      </div>
      <div className='absolute bottom-10 right-2 flex flex-col gap-1.5'>
        <div className='h-[67px] w-[34px] rounded-md bg-ink' />
        <div className='size-[34px] rounded-md bg-ink' />
      </div>
    </div>
  )
}

/**
 * Lo que ocupa la franja hasta que llega el mapa: los huesos del rótulo y de los botones, cada uno donde
 * estará después. Los dibuja boneyard a partir de src/bones/restaurant-map.bones.json, que rellena su
 * captura (el plugin de Vite mientras corre `pnpm dev`, o `pnpm bones:build`).
 * Van quietos: están en la página desde el principio, fuera de pantalla, y una animación sin fin correría
 * durante toda la visita.
 */
function MapSkeleton () {
  return (
    <Skeleton
      name='restaurant-map'
      loading
      className='h-full'
      animate='solid'
      color={BONE_COLOR}
      darkColor={BONE_COLOR}
      fixture={import.meta.env.DEV ? <MapFixture /> : undefined}
    >
      {null}
    </Skeleton>
  )
}

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
      <div ref={mapRef} className={`relative mt-12 bg-linen/40 md:mt-16 ${MAP_HEIGHT}`}>
        {near
          ? (
            // Si el mapa no llega, la dirección y el enlace a Google Maps de arriba siguen sirviendo
            <ErrorBoundary fallback={<LoadError message={t.loadError.map} className='h-full' />}>
              <Suspense fallback={<MapSkeleton />}>
                <RestaurantMap />
              </Suspense>
            </ErrorBoundary>
            )
          : <MapSkeleton />}
        <TornEdge />
      </div>
    </section>
  )
}
