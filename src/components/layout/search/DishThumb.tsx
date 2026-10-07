import { useEffect, useRef, useState } from 'react'
import { dishThumb, type DishMedia } from '@/lib/dishMedia'

/** Miniatura 56 px: foto con fundido de entrada, o inicial del plato si no hay foto. */
export function DishThumb ({ media, name }: { media?: DishMedia, name: string }) {
  const [state, setState] = useState<'loading' | 'ok' | 'failed'>('loading')
  const ref = useRef<HTMLImageElement>(null)

  // Si la imagen ya estaba en caché, `load` puede haberse disparado antes de montar el handler.
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setState('ok')
  }, [])

  return (
    <div className='relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-linen ring-1 ring-ink/5'>
      {media != null && state !== 'failed'
        ? (
          <img
            ref={ref}
            src={dishThumb(media.src)}
            alt=''
            width={56}
            height={56}
            loading='lazy'
            decoding='async'
            onLoad={() => setState('ok')}
            onError={() => setState('failed')}
            style={media.position ? { objectPosition: media.position } : undefined}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              state === 'ok' ? 'opacity-100' : 'opacity-0'
            }`}
          />
          )
        : (
          <span
            aria-hidden='true'
            className='flex h-full w-full items-center justify-center font-display text-lg text-ink/35'
          >
            {name.charAt(0)}
          </span>
          )}
    </div>
  )
}
