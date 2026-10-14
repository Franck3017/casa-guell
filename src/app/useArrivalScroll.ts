import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { pageOf } from '@/components/Seo/pageMeta'
import { useI18n } from '@/i18n'
import { PAGE_READY } from '@/lib/events'
import { scrollOnArrival, type Place } from './scrollPolicy'

/**
 * Coloca el scroll cada vez que cambia la dirección, según scrollOnArrival, y recuerda dónde quedó en
 * cada entrada del historial para devolverlo al volver a ella.
 *
 * Todo ocurre en el mismo instante en que cambia la página (useLayoutEffect): antes de que se pinte y
 * antes de que la transición de cambio de página fotografíe la pantalla nueva.
 */
export function useArrivalScroll (): void {
  const { locale } = useI18n()
  const location = useLocation()
  const place = useRef<Place | null>(null)
  const entry = useRef(location.key)
  const positions = useRef(new Map<string, number>())
  const settle = useRef((): void => {})

  useEffect(() => {
    // Del historial se ocupa este gancho: si el navegador restaurase además por su cuenta, se pisarían
    window.history.scrollRestoration = 'manual'
    // Lo que se desplace mientras se está en una entrada se apunta a su nombre
    const remember = (): void => { positions.current.set(entry.current, window.scrollY) }
    const onPageReady = (): void => settle.current()
    window.addEventListener('scroll', remember, { passive: true })
    window.addEventListener(PAGE_READY, onPageReady)
    return () => {
      window.removeEventListener('scroll', remember)
      window.removeEventListener(PAGE_READY, onPageReady)
      window.history.scrollRestoration = 'auto'
    }
  }, [])

  useLayoutEffect(() => {
    const here: Place = { locale, page: pageOf(locale, location.pathname) }
    // Se lee antes de cambiar de entrada: después, cualquier desplazamiento ya se apunta a la nueva
    const left = positions.current.get(location.key)
    const arrival = scrollOnArrival(place.current, here, left != null)
    place.current = here
    entry.current = location.key

    const arrive = (behavior: ScrollBehavior): void => {
      if (arrival === 'keep') return
      if (arrival === 'restore') window.scrollTo({ top: left, behavior: 'instant' })
      else if (!location.hash) window.scrollTo({ top: 0, behavior })
      else document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior })
    }
    arrive(arrival === 'glide' ? 'auto' : 'instant')
    // Una página cuyo código llega después que su ruta (la información legal) avisa al montarse: se
    // repite la colocación, ya con el contenido delante y de un salto
    settle.current = () => arrive('instant')
    // La entrada queda apuntada desde que se llega, aunque después nadie desplace la página
    positions.current.set(location.key, window.scrollY)
  }, [location, locale])
}
