// features/hero/HeroSection.tsx
import { useRef } from 'react'
import { useDrawnEntrance } from '@/hooks/useDrawnEntrance'
import { HeroCollage } from './HeroCollage'
import { HeroCopy } from './HeroCopy'
import { Logo } from '@/components/ui'

/**
 * Hero de la portada. Aquí solo se compone: rótulo de fondo, columna de texto y collage.
 * La entrada dibujada vive en useDrawnEntrance, que anima por atributos data-* lo que pintan los hijos.
 */
export function HeroSection () {
  const sectionRef = useRef<HTMLElement>(null)
  useDrawnEntrance(sectionRef)

  return (
    <section id='top' ref={sectionRef} className='hero relative isolate overflow-clip bg-cream'>
      {/*
        Rótulo de fondo: el logotipo a todo el ancho, en un tono apenas más oscuro que el papel. El retrato
        y el texto lo pisan, y eso da profundidad a la composición sin añadir otra imagen. Decorativo.
      */}
      <div className='hero-drift-wordmark pointer-events-none absolute inset-x-0 top-[54%] -z-10 max-md:hidden'>
        <div data-hero-wordmark aria-hidden='true' className='flex justify-center text-ink/[0.06]'>
          <Logo tone='mono' className='text-[15.5vw]' />
        </div>
      </div>

      <div className='mx-auto grid max-w-[1440px] gap-14 px-6 pb-16 pt-24 md:min-h-svh md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] md:items-center md:gap-8 md:px-10 md:pb-14 md:pt-28 xl:gap-14 xl:px-12'>
        <HeroCopy />
        <HeroCollage />
      </div>
    </section>
  )
}
