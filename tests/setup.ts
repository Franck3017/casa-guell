import { vi } from 'vitest'

// Las pruebas trabajan con los datos reales de casaGuell.json, como en producción. En desarrollo,
// src/data/index.ts los sustituye por variantes de prueba que elige leyendo la URL del navegador.
vi.stubEnv('DEV', false)
