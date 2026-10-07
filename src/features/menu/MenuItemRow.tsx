import type { PointerEvent } from 'react'
import { useI18n } from '@/i18n'
import { AllergenIcons } from '@/lib/allergens'
import { dishMedia, dishThumb, type DishMedia } from '@/lib/dishMedia'
import { displayName, formatPrice } from '@/lib/menuFormat'
import { isCopaPremium, type MenuItem } from '@/types/data'

export interface PreviewHandlers {
  onEnter: (media: DishMedia, e: PointerEvent) => void
  onMove: (e: PointerEvent) => void
  onLeave: () => void
}

interface MenuItemRowProps {
  item: MenuItem
  /** La sección tiene fotos: se reserva la columna de miniatura aunque esta referencia no tenga. */
  reserveThumb: boolean
  preview: PreviewHandlers
}

/**
 * Una referencia de la carta: nombre, guía de puntos y precio; debajo, nota y alérgenos.
 * Con fotos en la sección, la miniatura vive en una columna fija de 3rem: todos los nombres comparten
 * el mismo borde izquierdo, haya foto o no. Con ratón, pasar por encima enseña la foto en grande.
 */
export function MenuItemRow ({ item, reserveThumb, preview }: MenuItemRowProps) {
  const { t, locale } = useI18n()
  const media = dishMedia(item.nombre)
  const note = item.descripcion ?? item.ingredientes ?? null
  const premium = isCopaPremium(item)
  // Copas Premium tiene dos precios y los enseña en su propia línea; el resto, uno a la derecha del nombre.
  const price = premium ? null : item.precio != null ? formatPrice(item.precio, locale) : null

  return (
    <li
      className={`grid break-inside-avoid items-start gap-x-3 py-4 ${reserveThumb ? 'grid-cols-1 min-[360px]:grid-cols-[3rem_minmax(0,1fr)]' : 'grid-cols-1'}`}
      onPointerEnter={media != null ? (e) => { if (e.pointerType === 'mouse') preview.onEnter(media, e) } : undefined}
      onPointerMove={media != null ? (e) => { if (e.pointerType === 'mouse') preview.onMove(e) } : undefined}
      onPointerLeave={media != null ? preview.onLeave : undefined}
    >
      {reserveThumb && (
        <div className='row-span-3 hidden size-12 min-[360px]:block'>
          {media != null && (
            <img
              src={dishThumb(media.src)}
              alt={media.alt}
              title={media.title}
              width={48}
              height={48}
              loading='lazy'
              decoding='async'
              className='size-12 rounded-sm object-cover'
            />
          )}
        </div>
      )}

      <div className='flex items-baseline'>
        <span className='min-w-0 text-sm font-medium'>{displayName(item.nombre)}</span>
        {price != null && (
          <>
            <span className='leader min-w-4' aria-hidden='true' />
            <span className='shrink-0 whitespace-nowrap font-mono2 text-sm'>{price}</span>
          </>
        )}
      </div>

      {(premium || note != null) && (
        <div>
          {premium && (
            <p className='mt-1 font-mono2 text-xs text-ink/70'>
              {t.carta.shot} {formatPrice(item.precio_chupito, locale)} · {t.carta.glass} {formatPrice(item.precio_copa, locale)}
            </p>
          )}
          {note != null && <p className='mt-1 max-w-prose whitespace-pre-line text-sm text-ink/70'>{note}</p>}
        </div>
      )}

      <AllergenIcons value={item.alergenos_codigo ?? item.alergenos} />
    </li>
  )
}
