---
format: 1920x1080
duration: 30s
message: "En Casa Güell se cocina lo que el mercado trae cada mañana, sin maquillaje: reserva tu mesa"
arc: Feature-Benefit Cascade (gancho → la cuenta de lo que te llevas → reserva → firma)
audience: comensales de Barcelona y visitantes que buscan dónde comer cocina catalana
mode: autonomous
music: none
---

## Video direction

- **Paleta (de `frame.md`, nada inventado):** `bg-primary` es el papel crema y el fondo de casi todo; `text-primary` la tinta; `accent` (azul) solo en la frase en cursiva, el trazo de pluma, los rótulos y como fondo completo del fotograma de reserva, que es el único momento de marca en azul; `bg-secondary` (lino) para la sombra de papel; `line` para filetes. El tique es papel de superficie (un punto más claro que el crema). Las anotaciones sobre fotos van en tiza blanca.
- **Tipografía por función:** display (Playfair) para titulares y para el teléfono; body (Inter) para una línea de apoyo como mucho; label / micro (Space Mono) para todo lo que va dentro del tique.
- **Gramática de movimiento:** todo entra como se imprime o se escribe: las palabras suben desde detrás de su máscara, las líneas del tique aparecen de izquierda a derecha a golpes de cabezal, los trazos se dibujan, las fotos se descubren de abajo arriba. Curvas largas (`power3` / `power4`), sin rebotes. El vídeo es mudo: cada pieza aparece en su golpe, repartida por todo el plano, nunca todo al principio.
- **Ritmo y quietud:** el fotograma 2 es el largo y el que más trabaja; el 1 y el 4 acaban en una lectura quieta. Durante una espera no se mueve nada salvo, como mucho, el papel de bandeja deslizándose muy despacio.
- **Lista negra:** nada de planos de comida a cámara lenta, destellos, degradados, sombras duras, emojis ni iconos decorativos; nada de datos que no estén en la web; ni pase de diapositivas (todo de golpe y luego congelado) ni salvapantallas (todo flotando por su cuenta).

## Frame 1 — Sin maquillaje

- scene: El titular de la casa se escribe sobre papel crema y la pluma lo subraya; a la derecha se descubre el retrato del chef con el plato rodeado a tiza
- voiceover: ""
- duration: 5s
- poster: 4.5s
- transition_in: cut
- status: animated
- src: compositions/frames/01-hook.html
- type: hook
- persuasion: Negative contrast (cocina sin disfraz frente a la cocina de escaparate)
- beat: intriga + apetito
- blueprint: kinetic-type-beats (Adapt)
- asset_candidates: assets/chef-brioche.webp — retrato vertical del chef Jordi presentando la bandeja con el brioche tostado con tobico; assets/logo-casa.webp — palabra "Casa" del logotipo, silueta para rellenar de azul; assets/logo-guell.webp — palabra "Güell" del logotipo, silueta para rellenar de tinta
- focal: assets/chef-brioche.webp
- roles: chef-brioche = cutout (retrato enmarcado a la derecha, el texto va a su izquierda) · logo-casa + logo-guell = supporting (logotipo pequeño arriba a la izquierda)

narrativeRole: abre con la promesa de la casa en el lenguaje del comensal: aquí se come de verdad, sin disfraz.
keyMessage: tradición catalana, sin maquillaje.

Adapt: se conserva la frase que se construye por golpes hasta un remate; el remate no es un salto de escala sino la foto real que se descubre, porque la prueba de "sin maquillaje" es enseñar el plato tal cual.
Scene 1 (0.0–1.5s): papel crema liso; arriba a la izquierda el logotipo pequeño ya está puesto. "Tradición catalana," sube palabra a palabra desde detrás de su máscara (waterfall-entry), en display grande, alineado a la izquierda y ocupando la mitad izquierda del cuadro, algo por encima del centro.
Scene 2 (1.5–3.0s): debajo, "sin maquillaje" en cursiva azul se escribe de izquierda a derecha y, al terminar, la pluma traza su subrayado (svg-path-draw). Asimétrico 55/45; la mitad derecha sigue vacía.
Scene 3 (3.0–5.0s): en la mitad derecha se descubre de abajo arriba el retrato del chef, vertical y a casi toda la altura útil; con la foto ya puesta, una tiza blanca rodea la bandeja (svg-path-draw) y debajo del retrato se escribe en mono "Brioche tostado con tobico". Lectura quieta hasta el corte.

## Frame 2 — La cuenta

- scene: Un tique de caja baja por la izquierda y se va imprimiendo línea a línea con lo que te llevas, mientras a la derecha pasan las fotos reales de la casa
- voiceover: ""
- duration: 13s
- poster: 11.5s
- transition_in: crossfade
- status: animated
- src: compositions/frames/02-la-cuenta.html
- type: benefit_highlight
- persuasion: Value stacking (la cuenta no suma precios, suma lo que recibes) + Show-don't-tell proof
- beat: confianza + apetito
- blueprint: fixed-anchor-cycle (Adapt)
- asset_candidates: assets/mercat2.webp — el chef mirando con sorpresa una caja azul llena de cigalas frescas; assets/una-cigala-fresca-sostenida-en-la-mano-s.webp — una cigala fresca sostenida en la mano sobre un plato, en la cocina; assets/el-chef-con-un-plato-de-bolets-de-tempor.webp — el chef en la sala con un plato de setas de temporada; assets/logo-casa.webp — palabra "Casa" del logotipo; assets/logo-guell.webp — palabra "Güell" del logotipo
- focal: assets/mercat2.webp
- roles: mercat2 = cutout (primera foto de la derecha) · una-cigala-fresca = cutout (segunda foto) · el-chef-con-un-plato-de-bolets = cutout (tercera foto) · logo-casa + logo-guell = supporting (cabecera del tique)

narrativeRole: la prueba. La promesa del gancho se desglosa en cuatro líneas de una cuenta, cada una con su foto real al lado.
keyMessage: producto de mercado cada mañana, xup-xup a fuego lento, treinta años de oficio y ningún atajo.

Adapt: se conserva el elemento fijado que entra una vez y no vuelve a moverse (el tique) mientras la región de al lado cambia de estado por golpes; lo que cambia no es un rótulo sino una foto con su titular, y el ancla no está quieta del todo porque va ganando líneas impresas.
Scene 1 (0.0–1.2s): papel crema; el tique, papel de superficie con el borde inferior dentado y ligeramente girado, baja desde el borde superior hasta quedar fijado en el tercio izquierdo, a casi toda la altura útil. Su cabecera ya viene impresa: el logotipo y, en mono, "Sant Martí · Barcelona" sobre una línea discontinua.
Scene 2 (1.2–4.2s): se imprime la primera línea a golpes de cabezal, de izquierda a derecha: "PRODUCTO DE MERCADO", puntos guía, "CADA MAÑANA". A la vez, en la mitad derecha se descubre de abajo arriba la foto de la caja azul de cigalas y encima sube su titular en display, "El mercado manda"; una tiza blanca rodea la caja (svg-path-draw). Asimétrico 35/65, tres capas (papel, tique, foto).
Scene 3 (4.2–7.4s): segunda línea del tique: "XUP-XUP REAL", puntos guía, "A FUEGO LENTO". La foto de la derecha se sustituye por la cigala en la mano, que se descubre encima de la anterior, y el titular cambia en el sitio a "El fuego lento".
Scene 4 (7.4–10.4s): tercera línea: "MEMORIA CATALANA", puntos guía, "30 AÑOS". La foto pasa a ser el chef con las setas y el titular cambia a "Treinta años".
Scene 5 (10.4–13.0s): cuarta línea, la que remata: "ATAJOS", puntos guía, "0", y la pluma azul la subraya (svg-path-draw). La foto y el titular no cambian: lectura quieta del tique completo hasta el corte.

## Frame 3 — Reserva tu mesa

- scene: La cuenta llega al total sobre el azul de la casa: reserva tu mesa, el teléfono en grande y el horario en un tique
- voiceover: ""
- duration: 7s
- poster: 6s
- transition_in: push-slide UP
- status: animated
- src: compositions/frames/03-reserva.html
- type: cta
- persuasion: Friction reduction (el teléfono y el horario a la vista, sin buscar)
- beat: urgency-to-act + ease
- blueprint: compose
- asset_candidates: assets/logo-casa.webp — palabra "Casa" del logotipo; assets/logo-guell.webp — palabra "Güell" del logotipo
- focal: assets/logo-casa.webp
- roles: logo-casa + logo-guell = supporting (cabecera del tique del horario)

narrativeRole: el total de la cuenta es la llamada a la acción; todo lo anterior desemboca aquí.
keyMessage: reserva tu mesa: 936 43 43 84, de miércoles a domingo.

Scene 1 (0.0–1.6s): fondo completo en azul de marca con el papel de bandeja impreso muy tenue. "Reserva tu mesa" sube palabra a palabra (waterfall-entry) en display muy grande, en crema, en la mitad izquierda y algo por encima del centro. Split 55/45.
Scene 2 (1.6–3.2s): debajo del titular se escribe el teléfono, "936 43 43 84", en display, de izquierda a derecha, y un filete crema se traza bajo él; encima del teléfono aparece en mono "O llámanos al".
Scene 3 (3.2–5.6s): en la mitad derecha sube un tique (papel de superficie, borde dentado, girado un par de grados) con su cabecera, y sus tres filas se imprimen una tras otra con puntos guía: "Miércoles a Sábado · 13:00 - 00:00", "Domingo · 13:00 - 18:00", "Lunes y Martes · Cerrado".
Scene 4 (5.6–7.0s): lectura quieta; solo el papel de bandeja del fondo se desliza muy despacio.

## Frame 4 — Casa Güell

- scene: Vuelve el papel crema y el logotipo se compone en grande, subrayado a pluma, con la dirección y la web debajo
- voiceover: ""
- duration: 5s
- poster: 4s
- transition_in: blur-crossfade
- status: animated
- src: compositions/frames/04-cierre.html
- type: branding
- persuasion: Authority by association (la firma de la casa y su sitio exacto)
- beat: peace of mind
- blueprint: logo-assemble-lockup (Adapt)
- asset_candidates: assets/logo-casa.webp — palabra "Casa" del logotipo, silueta para rellenar de azul; assets/logo-guell.webp — palabra "Güell" del logotipo, silueta para rellenar de tinta
- focal: assets/logo-casa.webp
- roles: logo-casa + logo-guell = cutout (el logotipo es el protagonista, centrado)

narrativeRole: la firma. Deja el nombre y dónde encontrarlo.
keyMessage: Casa Güell, Carrer de Castella 1, Sant Martí, Barcelona.

Adapt: se conserva que la marca llega a existir en pantalla a partir de sus partes; las partes son las dos palabras del logotipo, que suben por separado, y lo que la cierra es el subrayado a pluma en vez de un giro de cámara.
Scene 1 (0.0–1.6s): papel crema; las dos palabras del logotipo suben una tras otra desde detrás de su máscara (waterfall-entry) hasta formar el logotipo muy grande, centrado y algo por encima del centro. Centrado, ~55% del ancho.
Scene 2 (1.6–2.8s): la pluma azul traza el subrayado bajo el logotipo (svg-path-draw).
Scene 3 (2.8–5.0s): debajo aparecen, en mono, la dirección "Carrer de Castella, 1 · Sant Martí, Barcelona" y, una línea más abajo, la web "casa-guell-drab.vercel.app". Lectura quieta; es el último fotograma, así que cierra con un fundido suave en el último medio segundo.
