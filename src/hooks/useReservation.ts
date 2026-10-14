import { useEffect, useState } from 'react'
import type { Locale } from '@/i18n'
import { hasRoom, reserveErrorKey, type ReserveErrorKey, type Slot } from '@/lib/reserveDays'
import { supabase } from '@/lib/supabase'

export interface ReserveContact {
  name: string
  phone: string
  email: string
  notes: string
}

const NO_CONTACT: ReserveContact = { name: '', phone: '', email: '', notes: '' }

/** Las horas libres que ha contestado la base de datos para un día; sin ellas (null) si la consulta ha fallado. */
interface LoadedSlots {
  date: string
  slots: Slot[] | null
}

/**
 * Estado de una reserva en curso y lo que se habla con la base de datos: las horas libres del día
 * elegido (`available_slots`) y el envío (`create_reservation`).
 * Vive fuera del diálogo para que lo ya elegido y escrito siga ahí si se cierra y se vuelve a abrir.
 */
export function useReservation (locale: Locale) {
  const [date, setDateOnly] = useState('')
  const [people, setPeopleOnly] = useState(2)
  const [slot, setSlot] = useState<string | null>(null)
  const [contact, setContact] = useState<ReserveContact>(NO_CONTACT)
  const [allergyIds, setAllergyIds] = useState<number[]>([])
  const [allergyText, setAllergyText] = useState('')
  const [allergyConsent, setAllergyConsent] = useState(false)
  const [loaded, setLoaded] = useState<LoadedSlots | null>(null)
  const [reloads, setReloads] = useState(0)
  const [sending, setSending] = useState(false)
  const [errorKey, setErrorKey] = useState<ReserveErrorKey | null>(null)
  const [code, setCode] = useState<string | null>(null)

  useEffect(() => {
    if (date === '') return
    // Si se cambia de día antes de que llegue la respuesta, la que llega tarde ya no se usa
    let current = true
    void supabase.rpc('available_slots', { p_date: date }).then(({ data, error }) => {
      if (current) setLoaded({ date, slots: error != null ? null : (data ?? []) as Slot[] })
    })
    return () => { current = false }
  }, [date, reloads])

  // Mientras llegan las horas del día pedido no se enseñan las del anterior
  const day = date !== '' && loaded?.date === date ? loaded : null

  const setDate = (next: string): void => {
    setDateOnly(next)
    setSlot(null)
    setErrorKey(null)
  }

  /** Si la hora elegida ya no tiene sitio para tantos, se suelta: hay que elegir otra. */
  const setPeople = (next: number): void => {
    setPeopleOnly(next)
    const chosen = day?.slots?.find((s) => s.slot === slot)
    if (chosen != null && !hasRoom(chosen, next)) setSlot(null)
  }

  const reloadSlots = (): void => {
    setLoaded(null)
    setReloads((n) => n + 1)
  }

  /** Envía la reserva. Devuelve por qué no se ha podido, o `null` si ha quedado hecha. */
  const submit = async (): Promise<ReserveErrorKey | null> => {
    if (slot == null) return 'errGeneric'
    setSending(true)
    setErrorKey(null)
    const hasAllergy = allergyIds.length > 0 || allergyText.trim().length > 0
    if (hasAllergy && !allergyConsent) {
      setSending(false)
      setErrorKey('errAllergyConsent')
      return 'errAllergyConsent'
    }
    const { data, error } = await supabase.rpc(hasAllergy ? 'create_reservation_with_allergies' : 'create_reservation', {
      p_name: contact.name,
      p_phone: contact.phone,
      p_email: contact.email,
      p_date: date,
      p_time: slot,
      p_people: people,
      p_notes: contact.notes,
      p_locale: locale,
      ...(hasAllergy ? {
        p_allergen_ids: allergyIds,
        p_allergy_text: allergyText.trim() || null,
        p_allergy_consent: allergyConsent
      } : {})
    })
    setSending(false)
    if (error != null) {
      const key = reserveErrorKey(error.message)
      setErrorKey(key)
      // La hora se ha llenado mientras se rellenaba el formulario: se suelta y se piden las que quedan
      if (key === 'errNoAvailability') {
        setSlot(null)
        reloadSlots()
      }
      return key
    }
    setCode((data as { code?: string } | null)?.code ?? '')
    return null
  }

  /** Deja el formulario en blanco: después de una reserva hecha, la siguiente empieza de cero. */
  const reset = (): void => {
    setDateOnly('')
    setPeopleOnly(2)
    setSlot(null)
    setContact(NO_CONTACT)
    setAllergyIds([])
    setAllergyText('')
    setAllergyConsent(false)
    setLoaded(null)
    setErrorKey(null)
    setCode(null)
  }

  return {
    date,
    people,
    slot,
    contact,
    allergyIds,
    allergyText,
    allergyConsent,
    /** Las horas del día elegido: `undefined` mientras llegan, `null` si no se han podido consultar. */
    slots: day == null ? undefined : day.slots,
    sending,
    errorKey,
    /** El código de la reserva hecha; `null` mientras no hay ninguna. */
    code,
    setDate,
    setPeople,
    setSlot,
    setContact,
    setAllergyIds,
    setAllergyText,
    setAllergyConsent,
    reloadSlots,
    submit,
    reset
  }
}

export type Reservation = ReturnType<typeof useReservation>
