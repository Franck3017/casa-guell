import { Outlet } from 'react-router'
import { ThemeProvider } from '@/hooks/theme'

export function RootLayout () {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  )
}
