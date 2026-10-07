import { data } from '@/data'

const PHONE = data.ubicacion.contacto.telefono
const PHONE_HREF = `tel:+34${PHONE.replace(/\s/g, '')}`

/** Teléfono del restaurante como enlace para llamar. */
export function PhoneLink () {
  return (
    <a href={PHONE_HREF} className='font-medium text-ink underline underline-offset-4 hover:text-brand'>
      {PHONE}
    </a>
  )
}
