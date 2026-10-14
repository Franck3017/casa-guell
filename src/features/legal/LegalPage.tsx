import { useEffect } from 'react'
import { LABEL } from '@/components/ui/controls'
import { useI18n } from '@/i18n'
import { pageReady } from '@/lib/events'
import { INTL_LOCALE } from '@/lib/menuFormat'
import { contentFor, legalLang, type LegalDoc } from './content'
import { fill, type Filled } from './entity'

/** Cuándo se revisaron por última vez los textos. Se cambia a mano al tocarlos. */
const UPDATED = '2026-10-14'

const LINK = 'font-medium text-ink underline underline-offset-4 hover:text-brand'

/** Los párrafos de un apartado con los datos del titular puestos; los que dependen de un dato que no aplica, fuera. */
const filledBlocks = (doc: LegalDoc, lang: 'ca' | 'es') =>
  doc.blocks.map((block) => ({ ...block, filled: block.paragraphs.map((text) => fill(text, lang)).filter((parts): parts is Filled => parts != null) }))

/** Si a un párrafo le falta algún dato del titular. */
const hasPending = (parts: Filled): boolean => parts.some((part) => typeof part !== 'string')

/**
 * Información legal de la casa en una sola página: aviso legal, privacidad, cookies y lo que debe saber
 * quien viene a comer (alérgenos, precios, reclamaciones). Cada documento tiene su ancla, que es adonde
 * llevan los enlaces del pie y de los formularios.
 */
export function LegalPage () {
  const { t, locale } = useI18n()
  const content = contentFor(locale)
  const lang = legalLang(locale)
  // En inglés los documentos se leen en castellano: se marca su idioma para quien usa lector de pantalla
  const docLang = lang !== locale ? lang : undefined
  const updated = new Intl.DateTimeFormat(INTL_LOCALE[locale], { dateStyle: 'long' }).format(new Date(`${UPDATED}T12:00:00`))
  const { allergy, vat, rawFish, leftovers } = t.carta.notices

  // Esta página llega en un trozo aparte, a veces después de que la ruta haya colocado el scroll: avisa
  // al montarse para que se coloque otra vez, ya con el ancla (o el punto que se dejó) en su sitio.
  useEffect(pageReady, [])

  return (
    <article className='mx-auto max-w-6xl px-6 pb-16 pt-24 md:pt-28'>
      <h1 className='font-display text-4xl md:text-6xl'>{t.legal.title}</h1>
      <p className='mt-4 max-w-prose text-ink/70'>{t.legal.intro}</p>
      {content.fallbackNote != null && <p className='mt-4 max-w-prose text-sm text-ink'>{content.fallbackNote}</p>}

      <nav aria-label={t.legal.title} className='mt-9'>
        <ul lang={docLang} className='flex flex-wrap gap-x-6 text-sm'>
          {content.docs.map((doc) => (
            <li key={doc.id}>
              <a href={`#${doc.id}`} className={`inline-flex min-h-11 items-center ${LINK}`}>{doc.title}</a>
            </li>
          ))}
        </ul>
      </nav>

      {content.docs.map((doc) => {
        const blocks = filledBlocks(doc, lang)
        const incomplete = blocks.some((block) => block.filled.some(hasPending))
        return (
          <section key={doc.id} id={doc.id} lang={docLang} aria-labelledby={`${doc.id}-title`} className='mt-10 border-t border-ink/10 pt-6'>
            <h2 id={`${doc.id}-title`} className='font-display text-2xl text-ink'>{doc.title}</h2>
            {incomplete && <p className='mt-3 border-l-2 border-ink pl-3 text-sm text-ink'>{content.pendingNotice}</p>}

            {/* Los mismos avisos que pide la ley en la carta: alergias, IVA, pescado crudo y sobras */}
            {doc.id === 'consumidor' && (
              <div lang={docLang != null ? locale : undefined} className='mt-6'>
                <h3 className={LABEL}>{content.noticesTitle}</h3>
                <ul className='mt-1.5 max-w-prose space-y-1.5 text-sm text-ink/80'>
                  {[allergy, vat, rawFish, leftovers].map((notice) => <li key={notice}>{notice}</li>)}
                </ul>
              </div>
            )}

            {blocks.map((block) => (block.filled.length > 0 || block.links != null) && (
              <div key={block.heading} className='mt-6'>
                <h3 className={LABEL}>{block.heading}</h3>
                {block.filled.map((parts, index) => (
                  <p key={index} className='mt-1.5 max-w-prose text-sm text-ink/80'>
                    {parts.map((part, at) => typeof part === 'string'
                      ? part
                      : <span key={at} className='font-mono2 text-xs text-brand'>[{content.pendingLabel}]</span>)}
                  </p>
                ))}
                {block.links != null && (
                  <ul className='text-sm'>
                    {block.links.map(({ label, href }) => (
                      <li key={href}>
                        <a href={href} target='_blank' rel='noreferrer' className={`inline-flex min-h-11 items-center ${LINK}`}>
                          {label}
                          {/* El aviso va en el idioma de la página, también cuando el documento se lee en otro */}
                          <span lang={docLang != null ? locale : undefined} className='sr-only'> {t.legal.newTab}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )
      })}

      <p className='mt-10 font-mono2 text-[11px] uppercase tracking-widest text-ink/70'>{content.updatedLabel}: {updated}</p>
    </article>
  )
}
