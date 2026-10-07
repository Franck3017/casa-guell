import { SOCIAL_LINKS } from '@/lib/social'

/** Enlaces a las cuentas oficiales; el nombre accesible incluye el usuario ("Instagram @casaguell_bcn"). */
export function SocialLinks ({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-x-5 ${className}`}>
      {SOCIAL_LINKS.map(({ name, handle, href }) => (
        <li key={name}>
          <a
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={`${name} ${handle}`}
            className='inline-flex min-h-11 items-center underline decoration-ink/25 underline-offset-4 transition-colors hover:text-brand hover:decoration-brand motion-reduce:transition-none'
          >
            {name}
          </a>
        </li>
      ))}
    </ul>
  )
}
