import type { Messages } from '../types'

export const es: Messages = {
  meta: { title: 'Casa Güell · Restaurante de cocina catalana en Barcelona', description: 'Restaurante de cocina catalana en Sant Martí, Barcelona. Producto de mercado y guisos a fuego lento. Consulta la carta y reserva mesa de miércoles a domingo.', lang: 'es' },
  nav: { label: 'Navegación principal', filosofia: 'Filosofía', carta: 'Carta', mercat: 'Mercado', ubicacio: 'Ubicación', paleta: 'Paleta', menuOpen: 'Abrir el menú de secciones', menuClose: 'Cerrar el menú de secciones' },
  hero: { kicker: 'Sant Martí · Barcelona', lema1: 'Tradición catalana,', lema2: 'sin maquillaje', intro: 'Producto de mercado, xup-xup real y memoria catalana. La cocina de la abuela, sin atajos.', ctaCarta: 'La carta', ctaOnSom: 'Dónde estamos', chefAlt: 'El chef, con chaqueta azul marino y delantal verde, presenta en la sala una bandeja de madera con el brioche tostado con tobico', featuredLabel: 'Producto estrella', featuredDish: 'Brioche tostado con tobico', featuredDescription: 'Disponible esta semana.' },
  filosofia: {
    title: 'Treinta años volviendo a la esencia',
    imgAlt: 'El chef con un plato de bolets de temporada',
    pilars: {
      origen: { t: 'El origen', d: 'Jordi empezó hace treinta años en cocinas donde el tiempo era el ingrediente más caro. Hoy vuelve a aquella lentitud, sin pretensiones ni atajos.' },
      mercat: { t: 'El mercado', d: 'Cada mañana, antes de que abra la cocina, el mercado decide la carta del día. El producto manda; nosotros solo lo acompañamos.' },
      foc: { t: 'El fuego lento', d: 'Guisados que cuecen horas, fondos que reposan días. La técnica moderna sirve a la memoria, no la sustituye.' }
    },
    quote: 'Ven a probar la cocina de la abuela. Que no te lo cuenten.',
    sign: 'Jordi, Chef Ejecutivo'
  },
  carta: {
    title: 'Nuestras obras de arte',
    subtitle: 'Cada plato, con amor y pasión tal como sale de nuestra cocina.',
    tabs: { cuina: 'Cocina', begudes: 'Bebidas', esperits: 'Espirituosos' },
    sets: { barra: 'La Barra', empezar: 'Para Empezar', compartir: 'Para Compartir', rematar: 'Para Rematar', postres: 'Postres', cocteles: 'Cócteles', spritz: 'Spritz', apertivo: 'Aperitivo', cervezas: 'Cervezas', soft: 'Refrescos', gin: 'Gin', ron: 'Ron', whisky: 'Whisky', tequila: 'Tequila', vodka: 'Vodka', copas: 'Copas Premium', chupitos: 'Chupitos 3,50 €', copes: 'Copas 6,50 €', digestiu: 'Digestivo' },
    section: 'Sección',
    refs: 'referencias', refsOne: 'referencia', empty: 'Esta sección no tiene referencias por ahora.', shot: 'Chupito', glass: 'Copa',
    allergenLegend: 'Leyenda de alérgenos'
  },
  mercat: { title: 'El mercado manda', desc: 'Cada mañana bajamos a la lonja y elegimos el mejor pescado y marisco del día. No hay carta fija de mercado: pregunta por el producto del día, porque cambia cada jornada según lo que ofrece el mar.', accion: 'Pregunta por el producto del día', caption: 'Lonja de Barcelona · compra diaria', imgAlt2: 'Jordi, el chef, mirando con sorpresa una caja azul llena de cigalas frescas en la cocina', imgAlt3: 'Una cigala fresca sostenida en la mano sobre un plato con más cigalas' },
  ubicacio: {
    title: 'Sant Martí nos espera',
    maps: 'Abrir en Google Maps',
    mapLabel: "Mapa con la ubicación de Casa Güell, en Sant Martí (Barcelona)",
    zoomHint: 'Usa Ctrl + la rueda para acercar el mapa', panHint: 'Usa dos dedos para mover el mapa',
    closed: 'Cerrado',
    days: { md: 'Miércoles a Sábado', dg: 'Domingo', ll: 'Lunes y Martes' },
    overlay: { metro: 'Metro L4 Poblenou (5 min)', parking: 'Aparcamiento público (200 m)', tram: 'Tranvía T4 (3 min)', comArribar: 'Cómo llegar' }
  },
  footer: { rights: 'Todos los derechos reservados' },
  theme: { label: 'Tema de color', light: 'Claro', auto: 'Auto', dark: 'Oscuro', shortcut: 'Atajo: tecla T' },
  lang: { label: 'Idioma' },
  search: { label: 'Buscar', placeholder: 'Busca un plato o bebida…', noResults: 'Sin resultados. Prueba con otro término.', hint: 'Pulsa / o Ctrl+K para buscar', clear: 'Borrar búsqueda' },
  backToTop: { label: 'Volver arriba' },
  skip: { content: 'Saltar al contenido' },
  reserve: { title: 'Reservar mesa', short: 'Reservar', date: 'Fecha', time: 'Hora', people: 'Personas', name: 'Nombre', phone: 'Teléfono', phoneHint: 'Te llamaremos a este número para confirmar la reserva.', lunch: 'Comida', dinner: 'Cena', submit: 'Solicitar reserva', sending: 'Enviando…', success: 'Solicitud recibida', successDesc: 'Te llamaremos para confirmar tu mesa.', error: 'No hemos podido enviar tu solicitud. Inténtalo de nuevo.', close: 'Cerrar', closedDay: 'Cerramos lunes y martes. Elige de miércoles a domingo.', noSlots: 'Hoy ya no quedan horas disponibles. Elige otro día.', bigGroup: 'Para grupos de 9 o más personas, llámanos y lo preparamos.', errorCall: 'También puedes llamarnos al' },
  closing: { title: 'Reserva tu mesa', phoneLabel: 'O llámanos al' },
  film: {
    label: 'Casa Güell en cinco ideas', pause: 'Pausar la animación', play: 'Reanudar la animación',
    phrases: { market: 'Producto de mercado', simmer: 'Xup-xup real', memory: 'Memoria catalana', fire: 'Fuego lento', shortcuts: 'Sin atajos' }
  },
  loadError: { map: 'No hemos podido cargar el mapa.', menu: 'No hemos podido cargar la carta.', page: 'Algo ha fallado al cargar la página.', reload: 'Recargar la página' },
  newsletter: {
    label: 'Correo electrónico',
    title: 'Recibe el producto del día en tu mail',
    desc: 'Cada mañana, cuando el mercado decide, te enviamos qué cocinaremos hoy. Sin ruido: un plato, un mail.',
    placeholder: 'tu@mail.com',
    submit: 'Suscribirme',
    sending: 'Enviando…',
    success: 'Suscripción recibida',
    successDesc: 'Recibirás el producto del día en tu correo.',
    error: 'Ha habido un error. Comprueba el mail y vuelve a intentarlo.',
    privacy: 'Cero spam. Date de baja cuando quieras con un clic.'
  }
}
