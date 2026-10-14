import { useLocation } from 'react-router'
import { useI18n } from '@/i18n'

/**
 * Adónde lleva el enlace a una sección de la portada (carta, ubicación…). En la portada basta el ancla;
 * desde cualquier otra página (la información legal, una ruta que no existe) hay que volver a ella.
 */
export function useSectionHref (): (id: string) => string {
  const { locale } = useI18n()
  const { pathname } = useLocation()
  const atHome = pathname.replace(/\/$/, '') === `/${locale}`
  return (id) => atHome ? `#${id}` : `/${locale}#${id}`
}
