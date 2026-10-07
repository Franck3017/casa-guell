# 001 - El hero no debe esconderse al cargar, y el Reveal usa la curva fuerte

- **Status**: DONE
- **Commit**: n/a (el proyecto no es un repositorio git)
- **Severity**: HIGH
- **Category**: Purpose & frequency / Easing & duration
- **Estimated scope**: 3 files, ~25 lines

## Problem

El hero va envuelto en `Reveal`: titular, texto, botones y foto parten de `opacity: 0` y tardan 0,7 s en aparecer, con `ease` genérico en la opacidad. Es lo primero que ve cada visitante, así que se retrasa justo lo que debería estar ya.

```css
/* src/styles/globals.css:118 - current */
.reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
```

```tsx
/* src/features/hero/HeroSection.tsx:16 y :44 - current */
<Reveal>…</Reveal>
<Reveal delay={120} className='mx-auto w-full max-w-[640px] md:ml-auto'>…</Reveal>
```

## Target

- El contenido visible al cargar (el hero) no se anima: `Reveal` recibe `instant`.
- El resto de secciones entra con la curva fuerte `--ease-out` (plan 003), 450 ms, 12px de desplazamiento y la opacidad también con `--ease-out`.

```css
/* target */
.reveal { opacity: 0; transform: translateY(12px); transition: opacity 450ms var(--ease-out), transform 450ms var(--ease-out); }
```

## Repo conventions to follow

- Las curvas viven como variables CSS en `src/styles/theme.css` (`:root`); este plan usa `--ease-out`, que crea el plan 003 (ejecutar 003 antes).
- `prefers-reduced-motion` ya está cubierto en `globals.css` (`.reveal { transition: none; opacity: 1; transform: none; }`): no tocarlo.

## Steps

1. `src/components/ui/Reveal.tsx`: añadir la prop `instant?: boolean`. Si `instant` es true, devolver el `div` SIN la clase `reveal` (siempre visible) y sin observer: `<div className={className}>{children}</div>`. Los hooks se mantienen en el mismo orden (no retornar antes de `useRef`/`useEffect`; en el efecto, `if (instant || el == null) return`).
2. `src/features/hero/HeroSection.tsx`: añadir `instant` a los dos `<Reveal>` (líneas 16 y 44), conservando el resto de props.
3. `src/styles/globals.css:118`: sustituir la regla `.reveal` por la del Target.

## Boundaries

- No tocar otros `Reveal` (secciones bajo el pliegue siguen animando).
- No cambiar markup ni estructura de las secciones.
- No añadir dependencias.
- Si el código no coincide con los fragmentos de arriba, parar y avisar.

## Verification

- **Mecánica**: `pnpm exec tsc --noEmit` (solo los 2 errores previos de `map.tsx`).
- **Feel check**: recargar `/es` con la caché desactivada: titular, botones y foto del hero están visibles desde el primer fotograma. Bajar al resto de secciones: aparecen con desplazamiento corto y sin parón inicial. Con `prefers-reduced-motion: reduce` todo aparece sin movimiento.
- **Done when**: `#top .reveal` no existe en el DOM y `.reveal` (fuera del hero) usa `transition: opacity 450ms …`.
