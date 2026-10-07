# 002 - El selector de tema no debe usar `transition: all`

- **Status**: DONE
- **Commit**: n/a (el proyecto no es un repositorio git)
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 1 file, 1 línea

## Problem

Cada opción del selector (en el pie) usa `transition-all duration-300`, que anima propiedades no previstas. Además tarda 300 ms para un control de UI.

```tsx
/* src/components/layout/ThemeToggle.tsx:107 - current */
className={`flex h-(--s) w-(--s) items-center justify-center rounded-full transition-all duration-300 motion-reduce:transition-none ${
```

## Target

Solo las propiedades que cambian, 200 ms y la curva `--ease-out`. `max-height` se mantiene porque colapsa la opción: el selector está en posición absoluta, así que no afecta al layout de la página.

```tsx
/* target */
className={`flex h-(--s) w-(--s) items-center justify-center rounded-full transition-[opacity,transform,max-height,background-color,color] duration-200 ease-(--ease-out) motion-reduce:transition-none ${
```

## Repo conventions to follow

- `--ease-out` está definido en `src/styles/theme.css` (`:root`).
- Tailwind v4: `ease-(--nombre)` aplica una variable como curva (ya se usa `h-(--s)` en este archivo).

## Steps

1. `src/components/layout/ThemeToggle.tsx:107`: sustituir `transition-all duration-300` por `transition-[opacity,transform,max-height,background-color,color] duration-200 ease-(--ease-out)` (lo demás de la línea no cambia).

## Boundaries

- No tocar el retardo escalonado (`transitionDelay: ${pos * 45}ms`) ni el contenedor del selector.
- No cambiar markup.
- Si la línea no coincide, parar y avisar.

## Verification

- **Mecánica**: `pnpm exec tsc --noEmit` (solo los 2 errores previos de `map.tsx`).
- **Feel check**: pasar el ratón por el selector del pie: las opciones se despliegan hacia arriba y se recogen sin salto. Con `prefers-reduced-motion: reduce` no hay movimiento.
- **Done when**: `grep -c "transition-all" src/components/layout/ThemeToggle.tsx` devuelve 0.
