import { useEffect, useMemo, useRef } from 'react'
import {
  Map,
  MapGeoJSON,
  MapControls,
  MapMarker,
  MarkerContent
} from '@/components/ui/map'
import type { FeatureCollection } from 'geojson'
import { useTheme } from '@/hooks/theme'
import { useI18n } from '@/i18n'
import { COORDS } from '@/lib/place'
import { RestaurantPin } from './RestaurantPin'

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

/** Mapa de la ubicación. Ocupa todo el ancho de su contenedor; la altura la pone quien lo usa. */
export function RestaurantMap () {
  const { resolved } = useTheme()
  // Mismo azul de marca que el resto de la web en cada tema (--cg-brand): claro #1D4ED8, oscuro #5B9BE0
  const brand = resolved === 'dark' ? '#5B9BE0' : '#1D4ED8'
  const { t } = useI18n()
  const wrapRef = useRef<HTMLDivElement>(null)

  // Avisos de MapLibre cuando el gesto no mueve el mapa, en el idioma de la página
  const locale = useMemo(() => ({
    'CooperativeGesturesHandler.WindowsHelpText': t.ubicacio.zoomHint,
    'CooperativeGesturesHandler.MacHelpText': t.ubicacio.zoomHint.replace('Ctrl', '⌘'),
    'CooperativeGesturesHandler.MobileHelpText': t.ubicacio.panHint
  }), [t.ubicacio.zoomHint, t.ubicacio.panHint])

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
    <div ref={wrapRef} className='relative h-full w-full overflow-hidden'>
      {/*
        cooperativeGestures: el mapa va de lado a lado de la página, así que la rueda y el dedo siguen
        desplazando la página; para mover el mapa hace falta Ctrl + rueda o dos dedos.
      */}
      <Map
        center={[COORDS.longitude, COORDS.latitude]}
        zoom={16.6}
        className='h-full w-full'
        theme={resolved}
        cooperativeGestures
        locale={locale}
      >
        <MapGeoJSON
          data={CASA_GUELL_GEOJSON}
          fillPaint={{ 'fill-color': brand, 'fill-opacity': 0.16 }}
          linePaint={{
            'line-color': brand,
            'line-width': 2.4,
            'line-opacity': 1
          }}
        />

        <MapControls position='bottom-right' showZoom showFullscreen />

        <MapMarker
          longitude={COORDS.longitude}
          latitude={COORDS.latitude}
          anchor='bottom'
        >
          <MarkerContent>
            <RestaurantPin />
          </MarkerContent>
        </MapMarker>
      </Map>
    </div>
  )
}
