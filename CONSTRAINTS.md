# Límites del proyecto

Última revisión: 2026-10-13, Franck3017.

Qué significa «suficientemente bueno para subir» en Casa Güell, con números y con la orden que lo
comprueba. Cada número lleva su motivo. Este archivo manda: los límites de la tabla «Con números» se
leen de aquí (`scripts/constraints.mjs`), así que cambiar un número en esa tabla cambia lo que se exige.
Los scripts de `package.json` son su copia, y si no coinciden gana lo que diga aquí.

## Suelo (siempre, y detiene el trabajo)

- Sin supresiones nuevas: `@ts-ignore`, `@ts-nocheck`, `@ts-expect-error`, `eslint-disable`, `oxlint-disable`
- Sin trabajo a medias: `throw new Error('Not implemented')`, un `catch` vacío, `TODO` o `FIXME`
- Sin pruebas saltadas ni borradas, ni aserciones quitadas, salvo que el commit explique por qué
- Sin secretos en el código
- Este archivo no se rebaja para que un cambio pase

El suelo mira solo lo que cambia entre `origin/main` y el árbol de trabajo. Las supresiones que ya había
en el código se quedan como están; lo que no puede haber es ninguna nueva.

Lo vigila `scripts/floor-guard.mjs`. Detiene lo que rebaja el listón sin duda. Lo que puede ser una
rebaja o no serlo (una aserción reescrita, un cambio en los archivos que hacen las comprobaciones) lo
deja anotado para que alguien lo mire, sin detener. Va el último en cada orden: aunque encuentre algo,
el resto de comprobaciones ya se ha lanzado.

## Con números

| Regla | Límite | Lo comprueba | Cuándo | Si falla | Por qué este número |
|-------|--------|--------------|--------|----------|---------------------|
| Tipos | 0 errores | `pnpm run typecheck` | cada edición | detiene | Un error de tipos rompe el build de Vercel |
| Lint | 0 errores de oxlint | `pnpm run lint` | cada edición | detiene | Los avisos se toleran; los errores son reglas de hooks, que rompen la web |
| Suelo | 0 hallazgos | `node scripts/floor-guard.mjs` | cada edición | detiene | Son los atajos con los que algo se pone en verde sin arreglarlo |
| Pruebas de lógica | todas pasan | `pnpm test` | fin de tarea | detiene | Reservas, precios y buscador, donde un fallo lo ve el cliente, y el propio vigilante del suelo |
| Pruebas del build | todas pasan | `pnpm test:build` | fin de tarea | detiene | Vigilan que React pueda adoptar el HTML generado |
| Peso del HTML de la portada | ≤ 24 kB con gzip | `pnpm test:build` | fin de tarea | detiene | Lo que pesa hoy (22,4) más un 7 % |
| Peso del CSS | ≤ 15,5 kB con gzip | `pnpm test:build` | fin de tarea | detiene | Lo que pesa hoy (14,4) más un 7 %; es lo único que bloquea el primer pintado |
| Peso del JavaScript principal | ≤ 166 kB con gzip | `pnpm test:build` | fin de tarea | detiene | Lo que pesa hoy (155,2) más un 7 % |
| Accesibilidad | 0 fallos críticos o graves de axe-core | `node scripts/check-runtime.mjs` | antes de subir a main | avisa | WCAG 2.1 AA en /ca, /es, /en y /es en oscuro; los leves y moderados suelen ser discutibles |
| CLS | ≤ 0,1 | `node scripts/check-runtime.mjs` | antes de subir a main | avisa | Umbral «bueno» de Core Web Vitals |
| TBT | ≤ 200 ms | `node scripts/check-runtime.mjs` | antes de subir a main | avisa | Umbral «bueno» de Lighthouse |
| LCP de Lighthouse | ≤ 4050 ms | `node scripts/check-runtime.mjs` | antes de subir a main | avisa | El de hoy (3685) más un 10 %; ver «Objetivos que hoy no se cumplen» |
| Nota de Lighthouse | ≥ 81 | `node scripts/check-runtime.mjs` | antes de subir a main | avisa | La de hoy (84) menos 3 puntos: entre pasadas va de 82 a 86 |

Rendimiento y accesibilidad se miden con Lighthouse en móvil (mediana de 3 pasadas sobre /es) y axe-core,
contra el build servido en local con compresión. Si el equipo va frenado (índice de Lighthouse por debajo
de 1000), el rendimiento no se da por medido: se repite con el equipo descansado. Necesita el Chromium de
Playwright, que se instala una vez por equipo con `pnpm bones:setup`.

**Avisan, no detienen.** Las cinco últimas filas informan sin parar el trabajo durante dos semanas. El día
de la revisión se decide si pasan a detener (`node scripts/check-runtime.mjs --strict`).

- Revisión de los avisos: hasta el 2026-10-27

## Medido hoy

Valores del 2026-10-13, de los que salen los límites de arriba.

| Métrica | Hoy | Sentido |
|---------|-----|---------|
| Nota medida | 84 | no puede bajar |
| LCP medido | 3685 ms | no puede subir |
| TBT medido | 110 ms | no puede subir |
| CLS medido | 0,003 | no puede subir |
| Fallos graves medidos | 0 | no puede subir |
| HTML medido, gzip | 22,4 kB | no puede subir |
| CSS medido, gzip | 14,4 kB | no puede subir |
| JavaScript medido, gzip | 155,2 kB | no puede subir |

Cuando una cifra mejore de forma estable, se actualiza aquí y se aprieta su límite.

## Objetivos que hoy no se cumplen

- LCP de Lighthouse ≤ 2500 ms: es el umbral «bueno» de Core Web Vitals, y hoy sale 3685. No se exige porque
  un límite que nace en rojo se acaba ignorando; se exige no empeorar. Con una red 4G lenta aplicada de
  verdad, en vez de simulada, la misma página da 1,8 s.

## Dónde corre cada cosa

| Orden | Cuándo | Qué pasa | Tarda |
|-------|--------|----------|-------|
| `pnpm check:fast` | tras cada edición | lint, tipos y suelo | unos 10 s |
| `pnpm check:task` | antes de dar una tarea por terminada | lo anterior, pruebas de lógica, compilar y pruebas del build | unos 30 s |
| `pnpm check:full` | antes de subir a main | lo anterior, accesibilidad y rendimiento | unos 90 s |

Tiempos con el equipo descansado; frenado, pueden triplicarse.

No hay CI: Vercel compila con cada push a `main`, pero no pasa pruebas. Lo que no se compruebe aquí
antes de subir, no lo comprueba nadie.

## Lo que no se comprueba

- Secretos y dependencias vulnerables: no hay gitleaks ni osv-scanner instalados. «Sin secretos en el
  código» es una regla escrita, sin herramienta detrás.
- Cobertura de pruebas: no se mide.
- Comportamiento en el navegador (tema, pestañas de la carta, reserva, pieza animada): no hay pruebas.
- Intención: el vigilante del suelo mira líneas, no lo que significan. Una aserción cambiada por otra más
  floja, o un script de comprobación que hace menos con las mismas líneas, solo queda anotado.

## Excepciones

Ninguna. Una excepción es una fila con identificador (`W1`, `W2`…), regla, ruta, motivo, responsable y
fecha de caducidad, a 90 días como mucho. La regla se escribe con el nombre que da el vigilante entre
corchetes (`comprobador silenciado`, `trabajo a medias`, `prueba saltada`, `prueba borrada`,
`aserción quitada`, `comprobación quitada`) y la ruta admite `*` y `**`.

Una excepción vale desde que está subida a `main` y hasta que caduca. Añadirla, ampliarla o alargarla
detiene el trabajo: la decide una persona, en un commit aparte del cambio que la necesita. Para lo que
toca a este archivo no hay excepciones.

| ID | Regla | Ruta | Motivo | Responsable | Caduca |
|----|-------|------|--------|-------------|--------|
