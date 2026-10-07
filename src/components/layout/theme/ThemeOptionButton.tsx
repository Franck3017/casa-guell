import type { KeyboardEvent, MouseEvent, Ref } from 'react'
import type { ThemeOption } from './useThemeOptions'

interface ThemeOptionButtonProps {
  option: ThemeOption
  buttonRef: Ref<HTMLButtonElement>
  onSelect: (e: MouseEvent<HTMLButtonElement>) => void
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void
}

/**
 * Una opción de tema. La activa se ve siempre; las demás están plegadas y aparecen, escalonadas,
 * cuando el contenedor (`group`) lleva `data-expanded`.
 */
export function ThemeOptionButton ({ option, buttonRef, onSelect, onKeyDown }: ThemeOptionButtonProps) {
  const { label, Icon, active, position } = option

  return (
    <button
      ref={buttonRef}
      role='radio'
      aria-checked={active}
      aria-label={label}
      title={label}
      tabIndex={active ? 0 : -1}
      onKeyDown={onKeyDown}
      onClick={onSelect}
      style={{ order: position, transitionDelay: active ? '0ms' : `${position * 45}ms` }}
      className={`flex h-(--s) w-(--s) items-center justify-center rounded-full transition-[opacity,transform,max-height,background-color,color] duration-200 ease-(--ease-out) motion-reduce:transition-none ${
        active
          ? 'bg-ink text-cream'
          : 'max-h-0 scale-90 overflow-hidden opacity-0 text-ink/65 hover:bg-ink/10 hover:text-ink ' +
            'group-data-[expanded]:max-h-(--s) group-data-[expanded]:scale-100 group-data-[expanded]:opacity-100'
      }`}
    >
      <Icon />
    </button>
  )
}
