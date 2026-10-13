import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// Configuración propia de las pruebas, aparte de vite.config.ts: lo que se prueba es lógica y archivos
// generados, y no hacen falta los plugins de la aplicación (el de boneyard, además, lanza un navegador).
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  test: {
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    environment: 'node'
  }
})
