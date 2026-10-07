import { lazy, Suspense, useRef } from 'react'
import { Skeleton } from 'boneyard-js/react'
import { Reveal, SectionTitle } from '@/components/ui'
import { useNearViewport } from '@/hooks/useNearViewport'
import { useI18n } from '@/i18n'

const RestaurantMap = lazy(async () =>
  await import('./RestaurantMap').then((m) => ({ default: m.RestaurantMap }))
)

/** Hueco del mapa mientras no está: el mismo esqueleto antes de pedirlo y mientras se descarga. */
function MapPlaceholder () {
  return (
    <Skeleton name='restaurant-map' loading>
      <div aria-hidden='true' />
    </Skeleton>
  )
}

/**
 * Sección de ubicación. El mapa (MapLibre) es con diferencia lo más pesado de la web, y está casi al final:
 * no se descarga hasta que la sección está cerca de la pantalla. Quien no baja hasta aquí no lo paga.
 */
export function LocationSection () {
  const { t } = useI18n()
  const mapRef = useRef<HTMLDivElement>(null)
  const near = useNearViewport(mapRef)

  return (
    <section id='ubicacio' className='mx-auto max-w-6xl px-6 py-20 md:py-24'>
      <SectionTitle title={t.ubicacio.title} />

      <Reveal className='mt-9'>
        {/* Misma altura que el mapa ya cargado (ver RestaurantMap): al llegar no empuja lo que hay debajo */}
        <div ref={mapRef} className='min-h-[520px] md:min-h-[620px]'>
          {near
            ? (
              <Suspense fallback={<MapPlaceholder />}>
                <Skeleton name='restaurant-map' loading={false}>
                  <RestaurantMap />
                </Skeleton>
              </Suspense>
              )
            : <MapPlaceholder />}
        </div>
      </Reveal>
    </section>
  )
}
