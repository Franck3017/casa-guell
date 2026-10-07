# 006 - Entrada animada del modal de reserva

- **Status**: DONE
- **Commit**: n/a (el proyecto no es un repositorio git)
- **Severity**: LOW (oportunidad)
- **Category**: Missed opportunities / Physicality
- **Estimated scope**: 2 files, ~20 líneas

## Problem

El modal de reserva aparece de golpe: velo y panel pasan de nada a todo en un fotograma. Se abre de forma ocasional, así que merece una entrada corta.

```tsx
/* src/components/layout/ReserveModal.tsx:139 y :143 - current */
className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/40 px-4 … backdrop-blur-sm'
…
<div ref={panelRef} className='elev my-auto w-full max-w-md border border-ink/10 bg-surface p-8' …>
```

## Target

Solo entrada (el componente se desmonta al cerrar, así que no hay salida animada). Velo: fundido de 200 ms. Panel: fundido y escala de 0,96 a 1, 200 ms, `--ease-out`. Origen del escalado: el centro (el modal aparece centrado). Con `prefers-reduced-motion: reduce`: solo fundido, sin escala.

```css
/* target - src/styles/globals.css, después del bloque de .reveal */
.modal-overlay { transition: opacity 200ms var(--ease-out); }
.modal-panel { transition: opacity 200ms var(--ease-out), transform 200ms var(--ease-out); }
@starting-style {
  .modal-overlay { opacity: 0; }
  .modal-panel { opacity: 0; transform: scale(0.96); }
}
@media (prefers-reduced-motion: reduce) {
  @starting-style { .modal-panel { transform: none; } }
}
```

## Repo conventions to follow

- Curvas como variables en `src/styles/theme.css` (`--ease-out`). Estilos globales de movimiento en `src/styles/globals.css` junto a `.reveal`.
- `@starting-style` no tiene compatibilidad en navegadores muy antiguos: allí el modal simplemente aparece sin animar (comportamiento actual).

## Steps

1. `src/styles/globals.css`: añadir el bloque CSS del Target al final del archivo (después de la regla de reduced-motion de `.reveal`).
2. `ReserveModal.tsx:139`: añadir la clase `modal-overlay` al `className` del velo (al principio de la cadena).
3. `ReserveModal.tsx:143`: añadir la clase `modal-panel` al `className` del panel (al principio de la cadena).

## Boundaries

- No tocar la lógica del modal (foco, Escape, envío).
- No añadir animación de salida ni cambiar a renderizado condicional distinto.
- Si el código no coincide, parar y avisar.

## Verification

- **Mecánica**: `pnpm exec tsc --noEmit` (solo los 2 errores previos de `map.tsx`).
- **Feel check**: pulsar "Reservar mesa": el velo se funde y el panel crece suavemente desde su centro en ~200 ms, sin rebote. Abrir y cerrar varias veces seguidas sin que se bloquee. Con `prefers-reduced-motion: reduce`, solo fundido.
- **Done when**: en DevTools el panel muestra una transición de `opacity` y `transform` de 0,2 s al abrirse.
