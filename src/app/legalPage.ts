import { lazy } from 'react'

// La información legal va en un trozo aparte del de la portada: solo lo descarga quien la abre.
export const LegalPage = lazy(async () => await import('@/features/legal').then((m) => ({ default: m.LegalPage })))
