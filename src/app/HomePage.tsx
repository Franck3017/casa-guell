import { SectionRail } from '@/components/layout/SectionRail'
import { HeroSection } from '@/features/hero'
import { PhilosophySection } from '@/features/philosophy'
import { BrandFilm } from '@/features/film/BrandFilm'
import { MenuSection } from '@/features/menu'
import { MarketSection } from '@/features/market'
import { LocationSection } from '@/features/location'
import { useI18n } from '@/i18n'
import { useScrollChoreography } from '@/lib/useScrollChoreography'

export function HomePage () {
  const { locale } = useI18n()
  // Al cambiar de idioma cambian las palabras: la coreografía se vuelve a montar sobre el texto nuevo.
  useScrollChoreography(locale)

  return (
    <>
      <SectionRail />
      <HeroSection />
      <PhilosophySection />
      <BrandFilm />
      <MenuSection />
      <MarketSection />
      <LocationSection />
    </>
  )
}
