# 005 - Borrar el CSS animado que ningún componente usa

- **Status**: DONE
- **Commit**: n/a (el proyecto no es un repositorio git)
- **Severity**: LOW
- **Category**: Cohesion / cleanup
- **Estimated scope**: 1 file, ~145 líneas borradas

## Problem

`globals.css` conserva ~145 líneas de movimiento que ningún componente usa: la ilustración del chef (`chef-*`, `steam-rise`, bucles infinitos `infinite`) y el popover `preview-pop` / `.auto-wrap`. Los componentes `ChefHero.tsx` y `Chefpaths.tsx` ya no existen y no hay ningún `className` que use estas clases. Todo el CSS se descarga en cada visita.

```css
/* src/styles/globals.css:126 - current */
/* Popover de preview del modo Auto */
.preview-pop { … }
/* …hasta la línea 142 */
/* src/styles/globals.css:144 - current */
@keyframes chef-draw  { to { stroke-dashoffset: 0; } }
/* …hasta el final del archivo (línea 271) */
```

## Target

`globals.css` termina justo después de la regla de `prefers-reduced-motion` del `.reveal` (línea 124 actual), sin los bloques `preview-pop` ni `chef-*`.

## Repo conventions to follow

- Verificar antes de borrar con `grep -rn "chef-\|steam-\|preview-pop\|auto-wrap" src --include=*.tsx --include=*.ts`: la única coincidencia aceptable es `src/lib/dishMedia.ts` (nombres de archivo de imagen "…-del-chef…"), que no usa estas clases.

## Steps

1. Ejecutar la verificación de arriba; si aparece algún `className` que use estas clases, PARAR y avisar.
2. `src/styles/globals.css`: eliminar desde la línea 126 (`/* Popover de preview del modo Auto */`) hasta el final del archivo, dejando una única línea en blanco al final.

## Boundaries

- No tocar nada anterior a la línea 126 (`.reveal`, `.press`, grano, estampado).
- No tocar `index.css` ni `theme.css`.
- Si las líneas no coinciden con el texto citado, parar y avisar.

## Verification

- **Mecánica**: `pnpm exec tsc --noEmit` (solo los 2 errores previos de `map.tsx`); la web carga sin cambios visibles.
- **Feel check**: recorrer inicio, carta, mercado y cierre en claro y oscuro: nada cambia.
- **Done when**: `grep -c "@keyframes" src/styles/globals.css` devuelve 0.
