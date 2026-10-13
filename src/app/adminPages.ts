import { lazy } from 'react'

type AdminPage = 'AdminLayout' | 'BlocksPage' | 'DashboardPage' | 'LoginPage'

// El panel de sala va en un trozo aparte del de la web, con el cliente de la base de datos: solo lo descarga
// quien entra en /admin. Las cuatro pantallas salen del mismo trozo, así que se pide una sola vez.
const adminPage = (name: AdminPage) => lazy(async () => await import('@/features/admin').then((m) => ({ default: m[name] })))

export const AdminLayout = adminPage('AdminLayout')
export const BlocksPage = adminPage('BlocksPage')
export const DashboardPage = adminPage('DashboardPage')
export const LoginPage = adminPage('LoginPage')
