# 007 - Entrada suave del estado de éxito (reserva y boletín)

- **Status**: DONE
- **Commit**: n/a (el proyecto no es un repositorio git)
- **Severity**: LOW (oportunidad)
- **Category**: Missed opportunities
- **Estimated scope**: 3 files, ~12 líneas

## Problem

Al enviar la reserva o el boletín, el formulario se sustituye por el mensaje de éxito sin transición: el contenido salta.

```tsx
/* src/components/layout/ReserveModal.tsx:158 - current */
<div role='status' className='mt-6'>
/* src/features/market/NewsletterSignup.tsx:49 - current */
<div role='status' className='mt-6'>
```

## Target

El bloque de éxito entra con 200 ms: opacidad de 0 a 1 y subida de 8px a 0, curva `--ease-out`. Con `prefers-reduced-motion: reduce`, solo opacidad.

```css
/* target - src/styles/globals.css, después del bloque del plan 006 (o de .reveal si aún no existe) */
.state-in { transition: opacity 200ms var(--ease-out), transform 200ms var(--ease-out); }
@starting-style { .state-in { opacity: 0; transform: translateY(8px); } }
@media (prefers-reduced-motion: reduce) {
  @starting-style { .state-in { transform: none; } }
}
```

## Repo conventions to follow

- Estilos globales de movimiento en `src/styles/globals.css`; curva `--ease-out` de `theme.css`.

## Steps

1. `src/styles/globals.css`: añadir el bloque CSS del Target al final.
2. `ReserveModal.tsx:158`: cambiar `className='mt-6'` por `className='state-in mt-6'`.
3. `NewsletterSignup.tsx:49`: cambiar `className='mt-6'` por `className='state-in mt-6'`.

## Boundaries

- No tocar los mensajes de error (`role='alert'`): deben aparecer al instante.
- No cambiar textos ni markup.
- Si el código no coincide, parar y avisar.

## Verification

- **Mecánica**: `pnpm exec tsc --noEmit` (solo los 2 errores previos de `map.tsx`).
- **Feel check**: enviar el boletín (con la red simulada como correcta): el mensaje de éxito aparece con un fundido corto y una pequeña subida, sin saltar. Con `prefers-reduced-motion: reduce`, solo fundido.
- **Done when**: el bloque `role='status'` tiene la clase `state-in` en ambos archivos.
