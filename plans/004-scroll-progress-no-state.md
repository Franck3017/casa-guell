# 004 - El progreso de lectura no debe renderizar React en cada scroll

- **Status**: DONE
- **Commit**: n/a (el proyecto no es un repositorio git)
- **Severity**: LOW
- **Category**: Performance
- **Estimated scope**: 2 files (uno se borra), ~30 líneas

## Problem

`ScrollProgress` guarda el progreso en `useState`: cada fotograma de scroll vuelve a renderizar el componente solo para mover una barra de 2px.

```tsx
/* src/components/layout/ScrollProgress.tsx - current */
const progress = useScrollProgress()
…
<div className='h-full origin-left bg-brand' style={{ transform: `scaleX(${progress})` }} />
```

```ts
/* src/hooks/useScrollProgress.ts:4-13 - current */
export function useScrollProgress (): number {
  const [progress, setProgress] = useState(0)
  …
      raf = requestAnimationFrame(() => { … setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0) })
```

## Target

La barra se actualiza escribiendo `transform` directamente en el elemento (sin `useState`), con el mismo cálculo y el mismo `requestAnimationFrame`. Sigue siendo `scaleX` (solo `transform`).

```tsx
/* target - src/components/layout/ScrollProgress.tsx */
import { useEffect, useRef } from 'react'

/** Barra fina de progreso anclada al borde inferior del header. */
export function ScrollProgress () {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (barRef.current != null) barRef.current.style.transform = `scaleX(${progress})`
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div aria-hidden='true' className='pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-ink/5'>
      <div ref={barRef} className='h-full origin-left bg-brand' style={{ transform: 'scaleX(0)' }} />
    </div>
  )
}
```

## Repo conventions to follow

- Eventos de scroll siempre con `{ passive: true }` y limpieza en el `return` del efecto (como el hook actual).

## Steps

1. Reemplazar el contenido de `src/components/layout/ScrollProgress.tsx` por el del Target.
2. Verificar con `grep -rn "useScrollProgress" src`: si solo lo usaba `ScrollProgress.tsx`, borrar `src/hooks/useScrollProgress.ts`.

## Boundaries

- No cambiar el aspecto de la barra (2px, `bg-brand`, `origin-left`).
- No tocar `Nav.tsx` (sigue montando `<ScrollProgress />`).
- Si el código no coincide, parar y avisar.

## Verification

- **Mecánica**: `pnpm exec tsc --noEmit` (solo los 2 errores previos de `map.tsx`).
- **Feel check**: hacer scroll de arriba abajo: la barra azul crece de forma continua hasta llenarse en el pie, y vuelve a 0 arriba. Al cambiar el tamaño de la ventana se recalcula.
- **Done when**: no hay `useState` en `ScrollProgress.tsx` y la barra llega a `scaleX(1)` al final de la página.
