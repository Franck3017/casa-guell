import { lazy, Suspense } from 'react'
import { Skeleton } from 'boneyard-js/react'
import { Reveal, SectionTitle } from '@/components/ui'
import { AllergenLegend } from '@/lib/allergens'
import { useI18n } from '@/i18n'

const MenuBrowser = lazy(async () =>
  await import('./MenuBrowser').then((m) => ({ default: m.MenuBrowser }))
)

/** Sección de la carta: título, navegador de la carta (carga diferida) y leyenda de alérgenos. */
export function MenuSection () {
  const { t } = useI18n()

  return (
    <section id='carta' className='mx-auto max-w-6xl px-6 py-20 md:py-24'>
      {/* Filete doble de carta impresa */}
      <div aria-hidden='true' data-draw className='mb-10 h-1.5 border-y border-ink/60' />
      <SectionTitle title={t.carta.title} />

      <Reveal>
        <p className='mt-4 max-w-prose text-ink/70'>{t.carta.subtitle}</p>
      </Reveal>

      {/*
        El navegador no va dentro de <Reveal>: es alto y cambia de altura al cambiar de sección, y un
        bloque que aparece con fundido se quedaría invisible si su umbral no llegara a cumplirse.
      */}
      <div className='mt-9'>
        <Suspense
          fallback={
            <Skeleton name='menu-browser' loading>
              <div aria-hidden='true' />
            </Skeleton>
          }
        >
          <MenuBrowser />
        </Suspense>
      </div>

      <Reveal className='mt-4'>
        <AllergenLegend />
      </Reveal>
    </section>
  )
}
