import { describe, expect, it } from 'vitest'
import { contentFor, LEGAL_DOC_IDS } from '@/features/legal/content'
import { ENTITY, fill, pendingFields, TOKENS } from '@/features/legal/entity'

const paragraphsOf = (locale: 'ca' | 'es' | 'en'): string[] =>
  contentFor(locale).docs.flatMap((doc) => doc.blocks.flatMap((block) => block.paragraphs))

describe('documentos legales', () => {
  it('cada idioma trae los cuatro, en el mismo orden', () => {
    for (const locale of ['ca', 'es', 'en'] as const) {
      expect(contentFor(locale).docs.map((doc) => doc.id)).toEqual([...LEGAL_DOC_IDS])
    }
  })

  it('el catalán tiene los mismos apartados que el castellano', () => {
    const shape = (locale: 'ca' | 'es'): number[][] => contentFor(locale).docs.map((doc) => doc.blocks.map((block) => block.paragraphs.length))

    expect(shape('ca')).toEqual(shape('es'))
  })

  it('en inglés se enseña el texto en castellano, y se dice', () => {
    expect(contentFor('en').docs).toBe(contentFor('es').docs)
    expect(contentFor('en').fallbackNote).toMatch(/Spanish/)
    expect(contentFor('es').fallbackNote).toBeUndefined()
  })

  it('ningún texto pide un dato del titular que no exista', () => {
    const used = [...paragraphsOf('es'), ...paragraphsOf('ca')].flatMap((text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]))

    expect([...new Set(used)].filter((token) => !(TOKENS as readonly string[]).includes(token))).toEqual([])
  })

  it('la política de privacidad nombra a todos los que reciben datos', () => {
    const privacy = contentFor('es').docs.find((doc) => doc.id === 'privacidad')
    const text = privacy?.blocks.flatMap((block) => block.paragraphs).join(' ') ?? ''

    for (const provider of ['Supabase', 'Resend', 'Formspree', 'Vercel', 'CARTO']) {
      expect(text, provider).toContain(provider)
    }
  })
})

describe('datos del titular', () => {
  const entity = { ...ENTITY, holder: 'Restaurante de Prueba, S.L.', nif: null, registry: undefined }

  it('pone lo que se sabe y marca lo que falta', () => {
    expect(fill('Titular: {holder}, NIF {nif}.', 'es', entity)).toEqual(['Titular: Restaurante de Prueba, S.L., NIF ', { pending: 'nif' }, '.'])
  })

  it('un párrafo que depende de un dato opcional que no hay, no sale', () => {
    expect(fill('Inscrita en {registry}.', 'es', entity)).toBeNull()
    expect(fill('Inscrita en {registry}.', 'es', { ...entity, registry: 'el Registro Mercantil de Barcelona' })).toEqual(['Inscrita en el Registro Mercantil de Barcelona.'])
  })

  it('un dato que cambia con el idioma sale en el de la página', () => {
    const withRetention = { ...entity, retention: { es: 'un año', ca: 'un any' } }

    expect(fill('Se conservan {retention}.', 'ca', withRetention)).toEqual(['Se conservan un any.'])
  })

  // Lo que todavía no ha dado el titular. Mientras falte, la página lo marca como pendiente a la vista de
  // todos, así que no debería publicarse. La lista solo puede encoger: al completar un dato, quitarlo de aquí.
  it('hoy faltan estos, y ninguno más', () => {
    expect(pendingFields()).toEqual(['holder', 'nif', 'address', 'email', 'retention'])
  })
})
