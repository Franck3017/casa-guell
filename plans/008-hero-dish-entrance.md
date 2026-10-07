# 008 - El plato del hero se posa sobre el papel (sin retrasar lo visible)

- **Status**: SUPERSEDED (la entrada `.hero-dish` se sustituyó por la coreografía del hero: clases `.hero-in-*`, `.hero-drift-*` y parallax en `HeroSection.tsx`)
- **Commit**: n/a (el proyecto no es un repositorio git)
- **Severity**: LOW (oportunidad)
- **Category**: Missed opportunities / Physicality
- **Estimated scope**: 2 files, ~10 líneas

## Problem

El plato destacado aparece junto con el resto del hero. Es el único elemento que "se superpone" sobre el retrato y el papel, y no hay nada que lo haga sentir colocado. Hay que añadirlo sin retrasar lo que ya es visible (plan 001): el titular, el retrato y los botones NO se tocan.

```tsx
/* src/features/hero/HeroSection.tsx:62 - current */
<div className='absolute -right-[6%] bottom-[4%] w-[74%] drop-shadow-[0_22px_22px_rgb(17_18_21/0.2)]'>
```

## Target

Solo el contenedor del plato: entra con 400 ms, 100 ms de retraso, subiendo de 10px a 0 y con fundido, curva `--ease-out`. Con `prefers-reduced-motion: reduce`: sin movimiento ni retraso (solo fundido).

```css
/* target - src/styles/globals.css, al final */
.hero-dish { transition: opacity 400ms var(--ease-out) 100ms, transform 400ms var(--ease-out) 100ms; }
@starting-style { .hero-dish { opacity: 0; transform: translateY(10px); } }
@media (prefers-reduced-motion: reduce) {
  .hero-dish { transition: opacity 200ms var(--ease-out); }
  @starting-style { .hero-dish { transform: none; } }
}
```

## Repo conventions to follow

- Estilos globales de movimiento en `src/styles/globals.css`; curva `--ease-out` de `theme.css`.
- El `drop-shadow` va en el contenedor porque `main img` ya aplica un filtro de tema a la imagen (no mover la sombra a la `img`).

## Steps

1. `src/styles/globals.css`: añadir el bloque CSS del Target al final del archivo.
2. `HeroSection.tsx:62`: añadir la clase `hero-dish` al `className` del contenedor del plato (conservando el resto).

## Boundaries

- No animar el titular, el texto, los botones ni el retrato del chef: deben verse desde el primer fotograma.
- No cambiar `Reveal instant` del hero.
- Si el código no coincide, parar y avisar.

## Verification

- **Mecánica**: `pnpm exec tsc --noEmit` (solo los 2 errores previos de `map.tsx`).
- **Feel check**: recargar `/es`: titular, retrato y botones están desde el principio; el plato se posa sobre el papel en ~0,5 s. Ralentizar la animación al 10% en DevTools y confirmar que solo cambian `opacity` y `transform` del plato.
- **Done when**: `.hero-dish` es el único elemento del hero con transición de entrada.
