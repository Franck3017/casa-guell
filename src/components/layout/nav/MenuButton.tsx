import { useI18n } from '@/i18n'

const BAR = 'absolute left-0 top-1/2 block h-[1.5px] w-full bg-current transition-[translate,rotate] duration-300 ease-(--ease-out) motion-reduce:transition-none'

interface MenuButtonProps {
  open: boolean
  /** id del panel que controla (aria-controls). */
  panelId: string
  onToggle: () => void
}

/** Botón que abre y cierra el panel de menú. Solo por debajo de escritorio. */
export function MenuButton ({ open, panelId, onToggle }: MenuButtonProps) {
  const { t } = useI18n()

  return (
    <button
      type='button'
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={panelId}
      aria-label={open ? t.nav.menuClose : t.nav.menuOpen}
      className='press inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors duration-200 hover:bg-ink/5 lg:hidden'
    >
      {/* Dos trazos que se cruzan al abrir: el icono se transforma, no se sustituye */}
      <span aria-hidden='true' className='relative block size-[18px]'>
        <span className={`${BAR} ${open ? 'rotate-45' : '-translate-y-[3.5px]'}`} />
        <span className={`${BAR} ${open ? '-rotate-45' : 'translate-y-[3.5px]'}`} />
      </span>
    </button>
  )
}
