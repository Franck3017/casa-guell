import { useActiveSection } from '@/hooks/useActiveSection'
import { useI18n } from '@/i18n'
import { NAV_IDS, type NavId } from '@/lib/constants'

export interface NavLink {
  id: NavId
  label: string
  /** Es la sección que se está leyendo ahora mismo. */
  current: boolean
}

/** Las secciones de la página, con su nombre en el idioma actual y cuál está en pantalla. */
export function useNavLinks (): NavLink[] {
  const { t } = useI18n()
  const active = useActiveSection(NAV_IDS)
  return NAV_IDS.map((id) => ({ id, label: t.nav[id], current: active === id }))
}
