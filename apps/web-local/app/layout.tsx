import type { Metadata, Viewport } from 'next'
import './globals.css'
import 'leaflet/dist/leaflet.css'

export const metadata: Metadata = {
  title: 'MotoMoto Local', description: 'Acceso para locales asociados a MotoMoto',
  applicationName: 'MotoMoto Local', manifest: '/manifest.webmanifest',
  icons: { icon: '/icons/icon-192.png', apple: '/icons/icon-192.png' },
  appleWebApp: { capable: true, title: 'MotoMoto Local', statusBarStyle: 'black-translucent' },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#1e3fd1', viewportFit: 'cover' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>
}
