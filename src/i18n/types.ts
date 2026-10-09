export interface Messages {
  meta: { title: string, description: string, lang: string }
  nav: { label: string, filosofia: string, carta: string, mercat: string, ubicacio: string, paleta: string, menuOpen: string, menuClose: string }
  hero: {
    kicker: string, lema1: string, lema2: string, intro: string, ctaCarta: string, ctaOnSom: string
    chefAlt: string, featuredLabel: string, featuredDish: string
    featuredDescription: string
  }
  filosofia: {
    title: string; imgAlt: string
    pilars: { origen: { t: string, d: string }, mercat: { t: string, d: string }, foc: { t: string, d: string } }
    quote: string; sign: string
  }
  carta: {
    title: string; subtitle: string
    tabs: { cuina: string, begudes: string, esperits: string }
    sets: {
      barra: string; empezar: string; compartir: string; rematar: string; postres: string
      cocteles: string; spritz: string; apertivo: string; cervezas: string; soft: string
      gin: string; ron: string; whisky: string; tequila: string; vodka: string
      copas: string; chupitos: string; copes: string; digestiu: string
    }
    section: string; refs: string; refsOne: string; empty: string; shot: string; glass: string
    allergenLegend: string
  }
  mercat: { title: string, desc: string, accion: string, caption: string, imgAlt2: string, imgAlt3: string }
  ubicacio: {
    title: string
    maps: string; mapLabel: string; zoomHint: string; panHint: string; closed: string
    days: { md: string, dg: string, ll: string }
    overlay: { metro: string; parking: string; tram: string; comArribar: string }
  }
  footer: { rights: string }
  theme: { label: string, light: string, auto: string, dark: string, shortcut: string }
  lang: { label: string }
  search: { label: string, placeholder: string, noResults: string, hint: string, clear: string }
  backToTop: { label: string }
  skip: { content: string }
  reserve: { title: string, short: string, date: string, time: string, people: string, name: string, phone: string, phoneHint: string, lunch: string, dinner: string, submit: string, sending: string, success: string, successDesc: string, error: string, close: string, closedDay: string, noSlots: string, bigGroup: string, errorCall: string }
  closing: { title: string, phoneLabel: string }
  film: {
    label: string, pause: string, play: string
    /** Las cinco ideas de la pieza animada. Cada una tiene su escena y su dibujo: van por nombre, no por orden. */
    phrases: { market: string, simmer: string, memory: string, fire: string, shortcuts: string }
  }
  loadError: { map: string, menu: string, page: string, reload: string }
  newsletter: {
    label: string; title: string; desc: string; placeholder: string
    submit: string; sending: string; success: string; successDesc: string
    error: string; privacy: string
  }
}
