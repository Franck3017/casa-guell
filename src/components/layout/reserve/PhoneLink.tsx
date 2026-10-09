import { PHONE, PHONE_HREF } from '@/lib/place'

/** Teléfono del restaurante como enlace para llamar. */
export function PhoneLink () {
  return (
    <a href={PHONE_HREF} className='font-medium text-ink underline underline-offset-4 hover:text-brand'>
      {PHONE}
    </a>
  )
}
