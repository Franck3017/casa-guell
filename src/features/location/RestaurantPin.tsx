import { Logo } from '@/components/ui'

/**
 * Marcador: el rótulo de la casa en una etiqueta de papel, clavada en el punto exacto.
 * Va en su propio archivo, fuera del mapa, porque también lo usa la réplica con la que se mide el
 * esqueleto de carga (LocationSection), y esa no puede arrastrar consigo todo MapLibre.
 */
export function RestaurantPin () {
  return (
    <div className='flex flex-col items-center'>
      <div className='elev border border-ink/10 bg-surface px-3.5 py-2.5'>
        <Logo className='text-[22px]' />
      </div>
      <div className='h-5 w-px bg-ink' />
      <div className='size-2.5 rounded-full bg-brand ring-2 ring-surface' />
    </div>
  )
}
