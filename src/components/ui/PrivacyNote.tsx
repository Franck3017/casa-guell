import type { ReactNode } from 'react'
import { legalHref } from '@/components/Seo/pageMeta'
import { useI18n } from '@/i18n'

/**
 * Lo que un formulario dice de los datos que pide, allí donde los pide: para qué se usan (el texto que
 * recibe) y el enlace a la política de privacidad completa. El enlace se abre en otra pestaña, y se avisa,
 * para que nadie pierda lo que ya ha escrito.
 */
export function PrivacyNote ({ children, className }: { children: ReactNode, className?: string }) {
  const { t, locale } = useI18n()
  return (
    <p className={className}>
      {children}{' '}
      <a href={legalHref(locale, 'privacidad')} target='_blank' rel='noopener' className='font-medium text-ink underline underline-offset-4 hover:text-brand'>
        {t.legal.privacyLink}<span className='sr-only'> {t.legal.newTab}</span>
      </a>
    </p>
  )
}
