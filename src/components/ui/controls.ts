// Controles de formulario: las mismas piezas en el diálogo de reserva y en el panel. La regla de forma es la
// de toda la web: lo que se pulsa es una píldora, y los campos y los paneles tienen esquinas rectas. Los
// colores salen de los tokens del tema (tinta, papel y el azul de la casa), así que valen de día y de noche.

/** Etiqueta de un campo: va siempre encima, nunca como texto de ejemplo dentro. */
export const LABEL = 'block font-mono2 text-[11px] uppercase tracking-widest text-ink/70'

/**
 * Campo de texto, fecha o lista. 16 px en móvil para que iOS no amplíe la página al enfocarlo, y 44 px de
 * alto para el dedo. El ancho lo pone quien lo usa. El borde tiene contraste suficiente para verse sin
 * depender del fondo, y el foco lo marca el contorno general de la web (globals.css), que aquí no se quita.
 */
export const FIELD = 'block min-h-11 border border-ink/50 bg-surface px-3 text-base text-ink focus-visible:border-brand disabled:opacity-50 md:text-sm'

/** La acción principal de cada pantalla o de cada fila. */
export const PRIMARY = 'press inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-ink px-5 font-body text-sm font-semibold text-cream hover:bg-brand disabled:opacity-50'

/** Acciones secundarias. */
export const QUIET = 'press inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-ink/25 px-4 font-body text-sm font-medium text-ink hover:border-ink/60 disabled:opacity-50'

/** Botón de solo icono: siempre con su `aria-label`. */
export const ICON_BUTTON = 'press inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-ink/25 text-ink hover:border-ink/60 disabled:opacity-40'

/** El velo que oscurece la página detrás de un diálogo. Oscuro también de noche, cuando la tinta es clara. */
export const SCRIM = 'modal-overlay fixed inset-0 z-50 flex justify-center bg-black/50 backdrop-blur-sm md:items-center md:px-10 md:py-10'
