# Planes de movimiento

| Plan | Título | Gravedad | Estado |
| --- | --- | --- | --- |
| 001 | El hero no debe esconderse al cargar, y el Reveal usa la curva fuerte | ALTA | DONE |
| 002 | El selector de tema no debe usar `transition: all` | MEDIA | DONE |
| 003 | Curvas de movimiento compartidas como tokens | MEDIA | DONE |
| 004 | El progreso de lectura no debe renderizar React en cada scroll | BAJA | DONE |
| 005 | Borrar el CSS animado que ningún componente usa | BAJA | DONE |
| 006 | Entrada animada del modal de reserva | BAJA (oportunidad) | DONE |
| 007 | Entrada suave del estado de éxito (reserva y boletín) | BAJA (oportunidad) | DONE |
| 008 | El plato del hero se posa sobre el papel | BAJA (oportunidad) | SUPERSEDED por la coreografía del hero |

Orden de ejecución seguido: 003 → 001 → 005 → 002 → 004 → 006, 007, 008 (los tres últimos comparten un bloque de CSS al final de `globals.css`).

Dependencias: 001, 002, 006, 007 y 008 usan `--ease-out`, que crea el 003.

Pendiente de verificar a mano: cuánto se nota cada curva (solo se aprecia a ojo), y `prefers-reduced-motion` activado.
