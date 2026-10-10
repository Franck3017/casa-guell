import { ErrorBoundary, LoadError, Reveal, SectionTitle } from '@/components/ui'
import { AllergenLegend } from '@/lib/allergens'
import { useI18n } from '@/i18n'
import { MenuBrowser } from './MenuBrowser'

/** Sección de la carta: título, navegador de la carta y leyenda de alérgenos. */
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
        Tampoco se carga aparte: la carta viene ya pintada en el HTML del build, y React solo la adopta sin
        volver a crearla si tiene su código desde el principio.
      */}
      <div className='mt-9'>
        <ErrorBoundary fallback={<LoadError message={t.loadError.menu} className='py-16' />}>
          <MenuBrowser />
        </ErrorBoundary>
      </div>

      <Reveal className='mt-4'>
        <AllergenLegend />
      </Reveal>
    </section>
  )
}
