---
name: Casa Güell
description: Carta de papel cálida, serif editorial y un único azul de loza catalana, con el papel hecho objeto (canto rasgado, papel de bandeja, tique) y trazos a mano, de día y de noche.
colors:
  cream: "#FAF8F5"
  surface: "#FEFDFB"
  linen: "#E5E2DC"
  ink: "#111215"
  carbon: "#171717"
  stone: "#737373"
  brand: "#1D4ED8"
  chalk: "#FAF8F5"
  night-cream: "#0B0B0C"
  night-linen: "#161618"
  night-surface: "#151517"
  night-ink: "#F5F3EE"
  night-carbon: "#E5E2DC"
  night-stone: "#909090"
  night-brand: "#5B9BE0"
typography:
  display:
    fontFamily: "Playfair Display, Iowan Old Style, Baskerville, Georgia, serif"
    fontSize: "clamp(2.75rem, 7.3vw - 1.25rem, 5.9rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Playfair Display, Iowan Old Style, Baskerville, Georgia, serif"
    fontSize: "clamp(2.5rem, 5vw, 4.25rem)"
    fontWeight: 400
    lineHeight: 0.99
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Playfair Display, Iowan Old Style, Baskerville, Georgia, serif"
    fontSize: "clamp(1.5rem, 2.4vw, 2rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter, Avenir Next, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "-0.012em"
  label:
    fontFamily: "Space Mono, SFMono-Regular, Consolas, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0.2em"
rounded:
  none: "0"
  sm: "2px"
  lg: "8px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  xl: "96px"
  2xl: "128px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.cream}"
  button-on-brand:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-on-brand-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "44px"
  menu-category:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    height: "44px"
  menu-subfilter:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "32px"
  menu-subfilter-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
  input-field:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "48px"
  reserve-modal:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "32px"
    width: "28rem"
  receipt:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "28px 24px 40px"
    width: "24rem"
---

# Design System: Casa Güell

## Overview

**Creative North Star: "La carta de papel"**

Casa Güell se lee como una carta impresa en una mesa de Sant Martí: papel crema de día, papel carbón de noche, tinta casi negra y un único azul de loza. La voz tipográfica es editorial, una serif de contraste para titulares con Inter para leer y Space Mono para los rótulos de imprenta. El plato fotografiado es siempre lo más vivo de la pantalla; la interfaz se queda en papel.

El papel no es solo un color de fondo: es un objeto. Las franjas tintadas se separan con un canto rasgado y no con una regla recta; el papel de bandeja impreso con "Casa Güell" (el mismo sobre el que se sirven los platos) reaparece como textura; el horario y la cita del chef van en tiques de caja con el borde dentado. Encima del papel trabaja una mano: una pluma azul traza marcos, sombreados y subrayados, y una tiza blanca anota las fotos.

El azul se reserva para lo que se puede tocar, para la identidad y para el trazo de pluma, y solo rellena superficie en dos momentos de marca: el pie y la pieza animada de la portada. El movimiento forma parte del mundo: lo que entra se dibuja, se descubre o sube desde detrás de una máscara, como al imprimir o al escribir, y todo se apaga con `prefers-reduced-motion`. El tema oscuro no es una inversión mecánica sino la misma carta de noche: el cambio se funde por interpolación de tokens, no salta.

**Key Characteristics:**
- Papel cálido en dos versiones (día y noche), con franjas lino separadas por canto rasgado.
- Un solo acento, el azul de marca: interacción, identidad, trazo de pluma y dos superficies de marca.
- Serif editorial para titulares; mono pequeño en mayúsculas para los rótulos de imprenta.
- El papel como objeto: canto rasgado, papel de bandeja impreso, tique dentado, grano fijo.
- Trazo a mano: pluma azul sobre papel, tiza blanca sobre foto.
- Plano y tonal: la sombra es solo para lo que flota y para el papel apoyado sobre una foto o el mapa.
- Botones en píldora; campos, tiques, modales y fotos de esquinas rectas.
- Cada sección tiene su propio esqueleto: ninguna repite la composición de la anterior.

## Colors

Papel cálido, tinta casi negra y un único azul de loza catalana; en oscuro las mismas funciones con valores nocturnos.

### Primary
- **Azul de la loza catalana** (#1D4ED8 de día, #5B9BE0 de noche): el único acento. Hover de botones, anillo de foco, selección de texto, sección activa en el menú móvil, palabra "Casa" del logotipo, la frase en cursiva del titular, los trazos de pluma, los iconos pequeños que acompañan una acción y el filete bajo el teléfono de Mercado. También es la tinta del papel de bandeja. Como relleno aparece solo en el bloque del pie y en las escenas de la pieza animada. El azul nocturno es más claro para mantener contraste AA sobre fondo oscuro.

### Neutral
- **Papel crema** (#FAF8F5 / noche #0B0B0C): fondo de página, de cabecera y de la hoja del menú móvil.
- **Superficie de mesa** (#FEFDFB / noche #151517): lo que se apoya o flota sobre la página: modal de reserva, resultados del buscador, lista de idiomas, tiques y la etiqueta del mapa. En noche se eleva por luminancia, no por sombra.
- **Lino** (#E5E2DC / noche #161618): franja de Mercado (al 40%), hoja de papel de bandeja del hero (al 70%) y hueco del mapa mientras carga.
- **Tinta** (#111215 / noche #F5F3EE): texto principal y botón primario; los grises de apoyo son tinta al 60–70% de opacidad, los filetes tinta al 10–20%.
- **Carbón** (#171717 / noche #E5E2DC): texto de énfasis secundario.
- **Piedra** (#737373 / noche #909090): texto atenuado y metadatos.
- **Tiza** (#FAF8F5, igual de día y de noche): anotaciones a mano dibujadas encima de una foto. No cambia con el tema porque la foto tampoco cambia.

### Named Rules
**The One Blue Rule.** Hay un solo acento. El azul rellena superficie únicamente en los dos momentos de marca, el bloque del pie y las escenas de la pieza animada; en cualquier otro sitio solo toca lo interactivo, el foco, la identidad y el trazo de pluma.

**The Paper Pair Rule.** Cada token de color existe en versión de día y de noche; un color nuevo se define siempre en ambos temas. La única excepción es la tiza, que vive sobre fotos.

**The Ink-On-Blue Rule.** Sobre el azul, el texto usa el token crema (de noche resulta tinta oscura sobre azul claro) y los secundarios son ese mismo token al 85%, nunca un gris.

## Typography

**Display Font:** Playfair Display (con Iowan Old Style, Baskerville, Georgia, serif)
**Body Font:** Inter (con Avenir Next, Segoe UI, sans-serif)
**Label/Mono Font:** Space Mono (con SFMono-Regular, Consolas, monospace)

**Character:** una serif de alto contraste con tracking apretado para la voz de la casa, sobre una sans neutra para leer y un mono diminuto en mayúsculas que recuerda a una máquina de tickets de cocina. Las tres familias van alojadas en el propio proyecto (Fontsource), no se piden a Google.

### Hierarchy
- **Display** (400, clamp(2.75rem, 7.3vw - 1.25rem, 5.9rem) en escritorio y clamp(3rem, 14.5vw, 3.5rem) en móvil, 1.02): titular del hero, con una frase en cursiva azul subrayada a pluma. El titular del pie usa la misma voz (clamp(3rem, 7.4vw, 5.75rem)).
- **Headline** (400, clamp(2.5rem, 5vw, 4.25rem), 0.99): títulos de sección, ancho máximo ~19ch, equilibrados. El teléfono de Mercado usa esta voz en cifras (clamp(2.5rem, 4.6vw, 3.5rem)).
- **Title** (400, clamp(1.5rem, 2.4vw, 2rem), 1.1): títulos de bloque (pilares, boletín, modal) y la cita del chef, en cursiva.
- **Body** (400, 1rem, 1.65): texto corrido, líneas de 44–52ch; escala compartida de 13px, 15px y 16px para controles y copia. Los párrafos de entrada suben a 18px en escritorio.
- **Label** (400, 11px, tracking 0.1–0.25em, mayúsculas): categorías de carta, etiquetas de campo, pies de foto, rótulo de idioma y pie legal; cifras tabulares. Los precios van en mono a 15px sin mayúsculas.

### Named Rules
**The Printed Label Rule.** Space Mono es la voz de imprenta: precios, categorías, alérgenos, etiquetas de campo, pies de foto y todo lo que va dentro de un tique. Nunca texto corrido.

**The Whole Phrase Rule.** La frase en cursiva azul del titular nunca se parte en dos líneas. Si en un idioma es más larga, el titular entero reduce su tamaño en proporción; el titular no pasa de tres líneas en ningún ancho.

## Layout

Página de una sola columna de secciones, con contenedores centrados y tres franjas a todo el ancho. El contenedor base mide 72rem (Carta, Mercado, cabecera de Ubicación, pie) y sube a 80rem en la cabecera y en Filosofía; el hero llega a 1440px. Márgenes laterales de 24px (16px en la barra móvil), que en el hero suben a 40–48px.

Cada sección tiene un esqueleto distinto, y ninguna repite el de la anterior:
- **Hero:** rejilla asimétrica 0,82fr / 1,18fr a la altura de la pantalla (`100svh`), con el texto a la izquierda y un collage a la derecha (hoja de papel de bandeja girada y retrato). El collage se dimensiona también por el alto de la pantalla para que su pie de foto quepa siempre. Detrás, el logotipo a 15,5vw como rótulo de fondo.
- **Filosofía:** retrato a 6 columnas con la nota del chef montada sobre su esquina, y los pilares en 5 columnas que se quedan fijos mientras pasa la foto.
- **Pieza animada:** franja a todo el ancho entre dos cantos rasgados.
- **Carta:** una columna que se abre con un filete doble; la lista va a dos columnas con puntos guía entre nombre y precio.
- **Mercado:** franja lino en dos alturas. Arriba, texto a 5 columnas y dos fotos alineadas por abajo a 7; el filete del teléfono queda a la altura del pie de las fotos. Debajo, la tira del boletín con las mismas columnas.
- **Ubicación:** título y cómo llegar arriba; debajo, el mapa de lado a lado, pegado al pie.
- **Pie:** bloque azul a todo el ancho con el canto rasgado sobre el mapa.

El ritmo vertical es generoso: 96px arriba y abajo en móvil y 128px en escritorio (80–96px en Carta), y 24–48px dentro de cada bloque. La cabecera es una barra fija: en escritorio (desde 1024px) mide 4,35rem y lleva las cuatro secciones centradas; por debajo mide 56px y solo lleva marca, buscar, reservar y el botón de menú, que abre un panel a pantalla completa. Desde 1280px un raíl de marcas finas a la derecha indica la sección actual. Breakpoints de Tailwind (sm 640px, md 768px, lg 1024px, xl 1280px). Los objetivos táctiles miden al menos 44px y los botones principales 48px. La página reserva siempre el hueco de la barra de scroll, para que abrir el menú o el modal no mueva nada de lado.

## Elevation & Depth

Sistema plano y tonal. Las superficies se distinguen por capa de papel (crema, superficie, lino), por filetes de tinta al 10–20% y por el canto rasgado. La sombra aparece en dos casos: lo que flota sobre el contenido y el papel que se apoya encima de una foto o del mapa. Un grano de papel muy leve cubre toda la página en una capa fija, sin eventos.

### Shadow Vocabulary
- **Elevación flotante** (`box-shadow: 0 8px 30px rgb(17 18 21 / 0.12)`; noche `0 8px 30px rgb(0 0 0 / 0.55)`): modal de reserva, lista de idiomas, selector de tema desplegado y etiqueta del mapa.
- **Resultados del buscador** (`box-shadow: 0 12px 30px rgb(17 18 21 / 0.10)`): panel de resultados bajo el campo de búsqueda.
- **Previsualización de plato** (`box-shadow: 0 16px 40px rgb(17 18 21 / 0.25)`): miniatura que sigue al cursor sobre un plato, solo en escritorio.
- **Papel apoyado** (`filter: drop-shadow(0 10px 22px rgb(0 0 0 / 0.22))`; noche `drop-shadow(0 10px 26px rgb(0 0 0 / 0.7))`): la nota del chef sobre el retrato de Filosofía.
- **Halo de tiza** (`filter: drop-shadow(0 0 1.5px rgb(0 0 0 / 0.5))`): contorno oscuro mínimo para que el trazo blanco se lea sobre las zonas claras de la foto.

### Named Rules
**The Flat-By-Default Rule.** En reposo las superficies no llevan sombra. La reciben lo que flota sobre el contenido y el papel que se apoya encima de una foto o del mapa.

**The Masked Paper Rule.** Un tique lleva el borde dentado como máscara, y la máscara recorta cualquier `box-shadow`. Su sombra va siempre en el envoltorio, con `drop-shadow`.

## Shapes

Dos lenguajes conviven con intención: lo que se pulsa es una píldora (botones, enlaces de navegación, subfiltros de la carta, controles circulares de 44px) y lo que se rellena o se lee es rectangular (campos, tiques, modal, fotos). Las fotos van sin radio; solo las miniaturas de plato llevan 2px y el panel de resultados del buscador 8px.

Los bordes del papel son la firma. El **canto rasgado** (20px de alto, un mosaico de 1200px usado como máscara) separa las franjas tintadas y encabeza la hoja del menú móvil. El **borde dentado** (dientes de 7px) cierra por abajo los tiques. Los objetos de papel van ligeramente girados (1,5° a 3°).

Los filetes son de 1px en tinta al 10–20%; el filete que abre un bloque es de 2px en tinta al 60%, y la Carta se abre con un filete doble. Los puntos guía de la carta y del tique son un borde punteado de 1px; dentro de un tique las partes se separan con línea discontinua. El trazo a mano (marcos que se pasan de las esquinas, sombreado en diagonal, subrayado, círculo que no cierra, flecha) es siempre de punta redonda.

## Components

### Buttons
- **Shape:** píldora completa (9999px), 48px de alto en las acciones principales y 44px en la barra.
- **Primary:** fondo tinta (#111215), texto crema, Inter 15px semibold, relleno horizontal 24px, con flecha diagonal en el hero. Es siempre reservar o enviar.
- **Hover / Focus / Active:** el fondo pasa a azul de marca en 200ms; anillo de foco de 2px azul con desplazamiento de 3–4px; al pulsar se encoge al 97% en 140ms.
- **On brand:** sobre el azul del pie el botón es crema con texto tinta, y en hover se invierte a tinta. Es el único control que se deja atraer por el cursor.
- **Secondary:** enlace en Inter 15px semibold con subrayado desplazado 8px (tinta al 25% en el hero, azul en Mercado y Ubicación); en hover el texto se vuelve azul y la flecha se mueve en diagonal.
- **Outlined:** dentro de un tique, rectángulo de 44px con borde de tinta al 60% y rótulo en mono; en hover borde y texto pasan a azul.

### Navigation
- **Barra:** fija, fondo crema al 95%, filete inferior de tinta al 10%. Reservar es la acción principal y está siempre a la vista.
- **Escritorio (desde 1024px):** marca, las cuatro secciones centradas y herramientas (buscar, idioma, tema) en una fila. Enlaces en píldora de 44px, Inter 13px medium: activo con fondo tinta al 6%, inactivo en tinta al 60% que sube a tinta con fondo al 5% en hover.
- **Móvil y tableta:** marca, buscar, reservar (con etiqueta corta por debajo de 420px) y botón de menú de 44px, cuyos dos trazos se cruzan al abrir.
- **Panel de menú:** una hoja de papel crema que baja con el canto rasgado por delante y ocupa toda la pantalla. Las secciones van en serif grande (clamp(2rem, 10vw, 3rem)) entre filetes que se trazan; la sección actual en azul. Debajo, idioma y tema. Cerrar es lo mismo al revés y más deprisa.
- **Buscador:** icono de 44px que al enfocarlo se expande por encima de la barra: 20rem en escritorio, la barra entera de margen a margen por debajo. Campo en mono, borde azul, y panel de resultados sobre superficie con miniatura, nombre resaltado, sección y precio. Atajos `/` y Ctrl+K.
- **Idioma:** botón con el código en mono y una lista desplegable de esquinas rectas; dentro del panel de menú, tres píldoras en fila.
- **Tema:** control circular con superficie al 90% y borde de tinta al 15% que se despliega hacia abajo con claro, auto y oscuro; el cambio se extiende en círculo desde el control. En táctil mide 44px por opción.

### Section title
- Titular de sección en la voz Headline; al entrar en pantalla cada palabra sube desde detrás de su máscara, con una ligera rotación. Sin rótulo pequeño encima y sin numeración.

### Chips / Category filters
- **Categorías de carta:** Space Mono 11px, mayúsculas, tracking 0,2em, 44px de alto, sobre un filete de tinta al 15%; la activa lleva subrayado de 2px en tinta, las inactivas van en tinta al 65%.
- **Subfiltros:** píldoras de 32px en Inter 13px; la activa con fondo tinta y texto crema, las demás en tinta al 70% con fondo al 5% en hover.

### Menu items
- Fila con miniatura de 48px (radio 2px), nombre en Inter 15px medium, puntos guía, precio en mono 15px y alérgenos como iconos en círculos de 24px con borde de tinta al 15%, que pasan a azul en hover. Debajo de cada lista, el recuento en mono.

### Inputs / Fields
- **Style:** fondo transparente, borde de 1px en tinta al 15%, esquinas rectas, 44–48px de alto, texto de 16px en móvil (para que iOS no amplíe la página) y 15px en escritorio; el texto de ejemplo va en tinta al 60%.
- **Label:** encima del campo, en mono 11px mayúsculas, tinta al 60%.
- **Focus / Error:** el borde pasa a azul al enfocar; el error se anuncia con un texto bajo el campo, sin segundo color.
- **Success:** el mensaje sustituye al formulario con un fundido de 200ms.

### Reserve modal
- Superficie de mesa (#FEFDFB), borde de tinta al 10%, 32px de relleno, ancho máximo 28rem, con velo de tinta al 40% y desenfoque del fondo. Entra en 200ms con un leve aumento de escala. Es el único elemento elevado de lectura.

### Receipt (tique y nota)
- Papel de superficie con el borde inferior dentado, texto en mono, partes separadas con línea discontinua y filas con puntos guía entre concepto y dato. Hay dos: "la cuenta" del pie (logotipo, dirección, horario, teléfono, redes y un botón de contorno), girada 2° sobre el azul, y la nota del chef de Filosofía, con la cita en serif cursiva, girada 1,5° y montada sobre la foto.

### Torn edge y papel de bandeja
- **Canto rasgado:** arriba y abajo de cada franja tintada (Mercado, pieza animada, mapa, pie). Muerde la franja con el color de la página y dibuja el canto con un hilo de tinta al 16%.
- **Papel de bandeja:** el estampado "Casa Güell" en varios giros, en azul al 17–20% sobre papel y en crema al 10–11% sobre azul. Se usa en la hoja del hero, en el pie (difuminado hacia un lado) y en la primera escena de la pieza animada; se desliza despacio con el scroll.

### Pluma y tiza
- **Pluma (azul):** al cargar, traza el marco de la hoja de papel del hero y enmarca el retrato, que está a la vista desde el primer instante, y se retira; después subraya la frase del titular.
- **Tiza (blanca):** con la foto ya puesta, rodea el plato de la semana, tira una flecha hasta su pie y el pie se escribe de izquierda a derecha. En reposo suben del plato tres hilos de vapor cada pocos segundos. En móvil no hay flecha y el trazo es más grueso. Las coordenadas dependen de la foto concreta.

### Pieza animada
- Franja a todo el ancho con seis escenas apiladas que se destapan una sobre otra (círculo, cortina, polígono) en un bucle de unos 17 segundos: cinco frases de la casa, cada una con un gráfico que la cuenta, y el logotipo. La tipografía va en unidades del ancho de la pieza, así que escala entera. Solo corre mientras está en pantalla, tiene un botón de pausa de 44px y con movimiento reducido queda fija en el logotipo.

### Mapa
- De lado a lado, 460px de alto en móvil y 600px en escritorio, con canto rasgado arriba y pegado al pie. El marcador es el logotipo en una etiqueta de superficie clavada con un hilo y un punto azul; la manzana del restaurante va en azul al 16%. La rueda y el dedo siguen desplazando la página: para mover el mapa hace falta Ctrl + rueda o dos dedos.

## Do's and Don'ts

### Do:
- **Do** usar el azul de marca en interacción, foco, selección, identidad y trazo de pluma, y como relleno solo en el pie y en la pieza animada.
- **Do** definir cada color nuevo en versión de día y de noche; la tiza es la única excepción.
- **Do** poner precios, categorías, alérgenos, etiquetas de campo y pies de foto en Space Mono.
- **Do** usar píldora para lo pulsable y esquinas rectas para campos, tiques, modal y fotos.
- **Do** separar las franjas tintadas con el canto rasgado y distinguir capas con papel (crema, superficie, lino) y filetes de tinta al 10–20%.
- **Do** anotar las fotos en tiza blanca y el papel en pluma azul.
- **Do** dar a cada sección un esqueleto propio, distinto del de la sección anterior.
- **Do** mantener reservar siempre a la vista en la cabecera, con objetivos táctiles de 44px o más.
- **Do** respetar `prefers-reduced-motion`: toda animación debe tener un estado fijo completo, y lo que se mueve solo debe poder pausarse.

### Don't:
- **Don't** rellenar con azul ninguna superficie que no sea el pie o la pieza animada.
- **Don't** añadir sombras a lo que está en reposo sobre el papel; la sombra es para lo que flota y para el papel apoyado sobre una foto o el mapa.
- **Don't** poner `box-shadow` a un tique: su máscara la recorta.
- **Don't** usar la serif display por debajo de títulos de bloque ni el mono para texto corrido.
- **Don't** poner un rótulo pequeño ni un número de sección encima de un titular.
- **Don't** partir en dos líneas la frase en cursiva del titular.
- **Don't** cambiar el nombre Casa Güell, la paleta existente ni la voz centrada en el producto (compromisos de marca de PRODUCT.md).
- **Don't** introducir un segundo acento de color.
