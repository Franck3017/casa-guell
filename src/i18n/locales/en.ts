import type { Messages } from '../types'

export const en: Messages = {
  meta: { title: 'Casa Güell · Catalan restaurant in Barcelona', description: 'Catalan restaurant in Sant Martí, Barcelona. Market produce and slow-cooked stews. Browse the menu and book a table, Wednesday to Sunday.', lang: 'en' },
  nav: { label: 'Main navigation', filosofia: 'Philosophy', carta: 'Menu', mercat: 'Market', ubicacio: 'Location', paleta: 'Palette', menuOpen: 'Open the sections menu', menuClose: 'Close the sections menu' },
  hero: { kicker: 'Sant Martí · Barcelona', lema1: 'Catalan tradition,', lema2: 'no makeup', intro: 'Market product, real slow-simmer and Catalan memory. Grandmother\'s cooking, no shortcuts.', ctaCarta: 'The menu', ctaOnSom: 'Find us', fitxaLabel: 'Seasonal dish', chefAlt: 'The chef, in a navy jacket and green apron, presents a wooden tray of toasted brioche with tobiko in the dining room', featuredLabel: 'Signature dish', featuredDish: 'Toasted brioche with tobiko', featuredDescription: 'Available this week.', featuredAlt: 'Toasted brioche with avocado, tobiko and pickled onion on a wooden tray' },
  filosofia: {
    kicker: '01 — Philosophy',
    title: 'Thirty years returning to the essence',
    imgAlt: 'The chef holding a plate of seasonal wild mushrooms',
    pilars: {
      origen: { t: 'The origin', d: 'Jordi started thirty years ago in kitchens where time was the most expensive ingredient. Today he returns to that slowness, without pretence or shortcuts.' },
      mercat: { t: 'The market', d: 'Every morning, before the kitchen opens, the market decides the day\'s menu. The product leads; we only accompany it.' },
      foc: { t: 'The slow fire', d: 'Stews that cook for hours, stocks that rest for days. Modern technique serves memory, it does not replace it.' }
    },
    quote: 'Come taste grandmother\'s cooking. Don\'t let them tell you about it.',
    sign: 'Jordi, Executive Chef'
  },
  carta: {
    kicker: '02 — The Menu',
    title: 'Our works of art',
    subtitle: 'Every dish, with love and passion, exactly as it leaves our kitchen.',
    tabs: { cuina: 'Kitchen', begudes: 'Drinks', esperits: 'Spirits' },
    sets: { barra: 'The Bar', empezar: 'To Start', compartir: 'To Share', rematar: 'To Finish', postres: 'Desserts', cocteles: 'Cocktails', spritz: 'Spritz', apertivo: 'Aperitif', cervezas: 'Beers', soft: 'Soft Drinks', gin: 'Gin', ron: 'Rum', whisky: 'Whisky', tequila: 'Tequila', vodka: 'Vodka', copas: 'Premium Glasses', chupitos: 'Shots 3.50 €', copes: 'Glasses 6.50 €', digestiu: 'Digestif' },
    section: 'Section',
    refs: 'references', refsOne: 'item', empty: 'This section has no items right now.', shot: 'Shot', glass: 'Glass',
    allergenLegend: 'Allergen key'
  },
  mercat: { kicker: '03 — Market', title: 'The market leads', desc: 'Every morning we go down to the fish market and choose the best fish and seafood of the day. There is no fixed market menu: ask for the product of the day, because it changes daily according to what the sea offers.', accion: 'Ask for the product of the day', caption: 'Barcelona fish market · daily purchase', imgAlt: 'Fresh fish and seafood of the day laid on ice at the fish market', imgAlt2: 'Chef Jordi looking in surprise at a blue crate full of fresh langoustines in the kitchen', imgAlt3: 'A fresh langoustine held in the hand above a plate of more langoustines' },
  ubicacio: {
    kicker: '04 — Location',
    title: 'Sant Martí awaits',
    adressLabel: 'Address',
    scheduleLabel: 'Hours',
    contactLabel: 'Contact',
    maps: 'Open in Google Maps →',
    mapCaption: 'Sant Martí · Barcelona', mapLabel: "Map showing Casa Güell's location in Sant Martí, Barcelona",
    zoomHint: 'Use Ctrl + scroll to zoom the map', panHint: 'Use two fingers to move the map',
    closed: 'Closed',
    days: { md: 'Wednesday to Saturday', dg: 'Sunday', ll: 'Monday and Tuesday' },
    overlay: { ubicacio: 'Location', barri: 'The neighbourhood', barriTitle: 'A neighbourhood with character', barriDesc: 'Former industrial district turned creative hub. Five minutes from Poblenou metro, with public parking 200 metres away.', metro: 'Metro L4 Poblenou (5 min)', parking: 'Public parking (200 m)', tram: 'Tram T4 (3 min)', back: '← Back to info', hide: 'Hide details', show: 'Show details', zone: 'Restaurant area', comArribar: 'How to get there' }
  },
  branding: { kicker: '05 — Branding', title: 'Corporate palette' },
  footer: { allergens: 'Allergens', rights: 'All rights reserved' },
  theme: { label: 'Colour theme', light: 'Light', auto: 'Auto', dark: 'Dark', toLight: 'Switch to light mode', toDark: 'Switch to dark mode', shortcut: 'Shortcut: key T' },
  lang: { label: 'Language' },
  search: { label: 'Search', placeholder: 'Search a dish or drink…', noResults: 'No results. Try another term.', hint: 'Press / or Ctrl+K to search', clear: 'Clear search' },
  backToTop: { label: 'Back to top' },
  allergenTip: { contains: 'Contains:' },
  skip: { content: 'Skip to content' },
  reserve: { title: 'Book a table', short: 'Book', date: 'Date', time: 'Time', people: 'Guests', name: 'Name', phone: 'Phone', phoneHint: 'We will call this number to confirm your booking.', lunch: 'Lunch', dinner: 'Dinner', submit: 'Request booking', sending: 'Sending…', success: 'Request received', successDesc: 'We will call you to confirm your table.', error: 'We could not send your request. Please try again.', close: 'Close', closedDay: 'We are closed on Monday and Tuesday. Choose Wednesday to Sunday.', noSlots: 'No times left today. Please choose another day.', bigGroup: 'For parties of 9 or more, please call us and we will arrange it.', errorCall: 'You can also call us on' },
  closing: { title: 'Book your table', phoneLabel: 'Or call us on' },
  film: { label: 'Casa Güell in five ideas', pause: 'Pause the animation', play: 'Resume the animation' },
  loadError: { map: "We couldn't load the map.", menu: "We couldn't load the menu.", page: 'Something went wrong loading the page.', reload: 'Reload the page' },
  marquee: ['Market produce', 'Real xup-xup', 'Catalan memory', 'Slow fire', 'No shortcuts'],
  whatsapp: { label: 'WhatsApp', message: 'Hello, I would like to book a table at Casa Güell' },
  newsletter: {
    kicker: 'Dish of the day',
    label: 'Email',
    title: 'Get the dish of the day in your inbox',
    desc: 'Every morning, when the market decides, we send you what we will cook today. No noise: one dish, one email.',
    placeholder: 'you@mail.com',
    submit: 'Subscribe',
    sending: 'Sending…',
    success: 'Subscription received',
    successDesc: 'You will receive the dish of the day by email.',
    error: 'Something went wrong. Check your email and try again.',
    privacy: 'Zero spam. Unsubscribe anytime with one click.',
    today: 'Today in the kitchen:'
  }
}
