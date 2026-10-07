import { useEffect, useRef, useState } from 'react'
import {
  Map,
  MapGeoJSON,
  MapControls,
  MapMarker,
  MarkerContent
} from '@/components/ui/map'
import { data } from '@/data'
import type { FeatureCollection } from 'geojson'
import { useTheme } from '@/hooks/theme'
import { useI18n } from '@/i18n'
import { plainHours } from '@/lib/menuFormat'
import { SocialLinks } from '@/components/ui'

const CASA_GUELL_GEOJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Zona Casa Güell' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [2.1983702, 41.4045051],
          [2.1987606, 41.4042391],
          [2.1989648, 41.4044593],
          [2.1986205, 41.4047264],
          [2.1983702, 41.4045051]
        ]]
      }
    }
  ]
}

const RESTAURANT_LOCATION = {
  longitude: 2.1988202,
  latitude: 41.404493
} as const

function RestaurantPin () {
  return (
    <div className='relative flex flex-col items-center'>
      <div className='h-8 w-8 rounded-full bg-brand shadow-lg ring-4 ring-cream' />
      <div className='absolute -bottom-1 h-2 w-6 rounded-full bg-ink/20 blur-sm' />
    </div>
  )
}

type Tab = 'info' | 'barri'
type DayKey = 'md' | 'dg' | 'll'

function InfoOverlay ({ activeTab, setActiveTab }: { activeTab: Tab, setActiveTab: (t: Tab) => void }) {
  const [expanded, setExpanded] = useState(true)
  const { ubicacion } = data
  const { t } = useI18n()

  return (
    <div className='absolute inset-x-4 bottom-4 md:inset-x-auto md:bottom-auto md:left-8 md:top-8 md:w-[340px]'>
      <div className='border border-ink/10 bg-cream shadow-[0_8px_30px_rgb(17_18_21/0.12)]'>
        <div className='h-0.5 w-full bg-brand' />

        <div className='p-6'>
          <div className='flex items-start justify-between gap-4'>
            <div className='flex-1'>
              <p className='font-mono2 text-[11px] uppercase tracking-[0.25em] text-ink/45'>
                {activeTab === 'info' ? t.ubicacio.overlay.ubicacio : t.ubicacio.overlay.barri}
              </p>
              <h3 className='mt-1 font-display text-2xl leading-tight text-ink'>
                {activeTab === 'info' ? 'Casa Güell' : t.ubicacio.overlay.barriTitle}
              </h3>
            </div>
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-label={expanded ? t.ubicacio.overlay.hide : t.ubicacio.overlay.show}
              className='press -mr-3 -mt-3 flex size-11 shrink-0 items-center justify-center font-mono2 text-lg leading-none text-ink/60 hover:text-ink md:hidden'
            >
              {expanded ? '−' : '+'}
            </button>
          </div>

          <div className={expanded ? 'block' : 'hidden md:block'}>
            {activeTab === 'info'
              ? (
                <>
                  <div className='mt-4 border-t border-ink/10 pt-4'>
                    <p className='text-sm text-ink/60'>{ubicacion.direccion}</p>
                    <p className='mt-2 flex items-center gap-2 text-xs text-ink/55'>
                      <span className='inline-block h-2.5 w-2.5 border border-brand/60 bg-brand/10' />
                      {t.ubicacio.overlay.zone}
                    </p>
                  </div>

                  <div className='mt-4 border-t border-ink/10 pt-4'>
                    <ul className='space-y-1.5 text-sm'>
                      {(Object.entries(ubicacion.horario) as Array<[DayKey, string | null]>).map(([day, hours]) => (
                        <li key={day} className='flex justify-between gap-6'>
                          <span className='text-ink/70'>{t.ubicacio.days[day]}</span>
                          <span className='font-mono2 text-xs'>{hours != null ? plainHours(hours) : t.ubicacio.closed}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className='mt-4 border-t border-ink/10 pt-4'>
                    <a
                      href='tel:+34936434384'
                      className='inline-flex min-h-11 items-center font-display text-xl text-ink hover:text-brand'
                    >
                      {ubicacion.contacto.telefono}
                    </a>
                    <SocialLinks className='mt-1 text-sm text-ink/70' />
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${RESTAURANT_LOCATION.latitude},${RESTAURANT_LOCATION.longitude}`}
                    target='_blank'
                    rel='noreferrer'
                    className='mt-3 inline-flex min-h-11 items-center font-mono2 text-[11px] uppercase tracking-[0.2em] text-brand underline underline-offset-4 hover:text-ink'
                  >
                    {t.ubicacio.maps}
                  </a>
                </>
                )
              : (
                <>
                  <div className='mt-4 border-t border-ink/10 pt-4'>
                    <h4 className='font-display text-base leading-tight text-ink'>
                      {t.ubicacio.overlay.barriTitle}
                    </h4>
                    <p className='mt-2 text-xs leading-relaxed text-ink/60'>
                      {t.ubicacio.overlay.barriDesc}
                    </p>
                  </div>

                  <div className='mt-4 border-t border-ink/10 pt-4'>
                    <p className='font-mono2 text-[11px] uppercase tracking-[0.2em] text-ink/45'>
                      {t.ubicacio.overlay.comArribar}
                    </p>
                    <ul className='mt-2 space-y-2 text-sm'>
                      <li className='flex items-center gap-2 text-ink/70'>
                        <span className='inline-block h-2 w-2 rounded-full bg-brand' />
                        {t.ubicacio.overlay.metro}
                      </li>
                      <li className='flex items-center gap-2 text-ink/70'>
                        <span className='inline-block h-2 w-2 rounded-full bg-brand' />
                        {t.ubicacio.overlay.parking}
                      </li>
                      <li className='flex items-center gap-2 text-ink/70'>
                        <span className='inline-block h-2 w-2 rounded-full bg-brand' />
                        {t.ubicacio.overlay.tram}
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setActiveTab('info')}
                    className='mt-5 inline-block font-mono2 text-[11px] uppercase tracking-[0.2em] text-brand underline underline-offset-4 hover:text-ink'
                  >
                    {t.ubicacio.overlay.back}
                  </button>
                </>
                )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function RestaurantMap () {
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const { resolved } = useTheme()
  // Mismo azul de marca que el resto de la web en cada tema (--cg-brand): claro #1D4ED8, oscuro #5B9BE0
  const brand = resolved === 'dark' ? '#5B9BE0' : '#1D4ED8'
  const { t } = useI18n()
  const wrapRef = useRef<HTMLDivElement>(null)

  // MapLibre pone aria-label="Map" (en inglés) al lienzo al crearlo: se sustituye por una descripción en el idioma de la página
  useEffect(() => {
    const wrap = wrapRef.current
    if (wrap == null) return
    const label = () => wrap.querySelector('canvas.maplibregl-canvas')?.setAttribute('aria-label', t.ubicacio.mapLabel)
    label()
    const observer = new MutationObserver(label)
    observer.observe(wrap, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [t.ubicacio.mapLabel])

  return (
    <div ref={wrapRef} className='relative h-[520px] w-full overflow-hidden border border-ink/10 md:h-[620px]'>
      <Map
        center={[RESTAURANT_LOCATION.longitude, RESTAURANT_LOCATION.latitude]}
        zoom={18}
        className='h-full w-full'
        theme={resolved}
      >
        <MapGeoJSON
          data={CASA_GUELL_GEOJSON}
          interactive
          fillPaint={{ 'fill-color': brand, 'fill-opacity': 0.16 }}
          linePaint={{
            'line-color': brand,
            'line-width': 2.4,
            'line-opacity': 1
          }}
          fillHoverPaint={{ 'fill-opacity': 0.25 }}
          onClick={() => setActiveTab('barri')}
        />

        <MapControls position='bottom-right' showZoom showFullscreen />

        <MapMarker
          longitude={RESTAURANT_LOCATION.longitude}
          latitude={RESTAURANT_LOCATION.latitude}
        >
          <MarkerContent>
            <RestaurantPin />
          </MarkerContent>
        </MapMarker>
      </Map>

      <InfoOverlay activeTab={activeTab} setActiveTab={setActiveTab} />

      <p className='pointer-events-none absolute right-3 top-3 font-mono2 text-[11px] uppercase tracking-widest text-ink/50'>
        {t.ubicacio.mapCaption}
      </p>
    </div>
  )
}
