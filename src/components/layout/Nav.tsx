import { useCallback, useId, useState } from 'react'
import { LanguageSwitcher, Logo } from '@/components/ui'
import { useMenuDismiss } from '@/hooks/useMenuDismiss'
import { useI18n } from '@/i18n'
import { openReserve } from '@/lib/events'
import { DesktopLinks } from './nav/DesktopLinks'
import { MenuButton } from './nav/MenuButton'
import { MenuPanel } from './nav/MenuPanel'
import { useNavLinks } from './nav/useNavLinks'
import { SearchDishes } from './SearchDishes'
import { ThemeToggle } from './ThemeToggle'

/**
 * Cabecera: una sola barra en todos los tamaños, con reservar (la acción principal) siempre a la vista.
 * Escritorio: marca, secciones centradas y herramientas (buscar, idioma, tema) en una fila.
 * Móvil y tableta: marca, buscar, reservar y un botón de menú; las secciones, el idioma y el tema
 * son ocasionales y viven en un panel a pantalla completa.
 * Aquí solo está el estado del menú (abierto o no) y la composición; cada pieza vive en ./nav.
 */
export function Nav () {
  const { t } = useI18n()
  const links = useNavLinks()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const close = useCallback(() => setOpen(false), [])

  useMenuDismiss(open, close)

  return (
    <header className='fixed inset-x-0 top-0 z-40 border-b border-ink/10 bg-cream/95 pt-[env(safe-area-inset-top)] shadow-[0_1px_0_rgb(17_18_21/0.03)] transition-colors duration-300'>
      <div className='mx-auto grid max-w-7xl grid-cols-[auto_1fr] items-center px-4 sm:px-6 lg:h-[4.35rem] lg:grid-cols-[auto_1fr_auto] lg:gap-x-5 lg:px-8'>
        <a
          href='#top'
          onClick={close}
          aria-label={`Casa Güell · ${t.hero.kicker}`}
          className='group flex min-h-14 shrink-0 items-center whitespace-nowrap'
        >
          <Logo className='text-[min(1.375rem,5.6vw)] transition-opacity group-hover:opacity-80 motion-reduce:transition-none' />
        </a>

        <DesktopLinks links={links} />

        <div className='col-start-2 flex items-center justify-end gap-1 lg:col-start-3 lg:gap-2'>
          <SearchDishes />
          <div className='flex items-center gap-2 max-lg:hidden'>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <button
            type='button'
            onClick={() => { close(); openReserve() }}
            aria-label={t.reserve.title}
            className='press inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-ink px-3.5 font-body text-xs font-semibold text-cream transition-colors duration-200 hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none lg:ml-1'
          >
            <span className='min-[420px]:hidden'>{t.reserve.short}</span>
            <span className='max-[419px]:hidden'>{t.reserve.title}</span>
          </button>
          <MenuButton open={open} panelId={panelId} onToggle={() => setOpen((v) => !v)} />
        </div>
      </div>

      <MenuPanel id={panelId} open={open} links={links} onNavigate={close} />
    </header>
  )
}
