import { data } from '@/data'

// Teléfono y situación de la casa. Se usan en el pie, el mercado, la reserva, el mapa y los datos
// estructurados: viven aquí, en un archivo sin dependencias pesadas, para que haya una sola copia y nadie
// tenga que cargar el mapa para saber dónde está el restaurante.

/** El teléfono tal como se lee: «936 43 43 84». */
export const PHONE = data.ubicacion.contacto.telefono
/** Con prefijo internacional, como lo piden los datos estructurados. */
export const PHONE_INTL = `+34 ${PHONE}`
/** Enlace para llamar. */
export const PHONE_HREF = `tel:+34${PHONE.replace(/\s/g, '')}`

/** El punto exacto de la puerta. */
export const COORDS = { latitude: 41.404493, longitude: 2.1988202 } as const
export const MAPS_HREF = `https://www.google.com/maps/search/?api=1&query=${COORDS.latitude},${COORDS.longitude}`
