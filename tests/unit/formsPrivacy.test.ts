import { createElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { BookingForm } from '@/components/layout/reserve/BookingForm'
import { NewsletterSignup } from '@/features/market/NewsletterSignup'
import type { Reservation } from '@/hooks/useReservation'
import { I18nProvider, type Locale } from '@/i18n'
import { ca } from '@/i18n/locales/ca'
import { en } from '@/i18n/locales/en'
import { es } from '@/i18n/locales/es'

// Lo que el RGPD pide a un formulario que recoge datos: decir allí mismo para qué se usan y dónde está
// la política completa (primera capa) y, si se piden con consentimiento, que este sea un gesto de quien
// los da (una casilla que llega sin marcar).

const DICTS = { ca, es, en }
/** Como escribe React un texto en el HTML. */
const escapeHtml = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')

const render = (locale: Locale, node: ReactNode): string => renderToStaticMarkup(
  createElement(MemoryRouter, { initialEntries: [`/${locale}`] }, createElement(I18nProvider, { locale, children: node }))
)

/** Una reserva recién abierta: nada elegido ni escrito. */
const emptyBooking: Reservation = {
  date: '',
  people: 2,
  slot: null,
  contact: { name: '', phone: '', email: '', notes: '' },
  slots: undefined,
  sending: false,
  errorKey: null,
  code: null,
  setDate: () => {},
  setPeople: () => {},
  setSlot: () => {},
  setContact: () => {},
  reloadSlots: () => {},
  submit: async () => null,
  reset: () => {}
}

/** El enlace a la política de privacidad, que se abre aparte para no perder lo escrito en el formulario. */
const privacyLink = (locale: Locale): string => `<a href="/${locale}/legal#privacidad" target="_blank" rel="noopener"`

describe.each(['ca', 'es', 'en'] as const)('formularios en /%s', (locale) => {
  const t = DICTS[locale]

  describe('alta en el aviso del producto del día', () => {
    const html = render(locale, createElement(NewsletterSignup))
    const checkbox = html.match(/<input[^>]*type="checkbox"[^>]*>/)?.[0] ?? ''

    it('pide el consentimiento con una casilla obligatoria que llega sin marcar', () => {
      expect(checkbox).toContain('required=""')
      expect(checkbox).not.toContain('checked')
    })

    // Primero se consiente y después se envía: quien recorre el formulario con el teclado lo encuentra en ese orden
    it('pone la casilla antes del botón de enviar', () => {
      expect(html).toContain('type="checkbox"')
      expect(html.indexOf('type="checkbox"')).toBeLessThan(html.indexOf('type="submit"'))
    })

    // Lo que llega al restaurante con cada alta: el texto exacto que se aceptó
    it('envía con el alta el texto que se acepta', () => {
      expect(checkbox).toContain('name="consentimiento"')
      expect(checkbox).toContain(`value="${escapeHtml(t.newsletter.consent)}"`)
      expect(html).toContain(`>${escapeHtml(t.newsletter.consent)}<`)
    })

    it('dice para qué se usa el correo y enlaza la política de privacidad', () => {
      expect(html).toContain(escapeHtml(t.newsletter.dataUse))
      expect(html).toContain(privacyLink(locale))
    })
  })

  describe('reserva de mesa', () => {
    const html = render(locale, createElement(BookingForm, { booking: emptyBooking, partyNoun: t.reserve.persons, summary: { when: '', who: '' } }))

    it('dice para qué se usan los datos y enlaza la política de privacidad', () => {
      expect(html).toContain(escapeHtml(t.reserve.dataUse))
      expect(html).toContain(privacyLink(locale))
    })
  })
})
