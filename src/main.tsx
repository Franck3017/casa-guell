import { createRoot, hydrateRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
// Tipografías alojadas en el propio sitio (sin pedir nada a Google Fonts)
import '@fontsource-variable/playfair-display/index.css'
import '@fontsource-variable/playfair-display/wght-italic.css'
import '@fontsource-variable/inter/index.css'
import '@fontsource/space-mono/400.css'
import '@fontsource/space-mono/700.css'
import '@/styles/globals.css'
import '@/bones/registry'
import { router } from '@/app/router'

const rootEl = document.getElementById('root')
if (rootEl == null) throw new Error('#root missing')
const app = <RouterProvider router={router} />
// Las portadas (/ca, /es y /en) llegan ya pintadas por el prerenderizado del build: React adopta ese HTML
// en vez de borrarlo y volver a crearlo. Con la raíz vacía ("/" y las rutas que no existen) se monta de cero.
if (rootEl.hasChildNodes()) hydrateRoot(rootEl, app)
else createRoot(rootEl).render(app)
