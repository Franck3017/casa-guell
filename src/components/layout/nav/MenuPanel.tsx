import { useRef } from 'react'
import { LanguageSwitcher } from '@/components/ui'
import { useMenuMotion } from '@/hooks/useMenuMotion'
import { useI18n } from '@/i18n'
import { ThemeToggle } from '../ThemeToggle'
import type { NavLink } from './useNavLinks'

interface MenuPanelProps {
  id: string
  open: boolean
  links: NavLink[]
  onNavigate: () => void
}

/**
 * Panel de menú a pantalla completa (solo por debajo de escritorio): secciones, idioma y tema.
 * Va detrás del contenido de la barra pero dentro de la cabecera, así que la marca, reservar y el botón
 * de cerrar siguen visibles y en su sitio. Siempre está montado (useMenuMotion anima sus nodos por
 * atributos data-menu-*); cerrado es invisible e inerte.
 */
export function MenuPanel ({ id, open, links, onNavigate }: MenuPanelProps) {
  const { t } = useI18n()
  const panelRef = useRef<HTMLDivElement>(null)
  useMenuMotion(panelRef, open)

  return (
    <div
      ref={panelRef}
      id={id}
      inert={!open}
      className='invisible fixed inset-0 -z-10 overflow-clip lg:hidden'
    >
      {/* La hoja de papel que baja, con el canto rasgado por delante */}
      <div data-menu-sheet className='absolute inset-0 bg-cream'>
        <div aria-hidden='true' className='torn-edge top-full!' />
      </div>

      <div className='relative flex h-full flex-col overflow-y-auto overscroll-contain px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(3.5rem+env(safe-area-inset-top))] sm:px-6'>
        <nav aria-label={t.nav.label}>
          <span aria-hidden='true' data-menu-line className='block h-px bg-ink/10' />
          {links.map(({ id: section, label, current }) => (
            <div key={section}>
              <a
                href={`#${section}`}
                onClick={onNavigate}
                aria-current={current ? 'location' : undefined}
                className={`press flex min-h-16 items-center py-3 font-display text-[clamp(2rem,10vw,3rem)] leading-[1.1] tracking-[-0.035em] transition-colors ${
                  current ? 'text-brand' : 'text-ink'
                }`}
              >
                <span className='block overflow-y-clip'>
                  <span data-menu-word className='block'>{label}</span>
                </span>
              </a>
              <span aria-hidden='true' data-menu-line className='block h-px bg-ink/10' />
            </div>
          ))}
        </nav>

        <div data-menu-tools className='mt-8 flex items-center justify-between gap-4'>
          <LanguageSwitcher inline />
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
