# 003 - Curvas de movimiento compartidas como tokens

- **Status**: DONE
- **Commit**: n/a (el proyecto no es un repositorio git)
- **Severity**: MEDIUM
- **Category**: Cohesion & tokens
- **Estimated scope**: 3 files, ~12 lines

## Problem

Hay cuatro `cubic-bezier` escritos a mano, casi iguales entre sí, sin variable compartida:

```css
/* src/styles/globals.css:30 - current (presión .press) */
transition: transform 140ms cubic-bezier(0.23, 1, 0.32, 1), background-color 200ms ease, …
/* src/styles/globals.css:118 - current (.reveal) */  cubic-bezier(0.22, 1, 0.36, 1)
/* src/styles/globals.css:132 - current (.preview-pop, se borra en el plan 005) */  cubic-bezier(0.22, 1, 0.36, 1)
```

```ts
// src/hooks/theme.tsx:80 - current (onda del cambio de tema)
{ duration: 520, easing: 'cubic-bezier(0.35, 0, 0.15, 1)', pseudoElement: '::view-transition-new(root)' }
```

## Target

Dos tokens en `:root`, usados donde corresponda. La onda mantiene su curva actual (sin cambio de tacto), solo pasa a ser un token con nombre.

```css
:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);   /* entradas y respuesta de UI */
  --ease-wipe: cubic-bezier(0.35, 0, 0.15, 1);  /* onda circular del cambio de tema */
}
```

## Repo conventions to follow

- Variables CSS globales en `src/styles/theme.css` dentro de `:root` (ya contiene `--cg-dur`, `--cg-elev`).
- Ejemplo de variable consumida desde JS: ninguna todavía; usar `getComputedStyle(document.documentElement).getPropertyValue(...)` con valor de respaldo.

## Steps

1. `src/styles/theme.css`: dentro del bloque `:root { … }` (junto a `--cg-dur: 450ms;`) añadir las dos variables del Target.
2. `src/styles/globals.css:30`: cambiar `cubic-bezier(0.23, 1, 0.32, 1)` por `var(--ease-out)`.
3. `src/hooks/theme.tsx:80`: sustituir `easing: 'cubic-bezier(0.35, 0, 0.15, 1)'` por `easing: getComputedStyle(root).getPropertyValue('--ease-wipe').trim() || 'cubic-bezier(0.35, 0, 0.15, 1)'` (`root` ya existe en `commitWithWipe`).
4. (El `.reveal` lo cambia el plan 001; el `.preview-pop` desaparece en el plan 005.)

## Boundaries

- No cambiar duraciones ni otras curvas (`ease` de colores es correcta).
- No tocar `ui/map.tsx`.
- No añadir dependencias.
- Si el código no coincide, parar y avisar.

## Verification

- **Mecánica**: `pnpm exec tsc --noEmit` (solo los 2 errores previos de `map.tsx`).
- **Feel check**: cambiar el tema con el selector del pie: la onda circular se abre igual que antes (misma curva). Pulsar un botón principal: el escalado 0,97 responde igual.
- **Done when**: `grep -n "cubic-bezier" src` solo devuelve `theme.css` (tokens), el respaldo de `theme.tsx` y `ui/map.tsx`.
