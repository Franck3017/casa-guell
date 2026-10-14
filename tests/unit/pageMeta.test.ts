import { describe, expect, it } from 'vitest'
import { pageMeta, pageOf } from '@/components/Seo/pageMeta'
import { ca } from '@/i18n/locales/ca'
import { es } from '@/i18n/locales/es'

describe('qué página es una ruta', () => {
  it('la portada de un idioma, con o sin barra final', () => {
    expect(pageOf('es', '/es')).toBe('')
    expect(pageOf('es', '/es/')).toBe('')
  })

  it('la información legal', () => {
    expect(pageOf('ca', '/ca/legal')).toBe('/legal')
    expect(pageOf('ca', '/ca/legal/')).toBe('/legal')
  })

  it('cualquier otra ruta no es ninguna página', () => {
    expect(pageOf('es', '/es/no-existe')).toBeNull()
    expect(pageOf('es', '/es/legal/otra')).toBeNull()
  })
})

describe('cabecera de cada página', () => {
  it('la portada lleva el título y la descripción del restaurante', () => {
    expect(pageMeta('es', es, '')).toEqual({
      title: es.meta.title,
      description: es.meta.description,
      canonical: 'https://casa-guell-drab.vercel.app/es',
      robots: 'index, follow, max-image-preview:large'
    })
  })

  it('la información legal lleva los suyos y su propia dirección', () => {
    expect(pageMeta('ca', ca, '/legal')).toEqual({
      title: 'Informació legal · Casa Güell',
      description: ca.legal.intro,
      canonical: 'https://casa-guell-drab.vercel.app/ca/legal',
      robots: 'index, follow, max-image-preview:large'
    })
  })

  // Si esto se invirtiera, los buscadores dejarían de indexar la web entera: por eso se decide aquí, con
  // prueba, y no en el componente que lo escribe en el <head>
  it('una ruta que no existe se presenta como la portada, pero pide no indexarse', () => {
    expect(pageMeta('es', es, null)).toEqual({
      title: es.meta.title,
      description: es.meta.description,
      canonical: 'https://casa-guell-drab.vercel.app/es',
      robots: 'noindex, follow'
    })
  })
})
