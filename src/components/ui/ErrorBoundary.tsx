import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  /** Lo que se pinta en lugar de la pieza cuando falla. */
  fallback: ReactNode
  children: ReactNode
}

/**
 * Contiene el fallo de una pieza. Si algo de dentro revienta al pintarse (lo habitual: un trozo de carga
 * diferida que no llega, por un corte de red o porque se ha publicado una versión nueva con la página
 * abierta), se pinta `fallback` en su sitio y el resto de la página sigue en pie. Sin un límite cercano el
 * error sube hasta la ruta y se lleva la página entera.
 * Va por fuera del <Suspense> de la pieza. Es una clase porque React no tiene un equivalente con hooks.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError () {
    return { failed: true }
  }

  render () {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
