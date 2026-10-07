import { useI18n } from '@/i18n'
import type { NavLink } from './useNavLinks'

/** Secciones en la barra, centradas. Solo en escritorio; por debajo viven en el panel de menú. */
export function DesktopLinks ({ links }: { links: NavLink[] }) {
  const { t } = useI18n()

  return (
    <nav aria-label={t.nav.label} className='flex items-center justify-center gap-1 max-lg:hidden'>
      {links.map(({ id, label, current }) => (
        <a
          key={id}
          href={`#${id}`}
          aria-current={current ? 'location' : undefined}
          className={`press inline-flex min-h-11 items-center justify-center rounded-full px-4 font-body text-xs font-medium transition-colors duration-200 focus-visible:outline-offset-2 ${
            current ? 'bg-ink/6 text-ink' : 'text-ink/60 hover:bg-ink/5 hover:text-ink'
          }`}
        >
          {label}
        </a>
      ))}
    </nav>
  )
}
