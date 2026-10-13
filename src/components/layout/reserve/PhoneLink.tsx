import { PHONE, PHONE_HREF } from '@/lib/place'

/** Teléfono del restaurante como enlace para llamar. No se parte entre dos líneas: es un solo número. */
export function PhoneLink () {
  return (
    <a href={PHONE_HREF} className='whitespace-nowrap font-medium text-ink underline underline-offset-4 hover:text-brand'>
      {PHONE}
    </a>
  )
}
