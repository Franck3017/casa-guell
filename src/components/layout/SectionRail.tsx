import { useActiveSection } from '@/hooks/useActiveSection'
import { NAV_IDS } from '@/lib/constants'

const RAIL_IDS = ['top', ...NAV_IDS] as const

/**
 * Raíl lateral: una marca por sección, la actual más larga y en azul. Es solo un indicador de por
 * dónde va la lectura (la navegación real está en la cabecera), así que no recibe foco ni se anuncia.
 * Solo en escritorio: en pantallas estrechas no hay margen libre junto al contenido.
 */
export function SectionRail () {
  const active = useActiveSection(RAIL_IDS) ?? 'top'

  return (
    <div aria-hidden='true' className='pointer-events-none fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 xl:flex'>
      {RAIL_IDS.map((id) => (
        <span
          key={id}
          className={`block h-px origin-right transition-[width,background-color] duration-500 ease-(--ease-out) motion-reduce:transition-none ${
            active === id ? 'w-7 bg-brand' : 'w-3 bg-ink/30'
          }`}
        />
      ))}
    </div>
  )
}
