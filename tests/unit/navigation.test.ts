import { createElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { scrollOnArrival } from '@/app/scrollPolicy'
import { SectionLink } from '@/components/layout/nav/SectionLink'
import { I18nProvider } from '@/i18n'

describe('dónde queda el scroll al cambiar de dirección', () => {
  it('en otra página se llega ya colocado, de un salto', () => {
    expect(scrollOnArrival({ locale: 'es', page: '' }, { locale: 'es', page: '/legal' })).toBe('jump')
    expect(scrollOnArrival({ locale: 'es', page: '/legal' }, { locale: 'es', page: '' })).toBe('jump')
    expect(scrollOnArrival({ locale: 'es', page: null }, { locale: 'es', page: '' })).toBe('jump')
  })

  it('al cambiar de idioma la página se queda donde estaba', () => {
    expect(scrollOnArrival({ locale: 'es', page: '' }, { locale: 'ca', page: '' })).toBe('keep')
    expect(scrollOnArrival({ locale: 'ca', page: '/legal' }, { locale: 'en', page: '/legal' })).toBe('keep')
  })

  it('dentro de la misma página se va con el desplazamiento suave de la web', () => {
    expect(scrollOnArrival({ locale: 'es', page: '' }, { locale: 'es', page: '' })).toBe('glide')
  })

  it('en la primera carga, también', () => {
    expect(scrollOnArrival(null, { locale: 'es', page: '' })).toBe('glide')
  })
})

describe('enlaces a las secciones de la portada', () => {
  const linkAt = (path: string, children: ReactNode = 'Carta'): string => renderToStaticMarkup(
    createElement(MemoryRouter, { initialEntries: [path] },
      createElement(I18nProvider, { locale: 'es', children: createElement(SectionLink, { section: 'carta', className: 'enlace' }, children) }))
  )

  it('en la portada son un ancla: el navegador desplaza hasta la sección', () => {
    expect(linkAt('/es')).toBe('<a href="#carta" class="enlace">Carta</a>')
    expect(linkAt('/es/')).toBe('<a href="#carta" class="enlace">Carta</a>')
  })

  it('desde otra página vuelven a la portada, a esa sección', () => {
    expect(linkAt('/es/legal')).toContain('href="/es#carta"')
    expect(linkAt('/es/no-existe')).toContain('href="/es#carta"')
  })
})
