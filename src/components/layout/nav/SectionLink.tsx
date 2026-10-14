import type { ComponentProps } from 'react'
import { Link, useLocation } from 'react-router'
import { useI18n } from '@/i18n'

/**
 * Enlace a una sección de la portada (carta, ubicación…). En la portada es un ancla y el navegador
 * desplaza hasta ella. Desde cualquier otra página (la información legal, una ruta que no existe) vuelve
 * a la portada sin recargar, con la transición de cambio de página.
 */
export function SectionLink ({ section, ...rest }: { section: string } & Omit<ComponentProps<'a'>, 'href'>) {
  const { locale } = useI18n()
  const { pathname } = useLocation()
  const atHome = pathname.replace(/\/$/, '') === `/${locale}`

  if (atHome) return <a href={`#${section}`} {...rest} />
  return <Link to={`/${locale}#${section}`} viewTransition {...rest} />
}
