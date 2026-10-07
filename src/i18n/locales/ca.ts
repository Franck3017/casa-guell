import type { Messages } from '../types'

export const ca: Messages = {
  meta: { title: 'Casa Güell · Restaurant de cuina catalana a Barcelona', description: 'Restaurant de cuina catalana a Sant Martí, Barcelona. Producte de mercat i guisats a foc lent. Consulta la carta i reserva taula de dimecres a diumenge.', lang: 'ca' },
  nav: { label: 'Navegació principal', filosofia: 'Filosofia', carta: 'Carta', mercat: 'Mercat', ubicacio: 'Ubicació', paleta: 'Paleta', menuOpen: 'Obrir el menú de seccions', menuClose: 'Tancar el menú de seccions' },
  hero: { kicker: 'Sant Martí · Barcelona', lema1: 'Tradició catalana,', lema2: 'sense maquillatge', intro: 'Producte de mercat, xup-xup real i memòria catalana. La cuina de l\'àvia, sense dreceres.', ctaCarta: 'La carta', ctaOnSom: 'On som', fitxaLabel: 'Plat de temporada', chefAlt: 'El xef, amb jaqueta blau marí i davantal verd, presenta a la sala una safata de fusta amb el brioix torrat amb tobiko', featuredLabel: 'Producte estrella', featuredDish: 'Brioche torrat amb tobiko', featuredDescription: 'Disponible aquesta setmana.', featuredAlt: 'Brioche torrat amb alvocat, tobiko i ceba envinagrada sobre una safata de fusta' },
  filosofia: {
    kicker: '01 — Filosofia',
    title: 'Trenta anys tornant a l\'essència',
    imgAlt: 'El chef amb un plat de bolets de temporada',
    pilars: {
      origen: { t: 'L\'origen', d: 'Jordi va començar fa trenta anys en cuines on el temps era l\'ingredient més car. Avui torna a aquella lentitud, sense pretensions ni dreceres.' },
      mercat: { t: 'El mercat', d: 'Cada matí, abans que obri la cuina, el mercat decideix la carta del dia. El producte mana; nosaltres només l\'acompanyem.' },
      foc: { t: 'El foc lent', d: 'Guisats que couen hores, fons que reposen dies. La tècnica moderna serveix la memòria, no la substitueix.' }
    },
    quote: 'Vine a provar la cuina de l\'àvia. Que no t\'ho expliquin.',
    sign: 'Jordi, Chef Executiu'
  },
  carta: {
    kicker: '02 — La Carta',
    title: 'Les nostres obres d\'art',
    subtitle: 'Cada plat, amb amor i passió tal com surt de la nostra cuina.',
    tabs: { cuina: 'Cuina', begudes: 'Begudes', esperits: 'Esperits' },
    sets: { barra: 'La Barra', empezar: 'Per Començar', compartir: 'Per Compartir', rematar: 'Per Rematar', postres: 'Postres', cocteles: 'Cocteles', spritz: 'Spritz', apertivo: 'Aperitiu', cervezas: 'Cerveses', soft: 'Refrescos', gin: 'Gin', ron: 'Ron', whisky: 'Whisky', tequila: 'Tequila', vodka: 'Vodka', copas: 'Copes Premium', chupitos: 'Xupitos 3,50 €', copes: 'Copes 6,50 €', digestiu: 'Digestiu' },
    section: 'Secció',
    refs: 'referències', refsOne: 'referència', empty: 'Aquesta secció no té referències ara mateix.', shot: 'Xupito', glass: 'Copa',
    allergenLegend: 'Llegenda d\'al·lèrgens'
  },
  mercat: { kicker: '03 — Mercat', title: 'El mercat mana', desc: 'Cada matí baixem a la llotja i triem el millor peix i marisc del dia. No hi ha carta fixa de mercat: pregunta pel producte del dia, perquè canvia cada jornada segons el que ofereix el mar.', accion: 'Pregunta pel producte del dia', caption: 'Llotja de Barcelona · compra diària', imgAlt: 'Peix i marisc fresc del dia disposat sobre gel a la llotja', imgAlt2: 'Jordi, el xef, mirant amb sorpresa una caixa blava plena de escamarlans frescos a la cuina', imgAlt3: 'Un escamarlà fresc sostingut a la mà sobre un plat amb més escamarlans' },
  ubicacio: {
    kicker: '04 — Ubicació',
    title: 'Sant Martí ens espera',
    adressLabel: 'Adreça',
    scheduleLabel: 'Horari',
    contactLabel: 'Contacte',
    maps: 'Obrir a Google Maps →',
    mapCaption: 'Sant Martí · Barcelona', mapLabel: "Mapa amb la ubicació de Casa Güell, a Sant Martí (Barcelona)",
    closed: 'Tancat',
    days: { md: 'Dimecres a Dissabte', dg: 'Diumenge', ll: 'Dilluns i Dimarts' },
    overlay: { ubicacio: 'Ubicació', barri: 'El barri', barriTitle: 'Barri amb caràcter', barriDesc: 'Antic districte industrial reconvertit en hub creatiu. A 5 minuts del metro Poblenou, amb aparcament públic a 200 metres.', metro: 'Metro L4 Poblenou (5 min)', parking: 'Pàrquing públic (200 m)', tram: 'Tramvia T4 (3 min)', back: '← Tornar a info', hide: 'Amaga la informació', show: 'Mostra la informació', zone: 'Zona del restaurant', comArribar: 'Com arribar-hi' }
  },
  branding: { kicker: '05 — Branding', title: 'Paleta corporativa' },
  footer: { allergens: 'Al·lèrgens', rights: 'Tots els drets reservats' },
  theme: { label: 'Tema de color', light: 'Clar', auto: 'Auto', dark: 'Fosc', toLight: 'Canvia a mode clar', toDark: 'Canvia a mode fosc', shortcut: 'Drecera: tecla T' },
  lang: { label: 'Idioma' },
  search: { label: 'Cerca', placeholder: 'Cerca un plat o beguda…', noResults: 'Cap resultat. Prova amb un altre terme.', hint: 'Prem / o Ctrl+K per cercar', clear: 'Esborra la cerca' },
  backToTop: { label: 'Torna amunt' },
  allergenTip: { contains: 'Conté:' },
  skip: { content: 'Salta al contingut' },
  reserve: { title: 'Reservar taula', short: 'Reservar', date: 'Data', time: 'Hora', people: 'Persones', name: 'Nom', phone: 'Telèfon', phoneHint: 'Et trucarem a aquest número per confirmar la reserva.', lunch: 'Dinar', dinner: 'Sopar', submit: 'Sol·licitar reserva', sending: 'Enviant…', success: 'Sol·licitud rebuda', successDesc: 'Et trucarem per confirmar la teva taula.', error: 'No hem pogut enviar la teva sol·licitud. Torna-ho a provar.', close: 'Tanca', closedDay: 'Tanquem dilluns i dimarts. Tria de dimecres a diumenge.', noSlots: 'Avui ja no queden hores disponibles. Tria un altre dia.', bigGroup: 'Per a grups de 9 o més persones, truca’ns i ho preparem.', errorCall: 'També pots trucar-nos al' },
  closing: { title: 'Reserva la teva taula', phoneLabel: 'O truca’ns al' },
  marquee: ['Producte de mercat', 'Xup-xup real', 'Memòria catalana', 'Foc lent', 'Sense dreceres'],
  whatsapp: { label: 'WhatsApp', message: 'Hola, vull reservar taula a Casa Güell' },
  newsletter: {
    kicker: 'Producte del dia',
    label: 'Correu electrònic',
    title: 'Rep el producte del dia al teu mail',
    desc: 'Cada matí, quan el mercat decideix, t\'enviem què cuinarem avui. Sense soroll: un plat, un mail.',
    placeholder: 'el-teu@mail.com',
    submit: 'Subscriu-m\'hi',
    sending: 'Enviant…',
    success: 'Subscripció rebuda',
    successDesc: 'Rebràs el producte del dia al teu correu.',
    error: 'Hi ha hagut un error. Comprova el mail i torna-ho a provar.',
    privacy: 'Zero spam. Baixa quan vulguis amb un clic.',
    today: 'Avui a la cuina:'
  }
}
