import { useRef, type KeyboardEvent, type MouseEvent } from 'react'
import { useTheme, type ThemeChoice } from '@/hooks/theme'
import { useExpandableRail } from '@/hooks/useExpandableRail'
import { useI18n } from '@/i18n'
import { ThemeOptionButton } from './theme/ThemeOptionButton'
import { useThemeOptions, type ThemeOption } from './theme/useThemeOptions'

const STEP: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }

/**
 * Selector de tema (claro, auto, oscuro). En reposo es un solo botón con el tema actual; al pasar el ratón,
 * enfocarlo o tocarlo se despliega hacia abajo con las otras dos opciones. Ocupa un hueco de tamaño fijo y
 * crece en absoluto, así que desplegarse no mueve lo que tiene alrededor.
 * Aquí solo se une todo: el estado de despliegue está en useExpandableRail, las opciones en useThemeOptions
 * y cada botón en ThemeOptionButton.
 */
export function ThemeToggle ({ className = '' }: { className?: string }) {
  const { setChoice } = useTheme()
  const { t } = useI18n()
  const options = useThemeOptions()
  const { expanded, setOpen, railProps } = useExpandableRail<HTMLDivElement>()
  const buttons = useRef<Partial<Record<ThemeChoice, HTMLButtonElement | null>>>({})

  // Flechas: pasan al tema siguiente o anterior y llevan el foco con él
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const step = STEP[e.key]
    if (!step) return
    e.preventDefault()
    const next = options[(index + step + options.length) % options.length]
    const el = buttons.current[next.value] ?? undefined
    setChoice(next.value, el)
    el?.focus()
  }

  const onSelect = (e: MouseEvent<HTMLButtonElement>, option: ThemeOption): void => {
    // Táctil: el primer toque en la opción activa despliega en vez de seleccionar
    if (option.active && !expanded && window.matchMedia('(hover: none)').matches) { setOpen(true); return }
    setChoice(option.value, e)
    setOpen(false)
  }

  return (
    <div className={`relative size-11 shrink-0 pointer-coarse:size-13 ${className}`}>
      <div
        {...railProps}
        role='radiogroup'
        aria-label={t.theme.label}
        title={t.theme.shortcut}
        data-expanded={expanded || undefined}
        className='group absolute right-0 top-0 z-30 flex flex-col items-center gap-0 rounded-full border border-ink/15 bg-surface/90 p-1 backdrop-blur-sm [--s:2.25rem] pointer-coarse:[--s:2.75rem] transition-[gap,box-shadow] duration-300 motion-reduce:transition-none data-[expanded]:elev data-[expanded]:gap-1'
      >
        {options.map((option, index) => (
          <ThemeOptionButton
            key={option.value}
            option={option}
            buttonRef={(el) => { buttons.current[option.value] = el }}
            onSelect={(e) => onSelect(e, option)}
            onKeyDown={(e) => onKeyDown(e, index)}
          />
        ))}
      </div>
    </div>
  )
}
