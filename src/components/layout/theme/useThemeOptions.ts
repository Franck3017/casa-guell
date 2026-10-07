import type { ComponentType } from 'react'
import { useTheme, type ThemeChoice } from '@/hooks/theme'
import { useI18n } from '@/i18n'
import { AutoIcon, MoonIcon, SunIcon } from '../Icons'

export interface ThemeOption {
  value: ThemeChoice
  label: string
  Icon: ComponentType
  /** Es el tema elegido ahora. */
  active: boolean
  /** Posición en pantalla: la activa va primero y las demás se despliegan debajo. */
  position: number
}

/**
 * Las tres opciones de tema en orden ESTABLE (claro, auto, oscuro), que es el que siguen el foco y los
 * lectores de pantalla. El orden visual va aparte, en `position`, y se aplica con CSS `order`.
 */
export function useThemeOptions (): ThemeOption[] {
  const { choice, resolved } = useTheme()
  const { t } = useI18n()

  const base: Array<Pick<ThemeOption, 'value' | 'label' | 'Icon'>> = [
    { value: 'light', label: t.theme.light, Icon: SunIcon },
    {
      value: 'system',
      label: `${t.theme.auto} · ${resolved === 'dark' ? t.theme.dark : t.theme.light}`,
      Icon: AutoIcon
    },
    { value: 'dark', label: t.theme.dark, Icon: MoonIcon }
  ]

  let next = 1
  return base.map((option) => {
    const active = option.value === choice
    return { ...option, active, position: active ? 0 : next++ }
  })
}
