import { Link } from 'react-router'
import { useI18n } from '@/i18n'

export function NotFoundPage () {
  const { t } = useI18n()
  return (
    <section className='mx-auto flex min-h-svh max-w-5xl flex-col items-center justify-center px-6 text-center'>
      <p className='font-mono2 text-[11px] uppercase tracking-[0.35em] text-ink/45'>404</p>
      <h1 className='mt-4 font-display text-4xl md:text-6xl'>{t.hero.lema1} <em className='text-brand'>{t.hero.lema2}</em></h1>
      <Link to='./' className='mt-8 font-mono2 text-[11px] uppercase tracking-[0.2em] underline underline-offset-4 hover:text-brand'>
        {t.hero.ctaCarta}
      </Link>
    </section>
  )
}
