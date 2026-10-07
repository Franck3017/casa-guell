---
name: Casa Güell
description: Carta de papel cálida, serif editorial y un único azul de loza catalana, en versión de día y de noche.
colors:
  cream: "#FAF8F5"
  surface: "#FEFDFB"
  linen: "#E5E2DC"
  ink: "#111215"
  carbon: "#171717"
  stone: "#737373"
  brand: "#1D4ED8"
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
    fontSize: "clamp(3.5rem, 7.3vw, 5.9rem)"
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
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.06
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
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "40px"
  menu-category:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  input-field:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  reserve-modal:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "32px"
---

# Design System: Casa Güell

## Overview

**Creative North Star: "La carta de papel"**

Casa Güell se lee como una carta impresa en una mesa de Sant Martí: papel crema de día, papel carbón de noche, tinta casi negra y un único azul de loza que aparece solo donde algo se puede tocar o merece atención. La voz tipográfica es editorial, una serif de contraste para titulares con Inter para leer y Space Mono para los pequeños rótulos de imprenta (precios, categorías, alérgenos). El plato fotografiado es siempre lo más vivo de la pantalla; la interfaz se queda en papel.

La densidad es cómoda y de ritmo lento: secciones con mucho aire vertical, líneas de texto cortas, listas de carta a dos columnas con puntos guía entre nombre y precio. El tema oscuro no es una inversión mecánica sino la misma carta de noche: el cambio se funde por interpolación de tokens, no salta.

**Key Characteristics:**
- Papel cálido en dos versiones, con alternancia sutil de franjas lino entre secciones.
- Un solo acento, el azul de marca, reservado a hover, foco, selección y detalles clave.
- Serif editorial para titulares; mono pequeño en mayúsculas para datos de carta.
- Plano y tonal: la profundidad la dan las capas de papel, no las sombras.
- Botones en píldora; campos, tarjetas y modales de esquinas rectas.

## Colors

Papel cálido, tinta casi negra y un único azul de loza catalana; en oscuro las mismas funciones con valores nocturnos.

### Primary
- **Azul de la loza catalana** (#1D4ED8 de día, #5B9BE0 de noche): el único acento. Hover de botones, anillo de foco, selección de texto, elemento activo de carta, palabra "Casa" del logotipo y énfasis en cursiva del titular. El azul nocturno es más claro para mantener contraste AA sobre fondo oscuro.

### Neutral
- **Papel crema** (#FAF8F5 / noche #0B0B0C): fondo de página y de cabecera.
- **Superficie de mesa** (#FEFDFB / noche #151517): tarjetas elevadas y modal de reserva; en noche se eleva por luminancia, no por sombra.
- **Lino** (#E5E2DC / noche #161618): franjas alternas de sección y panel lateral del hero.
- **Tinta** (#111215 / noche #F5F3EE): texto principal y botón primario; los grises de apoyo son tinta a 40–70% de opacidad.
- **Carbón** (#171717 / noche #E5E2DC): texto de énfasis secundario.
- **Piedra** (#737373 / noche #909090): texto atenuado y metadatos.

### Named Rules
**The One Blue Rule.** El azul de marca nunca es relleno de superficie grande; solo toca lo interactivo, el foco y un puñado de detalles de identidad por pantalla.

**The Paper Pair Rule.** Cada token de color existe en versión de día y de noche; un color nuevo se define siempre en ambos temas.

## Typography

**Display Font:** Playfair Display (con Iowan Old Style, Baskerville, Georgia, serif)
**Body Font:** Inter (con Avenir Next, Segoe UI, sans-serif)
**Label/Mono Font:** Space Mono (con SFMono-Regular, Consolas, monospace)

**Character:** una serif de alto contraste con tracking apretado para la voz de la casa, sobre una sans neutra para leer y un mono diminuto en mayúsculas que recuerda a una máquina de tickets de cocina.

### Hierarchy
- **Display** (400, clamp(3.5rem, 7.3vw, 5.9rem), 1.02): titular del hero, con una palabra en cursiva azul.
- **Headline** (400, clamp(2.5rem, 5vw, 4.25rem), 0.99): títulos de sección, ancho máximo ~19ch.
- **Title** (400, 1.5rem, 1.06): títulos de modal y de bloque.
- **Body** (400, 1rem, 1.65): texto corrido, líneas de 50–62ch; escala compartida de 13px, 15px y 16px para controles y copia.
- **Label** (400, 9–11px, tracking 0.1–0.22em, mayúsculas): categorías de carta, precios, alérgenos, etiquetas de formulario; cifras tabulares.

### Named Rules
**The Printed Label Rule.** Precios, categorías y datos de alérgenos van siempre en Space Mono; el resto de la interfaz nunca usa mono.

## Layout

Contenedor centrado de 72–90rem (max-w-6xl a 1440px según la sección) con márgenes laterales de 16–48px. El hero es una rejilla asimétrica 0,94fr / 1,06fr con panel lino a la derecha en escritorio; las secciones intermedias usan franjas de ancho completo con filete superior e inferior. La carta se organiza en dos columnas con puntos guía entre nombre y precio.

El ritmo vertical es generoso: bloques de 80–96px entre secciones, 24–48px dentro. La navegación es una barra fija de 4,35rem con una segunda fila desplazable en móvil. Todo se adapta con breakpoints de Tailwind (md 768px, lg 1024px); los objetivos táctiles miden al menos 40px.

## Elevation & Depth

Sistema plano y tonal. Las superficies se distinguen por capa de papel (crema, superficie, lino) y por filetes de tinta al 10–15% de opacidad. La sombra aparece solo en lo flotante: modal de reserva, buscador y control de tema.

### Shadow Vocabulary
- **Elevación flotante** (`box-shadow: 0 8px 30px rgb(17 18 21 / 0.12)`; noche `0 8px 30px rgb(0 0 0 / 0.55)`): modal de reserva, popovers y botones flotantes.
- **Previsualización de plato** (`box-shadow: 0 16px 40px rgb(17 18 21 / 0.25)`): miniatura que sigue al cursor sobre un plato.

### Named Rules
**The Flat-By-Default Rule.** En reposo las superficies no llevan sombra; solo lo que flota sobre el contenido la recibe.

## Shapes

Dos lenguajes conviven con intención: lo que se pulsa es una píldora (botones, enlaces de navegación, botones flotantes circulares) y lo que se rellena o se lee es rectangular (campos, tarjetas, modal, imágenes con 2px de radio). Los filetes son de 1px en tinta atenuada y el punteado de la carta usa borde punteado de 1px.

## Components

### Buttons
- **Shape:** píldora completa (9999px), altura mínima 40–48px.
- **Primary:** fondo tinta (#111215), texto crema, Inter 13–14px semibold, relleno horizontal 16–24px.
- **Hover / Focus:** el fondo pasa a azul de marca en 200ms; anillo de foco de 2px azul con desplazamiento de 2–4px.
- **Secondary:** enlace con subrayado de tinta al 25% y desplazamiento de 8px; en hover el texto y el subrayado se vuelven azules y la flecha se mueve en diagonal.

### Navigation
- Barra fija con fondo crema al 95%, filete inferior de tinta al 10% y barra de progreso de scroll. Jerarquía: reservar (botón primario, siempre visible) y las cuatro secciones; buscar plato e idioma son ocasionales y van recogidos. Enlaces en píldora de 40px: activo con fondo tinta al 6%, inactivo en tinta al 60% que sube a tinta en hover. Buscador: icono de 40px que se expande por encima de la cabecera al enfocarlo. Idioma: botón con el idioma actual y lista desplegable (esquinas rectas). Escritorio: una fila con las secciones centradas. Móvil: fila 1 con marca, buscador, idioma y reservar; fila 2 con las cuatro secciones a partes iguales, sin scroll.

### Chips / Category filters
- Categorías de carta en Space Mono 11px, mayúsculas, tracking 0,2em, separadas por filete inferior de tinta al 15%; la activa se subraya y se tiñe de tinta, las inactivas bajan de opacidad. Subfiltros en Inter 12px.

### Menu items
- Fila con miniatura de 48px (radio 2px), nombre en Inter 15px medium, puntos guía, precio en mono y alérgenos en mono 10px mayúsculas al 40%.

### Inputs / Fields
- **Style:** fondo transparente, borde de 1px en tinta al 15%, esquinas rectas, relleno 8px 12px, texto 14px.
- **Focus:** el borde pasa a azul de marca; etiqueta superior en mono 10px mayúsculas.

### Reserve modal
- Superficie de mesa (#FEFDFB), borde de tinta al 10%, 32px de relleno, ancho máximo 28rem, con velo de tinta al 40% y desenfoque del fondo; es el único elemento elevado de lectura.

### Theme toggle
- Control circular flotante con superficie al 90%, borde de tinta al 15% y desenfoque, que se expande en vertical para elegir claro, oscuro o sistema.

## Do's and Don'ts

### Do:
- **Do** usar el azul de marca solo en interacción, foco, selección y detalles de identidad.
- **Do** definir cada color nuevo en versión de día y de noche.
- **Do** poner precios, categorías y alérgenos en Space Mono mayúsculas con tracking amplio.
- **Do** usar píldora para lo pulsable y esquinas rectas para campos, tarjetas y modal.
- **Do** distinguir capas con papel (crema, superficie, lino) y filetes de tinta al 10–15%.
- **Do** respetar `prefers-reduced-motion`: toda animación decorativa debe poder apagarse.

### Don't:
- **Don't** rellenar secciones grandes con el azul de marca.
- **Don't** añadir sombras a tarjetas en reposo; la sombra es solo para lo flotante.
- **Don't** usar la serif display por debajo de títulos de bloque ni el mono para texto corrido.
- **Don't** cambiar el nombre Casa Güell, la paleta existente ni la voz centrada en el producto (compromisos de marca de PRODUCT.md).
- **Don't** introducir un segundo acento de color.
