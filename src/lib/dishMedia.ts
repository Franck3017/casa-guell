export interface DishMedia {
  src: string
  alt: string
  title: string
  /** object-position de la miniatura (encuadre del recorte 4:5). */
  position?: string
}

const IMG = '/assets/img/dishes/'

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Mapeo nombre-de-plato (slug) → imagen real + alt + title.
 * Guarda los archivos en public/assets/img/dishes/ con el nombre "archivo_nuevo".
 */
export const DISH_MEDIA: Record<string, DishMedia> = {
  // POSTRES
  'flan-cremoso-con-nata': { src: IMG + 'flan-casero-caramelo-casa-guell.webp', alt: 'Flan casero con caramelo y una quenelle cremosa, decorado con menta, en Casa Güell', title: 'Flan casero con caramelo | Casa Güell' },
  'buixo-de-girona-con-helado-de-almendra-y-bergamota': { src: IMG + 'xuixo-crema-quemada-casa-guell.webp', alt: 'Xuixo relleno de crema flambeado con soplete y migas crujientes, postre de Casa Güell', title: 'Xuixo de crema quemada | Casa Güell' },
  'coulant-de-pistacho-con-helado-cremoso-de-pistacho': { src: IMG + 'coulant-chocolate-helado-pistacho-casa-guell.webp', alt: 'Coulant de chocolate con corazón fundido de chocolate blanco y helado de pistacho', title: 'Coulant de chocolate con helado de pistacho | Casa Güell' },
  'torrija-con-helado-de-aove-y-naranja-confitada': { src: IMG + 'torrija-caramelizada-helado-naranja-casa-guell.webp', alt: 'Torrija caramelizada con azúcar glas, ralladura de naranja y helado cremoso', title: 'Torrija caramelizada con helado de naranja | Casa Güell' },

  // PARA COMPARTIR
  'tarrina-crujiente-de-oreja': { src: IMG + 'oreja-cerdo-crujiente-salsa-casa-guell.webp', alt: 'Oreja de cerdo frita y crujiente con salsa roja y brotes tiernos, plato de Casa Güell', title: 'Oreja de cerdo crujiente | Casa Güell' },
  'croquetas-la-del-chef-jordi': { src: IMG + 'croquetas-jamon-cremosas-casa-guell.webp', alt: 'Croquetas de jamón crujientes y cremosas, una con loncha de jamón y romero', title: 'Croquetas de jamón cremosas | Casa Güell' },
  'bravas-casa-guell': { src: IMG + 'patatas-bravas-salsa-brava-casa-guell.webp', alt: 'Patatas bravas caseras con salsa brava, servidas en cuenco esmaltado', title: 'Patatas bravas con salsa brava | Casa Güell' },
  // TODO: renombrar el archivo a huevos-fritos-chanquetes-pimientos-confitados-casa-guell.webp y actualizar src
  'huevos-fritos-con-chanquetes-y-pimientos-confitados': { src: IMG + 'huevo-frito-gambitas-crujientes-casa-guell.webp', alt: 'Huevos fritos con chanquetes fritos y crujientes sobre pimientos confitados, con una caña de cerveza', title: 'Huevos fritos con chanquetes | Casa Güell' },

  // PARA EMPEZAR
  'tartar-de-atun-con-yema-curada': { src: IMG + 'tartar-atun-rojo-yema-wakame-casa-guell.webp', alt: 'Tartar de atún rojo con yema de huevo, alga wakame, mayonesa e hilos de chile', title: 'Tartar de atún rojo con yema | Casa Güell' },
  'calamar-con-rosinols-y-huevo-frito': { src: IMG + 'calamar-salteado-huevo-frito-casa-guell.webp', alt: 'Calamar salteado con guindilla y huevo frito por encima', title: 'Calamar salteado con huevo frito | Casa Güell' },
  'chips-de-berenjenas-con-lima-y-miel': { src: IMG + 'berenjena-frita-crujiente-miel-casa-guell.webp', alt: 'Láminas de berenjena frita y crujiente con un hilo de miel, en plato con cuenco de miel', title: 'Berenjena frita con miel | Casa Güell' },

  // PARA REMATAR
  'canelones-de-l-avia': { src: IMG + 'canelones-gratinados-casa-guell.webp', alt: 'Canelones caseros gratinados con bechamel y queso, servidos en cazuela individual', title: 'Canelones gratinados caseros | Casa Güell' },
  'cap-i-pota': { src: IMG + 'capipota-guiso-tradicional-catalan-casa-guell.webp', alt: 'Capipota, guiso tradicional catalán de cabeza y pata de ternera, con pan y cerveza', title: 'Capipota, guiso tradicional catalán | Casa Güell' },
  'albondigas-con-sepia': { src: IMG + 'albondigas-caseras-salsa-cazuela-barro-casa-guell.webp', alt: 'Albóndigas caseras en salsa, en cazuela de barro y acompañadas de una copa de cerveza', title: 'Albóndigas caseras en salsa | Casa Güell' },
  'fricando-con-moixernons': { src: IMG + 'fricando-ternera-setas-casa-guell.webp', alt: 'Fricandó de ternera con setas y hoja de laurel, plato clásico de la cocina catalana', title: 'Fricandó de ternera con setas | Casa Güell' },
  'mar-y-montana-butifarra-de-can-rovira-con-sepionets': { src: IMG + 'mar-y-montana-casa-guell.webp', alt: 'Plato de mar y montaña con butifarra, sepionets y salsa roja', title: 'Mar y montaña | Casa Güell' },

  // LA BARRA
  gilda: { src: IMG + 'gilda-lata-bonito-del-norte-casa-guell.webp', alt: 'Lata de bonito del norte con aceitunas, anchoa y guindilla, aliñada con salsa', title: 'Gilda en lata de bonito del norte | Casa Güell' },
  'paletilla-jamon-iberico-de-guiello': { src: IMG + 'jamon-iberico-cortado-a-cuchillo-casa-guell.webp', alt: 'Plato de jamón ibérico en lonchas finas con picos crujientes', title: 'Jamón ibérico cortado a cuchillo | Casa Güell' },
  'ensaladilla-rusa': { src: IMG + 'ensaladilla-rusa-anchoa-alcaparra-casa-guell.webp', alt: 'Ensaladilla rusa con anchoa, alcaparra y obleas crujientes', title: 'Ensaladilla rusa con anchoa | Casa Güell' },
  'torrenzo-de-soria': { src: IMG + 'torreznos-panceta-crujiente-lima-casa-guell.webp', alt: 'Torreznos de panceta crujiente con ralladura de lima y pimienta', title: 'Torreznos de panceta crujiente | Casa Güell' },
  'anchoas-filete-unidad': { src: IMG + 'anchoas-pan-tomate-casa-guell.webp', alt: 'Tostas de pan con tomate y anchoas en aceite de oliva', title: 'Anchoas sobre pan con tomate | Casa Güell' },

  // ─── APERTIVO ───
  'martini-rosso': { src: IMG + 'martini-rosso-vermut-naranja-casa-guell.webp', alt: 'Martini Rosso con hielo y una rodaja de naranja en copa', title: 'Martini Rosso | Casa Güell', position: 'center 85%' },
  'martini-bianco': { src: IMG + 'martini-bianco-vermut-twist-limon-casa-guell.webp', alt: 'Martini Bianco con hielo y un twist de limón en copa', title: 'Martini Bianco | Casa Güell', position: 'center 30%' },
  'martini-rubino': { src: IMG + 'martini-rubino-vermut-piel-naranja-casa-guell.webp', alt: 'Martini Rubino con hielo y piel de naranja en copa de vino', title: 'Martini Rubino | Casa Güell', position: 'center 25%' },
  'perucchi-barril': { src: IMG + 'vermut-perucchi-barril-grifo-casa-guell.webp', alt: 'Vermut Perucchi de barril sirviéndose desde el grifo en una copa con hielo y naranja', title: 'Vermut Perucchi de barril | Casa Güell', position: 'center 45%' },
  'perucchi-edicion-especial': { src: IMG + 'vermut-perucchi-edicion-especial-piel-naranja-casa-guell.webp', alt: 'Vermut Perucchi Edición Especial con hielo y piel de naranja en copa de vino', title: 'Vermut Perucchi Edición Especial | Casa Güell', position: 'center 40%' },
  'perucchi-gran-reserva': { src: IMG + 'vermut-perucchi-gran-reserva-naranja-aceituna-casa-guell.webp', alt: 'Vermut Perucchi Gran Reserva con hielo, rodaja de naranja y aceituna en un palillo', title: 'Vermut Perucchi Gran Reserva | Casa Güell', position: 'center 65%' },
  campari: { src: IMG + 'campari-hielo-naranja-casa-guell.webp', alt: 'Campari con hielo y una rodaja de naranja en vaso corto', title: 'Campari con naranja | Casa Güell', position: 'center 75%' },
  sangria: { src: IMG + 'sangria-vino-tinto-fruta-casa-guell.webp', alt: 'Sangría de vino tinto con hielo y trozos de manzana y naranja, servida en vaso', title: 'Sangría de vino tinto | Casa Güell' },
  'tinto-verano': { src: IMG + 'tinto-de-verano-limon-casa-guell.webp', alt: 'Tinto de verano con hielo y una rodaja de limón, servido en copa de vino', title: 'Tinto de verano | Casa Güell' },

  // ─── SPRITZ ───
  'st-germain-hugo-spritz': { src: IMG + 'hugo-spritz-st-germain-menta-lima-casa-guell.webp', alt: 'Hugo Spritz con licor St-Germain, hielo, menta fresca y rodaja de lima', title: 'Hugo Spritz con St-Germain | Casa Güell', position: 'center 20%' },
  'martini-bianco-spritz': { src: IMG + 'martini-bianco-spritz-piel-naranja-casa-guell.webp', alt: 'Martini Bianco Spritz con hielo, burbujas y piel de naranja en copa', title: 'Martini Bianco Spritz | Casa Güell', position: 'center 30%' },
  aperol: { src: IMG + 'aperol-spritz-naranja-casa-guell.webp', alt: 'Aperol spritz con hielo, burbujas y una rodaja de naranja en copa grande', title: 'Aperol spritz | Casa Güell', position: 'center 30%' },

  // ─── COCTELES ───
  'patron-paloma': { src: IMG + 'paloma-patron-pomelo-borde-sal-casa-guell.webp', alt: 'Paloma con tequila Patrón, hielo, borde de sal y rodaja de pomelo en vaso alto', title: 'Paloma con Patrón | Casa Güell', position: 'center 100%' },
  'patron-margarita': { src: IMG + 'margarita-patron-lima-borde-sal-casa-guell.webp', alt: 'Margarita con tequila Patrón, borde de sal y rodaja de lima en copa', title: 'Margarita con Patrón | Casa Güell', position: 'center 45%' },
  'espresso-martini': { src: IMG + 'espresso-martini-espuma-granos-cafe-casa-guell.webp', alt: 'Espresso Martini con espuma cremosa y tres granos de café en copa coupé', title: 'Espresso Martini | Casa Güell', position: 'center 55%' },
  'bacardi-mojito': { src: IMG + 'mojito-bacardi-menta-lima-casa-guell.webp', alt: 'Mojito con ron Bacardí, hielo picado, hojas de menta y lima en vaso alto', title: 'Mojito con Bacardí | Casa Güell', position: 'center 50%' },
  'martini-negroni': { src: IMG + 'negroni-martini-hielo-piel-naranja-casa-guell.webp', alt: 'Negroni con Martini, hielo y piel de naranja en vaso corto', title: 'Negroni con Martini | Casa Güell', position: 'center 80%' },

  // ─── CERVEZAS ───
  'alhambra-botellin': { src: IMG + 'cerveza-alhambra-botellin-casa-guell.webp', alt: 'Botellín de cerveza Alhambra junto a un vaso de cerveza rubia con espuma', title: 'Cerveza Alhambra botellín | Casa Güell', position: 'center 80%' },
  'clara-salve-copa-42cl': { src: IMG + 'clara-salve-copa-42cl-casa-guell.webp', alt: 'Clara Salve en copa de 42 cl con espuma y piel de limón', title: 'Clara Salve copa 42 cl | Casa Güell', position: 'center 35%' },
  'clara-salve': { src: IMG + 'clara-salve-limon-casa-guell.webp', alt: 'Clara Salve en vaso alto con espuma y una rodaja de limón', title: 'Clara Salve | Casa Güell', position: 'center 55%' },
  'munich-33cl': { src: IMG + 'cerveza-munich-33cl-espuma-casa-guell.webp', alt: 'Cerveza Munich de 33 cl con espuma cremosa, vista desde arriba', title: 'Cerveza Munich 33 cl | Casa Güell', position: 'center 25%' },
  'munich-copa-42cl': { src: IMG + 'cerveza-munich-copa-42cl-casa-guell.webp', alt: 'Cerveza Munich en copa de 42 cl con espuma blanca y cuerpo dorado', title: 'Cerveza Munich copa 42 cl | Casa Güell', position: 'center 30%' },
  'salve-0-0-tostada-bot': { src: IMG + 'cerveza-salve-0-0-tostada-sin-alcohol-casa-guell.webp', alt: 'Cerveza sin alcohol Salve 0,0 Tostada en vaso con espuma', title: 'Cerveza Salve 0,0 Tostada | Casa Güell', position: 'center 60%' },
  'salve-33cl': { src: IMG + 'cerveza-salve-33cl-espuma-casa-guell.webp', alt: 'Cerveza Salve de 33 cl sirviéndose en un vaso alto con abundante espuma', title: 'Cerveza Salve 33 cl | Casa Güell', position: 'center 80%' },
  'salve-copa-42cl': { src: IMG + 'cerveza-salve-copa-42cl-casa-guell.webp', alt: 'Cerveza Salve en copa de 42 cl con espuma y burbujas doradas', title: 'Cerveza Salve copa 42 cl | Casa Güell', position: 'center 30%' },
  'san-miguel-sin-gluten': { src: IMG + 'cerveza-san-miguel-sin-gluten-casa-guell.webp', alt: 'Cerveza San Miguel sin gluten en vaso alto con espuma y color dorado claro', title: 'Cerveza San Miguel sin gluten | Casa Güell', position: 'center 90%' },

  // ─── SOFT DRINKS ───
  'agua-con-gas': { src: IMG + 'agua-con-gas-hielo-casa-guell.webp', alt: 'Vaso de agua con gas con hielo y burbujas', title: 'Agua con gas | Casa Güell', position: 'center 45%' },
  'agua-kmo': { src: IMG + 'agua-km0-vaso-casa-guell.webp', alt: 'Vaso de agua fría con gotas de condensación sobre una bandeja metálica', title: 'Agua KM0 | Casa Güell', position: 'center 70%' },
  aquarius: { src: IMG + 'aquarius-limon-hielo-casa-guell.webp', alt: 'Aquarius con hielo y una rodaja de limón en vaso alto', title: 'Aquarius | Casa Güell', position: 'center 65%' },
  'bitter-kas': { src: IMG + 'bitter-kas-hielo-naranja-casa-guell.webp', alt: 'Bitter Kas con hielo y una rodaja de naranja en vaso corto', title: 'Bitter Kas | Casa Güell', position: 'center 75%' },
  'coca-cola-zero': { src: IMG + 'coca-cola-zero-hielo-casa-guell.webp', alt: 'Coca-Cola Zero con hielo en vaso alto', title: 'Coca-Cola Zero | Casa Güell', position: 'center 100%' },
  'fanta-naranja-limon': { src: IMG + 'fanta-naranja-limon-hielo-casa-guell.webp', alt: 'Fanta de naranja y limón con hielo y una rodaja de naranja en vaso alto', title: 'Fanta naranja y limón | Casa Güell', position: 'center 85%' },
  nestea: { src: IMG + 'nestea-limon-menta-hielo-casa-guell.webp', alt: 'Nestea con hielo, rodaja de limón y hoja de menta en vaso alto', title: 'Nestea | Casa Güell', position: 'center 15%' },
  tonica: { src: IMG + 'tonica-hielo-lima-casa-guell.webp', alt: 'Tónica con hielo, burbujas y piel de lima en vaso alto', title: 'Tónica | Casa Güell', position: 'center 30%' },
  'zumo-de-pina': { src: IMG + 'zumo-de-pina-hielo-casa-guell.webp', alt: 'Zumo de piña con hielo y un triángulo de piña fresca en vaso alto', title: 'Zumo de piña | Casa Güell', position: 'center 55%' },

  // ─── GIN ───
  'bombay-sapphire': { src: IMG + 'gin-tonic-bombay-sapphire-lima-enebro-casa-guell.webp', alt: 'Gin tonic con Bombay Sapphire, hielo, lima y bayas en copa balón', title: 'Gin Bombay Sapphire | Casa Güell', position: 'center 60%' },
  'bulldog-gin': { src: IMG + 'gin-tonic-bulldog-copa-balon-casa-guell.webp', alt: 'Gin tonic con Bulldog Gin, hielo, rodaja de cítrico y pimienta en copa balón', title: 'Gin Bulldog | Casa Güell', position: 'center 30%' },
  'gin-mare': { src: IMG + 'gin-tonic-gin-mare-romero-aceituna-casa-guell.webp', alt: 'Gin tonic con Gin Mare, hielo, romero y aceituna en copa balón', title: 'Gin Mare | Casa Güell', position: 'center 40%' },
  'g-vine-nouaison': { src: IMG + 'gin-tonic-gvine-nouaison-petalo-rosa-casa-guell.webp', alt: 'Gin tonic con G\'Vine Nouaison, hielo, hoja aromática y pétalo de rosa en copa balón', title: 'Gin G\'Vine Nouaison | Casa Güell', position: 'center 15%' },
  'hendrick-s': { src: IMG + 'gin-tonic-hendricks-pepino-rosa-casa-guell.webp', alt: 'Gin tonic con Hendrick\'s, hielo, rodaja de pepino y pétalo de rosa en copa balón', title: 'Gin Hendrick\'s | Casa Güell', position: 'center 30%' },
  'martin-miller-s': { src: IMG + 'gin-tonic-martin-millers-pepino-lima-casa-guell.webp', alt: 'Gin tonic con Martin Miller\'s, hielo, cinta de pepino y rodaja de lima en copa balón', title: 'Gin Martin Miller\'s | Casa Güell', position: 'center 30%' },
  'seagram-s': { src: IMG + 'gin-tonic-seagrams-limon-casa-guell.webp', alt: 'Gin tonic con Seagram\'s, hielo, rodaja de limón y ramita aromática en vaso alto', title: 'Gin Seagram\'s | Casa Güell', position: 'center 55%' },
  tanqueray: { src: IMG + 'gin-tonic-tanqueray-lima-enebro-casa-guell.webp', alt: 'Gin tonic con Tanqueray, hielo, rodaja de lima y bayas de enebro en copa balón', title: 'Gin Tanqueray | Casa Güell', position: 'center 25%' },

  // ─── RON ───
  'bacardi-carta-blanca': { src: IMG + 'ron-bacardi-carta-blanca-lima-casa-guell.webp', alt: 'Ron Bacardí Carta Blanca con hielo y una rodaja de lima en vaso corto', title: 'Ron Bacardí Carta Blanca | Casa Güell', position: 'center 100%' },
  brugal: { src: IMG + 'ron-brugal-hielo-naranja-casa-guell.webp', alt: 'Ron Brugal con hielo y una rodaja de naranja en vaso corto', title: 'Ron Brugal | Casa Güell', position: 'center 90%' },
  'havana-club-7': { src: IMG + 'ron-havana-club-7-anos-canela-naranja-casa-guell.webp', alt: 'Ron Havana Club 7 años con hielo, piel de naranja y rama de canela en vaso corto', title: 'Ron Havana Club 7 años | Casa Güell', position: 'center 75%' },
  'santa-teresa-1796': { src: IMG + 'ron-santa-teresa-1796-copa-anis-estrellado-casa-guell.webp', alt: 'Ron Santa Teresa 1796 en copa balón con piel de naranja y anís estrellado', title: 'Ron Santa Teresa 1796 | Casa Güell', position: 'center 100%' },
  'santa-teresa-gran-reserva': { src: IMG + 'ron-santa-teresa-gran-reserva-piel-naranja-casa-guell.webp', alt: 'Ron Santa Teresa Gran Reserva en copa balón con piel de naranja en el borde', title: 'Ron Santa Teresa Gran Reserva | Casa Güell', position: 'center 35%' },
  'zacapa-23': { src: IMG + 'ron-zacapa-23-vainilla-naranja-casa-guell.webp', alt: 'Ron Zacapa 23 en copa balón con piel de naranja y una vaina de vainilla', title: 'Ron Zacapa 23 | Casa Güell', position: 'center 50%' },

  // ─── WHISKY ───
  'ballantine-s': { src: IMG + 'whisky-ballantines-hielo-casa-guell.webp', alt: 'Whisky Ballantine\'s con un cubo de hielo en vaso corto', title: 'Whisky Ballantine\'s | Casa Güell', position: 'center 80%' },
  'cardhu-12': { src: IMG + 'whisky-cardhu-12-anos-copa-cata-casa-guell.webp', alt: 'Whisky Cardhu 12 años servido en copa de cata', title: 'Whisky Cardhu 12 años | Casa Güell', position: 'center 50%' },
  'dewar-s-12': { src: IMG + 'whisky-dewars-12-anos-piel-naranja-casa-guell.webp', alt: 'Whisky Dewar\'s 12 años en copa con piel de naranja', title: 'Whisky Dewar\'s 12 años | Casa Güell', position: 'center 65%' },
  'dewar-s-white-label': { src: IMG + 'whisky-dewars-white-label-hielo-casa-guell.webp', alt: 'Whisky Dewar\'s White Label con hielo en vaso corto', title: 'Whisky Dewar\'s White Label | Casa Güell', position: 'center 80%' },
  'glenrothes-12': { src: IMG + 'whisky-glenrothes-12-anos-copa-cata-casa-guell.webp', alt: 'Whisky Glenrothes 12 años servido en copa de cata', title: 'Whisky Glenrothes 12 años | Casa Güell', position: 'center 30%' },
  'hibiki-japanese-harmony': { src: IMG + 'whisky-hibiki-japanese-harmony-copa-cata-casa-guell.webp', alt: 'Whisky japonés Hibiki Japanese Harmony servido en copa de cata', title: 'Whisky Hibiki Japanese Harmony | Casa Güell', position: 'center 40%' },
  'j-b': { src: IMG + 'whisky-jb-hielo-casa-guell.webp', alt: 'Whisky J&B con hielo en vaso corto', title: 'Whisky J&B | Casa Güell', position: 'center 90%' },
  'jack-daniel-s': { src: IMG + 'whisky-jack-daniels-hielo-casa-guell.webp', alt: 'Whisky Jack Daniel\'s con hielo en vaso corto', title: 'Whisky Jack Daniel\'s | Casa Güell', position: 'center 80%' },
  'macallan-12': { src: IMG + 'whisky-macallan-12-anos-copa-cata-casa-guell.webp', alt: 'Whisky Macallan 12 años en copa de cata con piel de naranja', title: 'Whisky Macallan 12 años | Casa Güell', position: 'center 25%' },
  tomatin: { src: IMG + 'whisky-tomatin-copa-cata-casa-guell.webp', alt: 'Whisky Tomatin servido en copa de cata', title: 'Whisky Tomatin | Casa Güell', position: 'center 85%' },

  // ─── TEQUILA ───
  'patron-reposado': { src: IMG + 'tequila-patron-reposado-botella-casa-guell.webp', alt: 'Botella de tequila Patrón Reposado con su etiqueta y tapón de corcho', title: 'Tequila Patrón Reposado | Casa Güell', position: 'center 40%' },
  'patron-silve': { src: IMG + 'tequila-patron-silver-vaso-metalico-lima-casa-guell.webp', alt: 'Tequila Patrón Silver en vaso metálico con una rodaja de lima', title: 'Tequila Patrón Silver | Casa Güell', position: 'center 100%' },
  'patron-xo-cafe': { src: IMG + 'tequila-patron-xo-cafe-hielo-casa-guell.webp', alt: 'Patrón XO Café con un cubo de hielo en vaso corto', title: 'Patrón XO Café | Casa Güell', position: 'center 100%' },
  'tequila-jose-cuervo': { src: IMG + 'tequila-jose-cuervo-sal-lima-casa-guell.webp', alt: 'Chupito de tequila José Cuervo con borde de sal y un gajo de lima', title: 'Tequila José Cuervo | Casa Güell', position: 'center 45%' },

  // ─── VODKA ───
  absolut: { src: IMG + 'vodka-absolut-hielo-piel-limon-casa-guell.webp', alt: 'Vodka Absolut con hielo y piel de limón en vaso corto', title: 'Vodka Absolut | Casa Güell', position: 'center 85%' },
  'grey-goose': { src: IMG + 'vodka-grey-goose-hielo-lima-casa-guell.webp', alt: 'Vodka Grey Goose con hielo y una rodaja de lima en vaso corto', title: 'Vodka Grey Goose | Casa Güell', position: 'center 60%' },

  // ─── DIGESTIVOS ───
  'pacharan-baines-etiq-oro': { src: IMG + 'pacharan-baines-etiqueta-oro-copa-casa-guell.webp', alt: 'Pacharán Baines etiqueta oro servido en copa, con una endrina al lado', title: 'Pacharán Baines etiqueta oro | Casa Güell', position: 'center 75%' }
}

/** Imágenes sin plato correspondiente en la carta actual (reservadas para futuro). */
// espaldita-cordero-asada-patatas-padron-casa-guell.webp
// tarta-queso-cremosa-helado-casa-guell.webp
// ostra-fresca-lima-casa-guell.webp
// tarrina-crujiente-salsa-roja-guindilla-casa-guell.webp  (2.ª foto de la tarrina: el plato usa la de la oreja)

/** Otras grafías del mismo plato → clave canónica de DISH_MEDIA. */
const ALIASES: Record<string, string> = {
  'patron-silver': 'patron-silve',
  'agua-km0': 'agua-kmo',
  'salve-0-0-tostada': 'salve-0-0-tostada-bot',
  'pacharan-baines-etiqueta-oro': 'pacharan-baines-etiq-oro',
  'aperol-spritz': 'aperol',
  'fanta-naranjalimon': 'fanta-naranja-limon'
}

export function dishMedia (nombre: string): DishMedia | undefined {
  const s = slug(nombre)
  return DISH_MEDIA[ALIASES[s] ?? s]
}

/**
 * Versiones reducidas de cada foto (mismo nombre en subcarpetas): `thumb` 160 px para filas y buscador,
 * `preview` 450 px para la vista previa al pasar el cursor. La foto original queda para usos grandes.
 */
export const dishThumb = (src: string) => src.replace('/dishes/', '/dishes/thumb/')
export const dishPreview = (src: string) => src.replace('/dishes/', '/dishes/preview/')
