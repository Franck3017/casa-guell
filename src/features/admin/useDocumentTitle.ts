import { useEffect } from 'react'

/**
 * Título de la pestaña en el panel. index.html trae el de la portada, y las pantallas del panel no pasan
 * por el componente que lo cambia en la web pública: sin esto todas se llamarían como la portada.
 */
export function useDocumentTitle (title: string): void {
  useEffect(() => {
    document.title = `${title} · Panel de Casa Güell`
  }, [title])
}
