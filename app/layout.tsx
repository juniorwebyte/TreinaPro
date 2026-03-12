import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { PWAProvider } from '@/components/pwa/pwa-provider'
import { OfflineIndicator, InstallBanner } from '@/components/pwa/notification-settings'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1a1a2e',
}

export const metadata: Metadata = {
  title: 'Treino PRO - Plataforma de Estudos | Preparacao 42 Sao Paulo',
  description:
    'Plataforma de treino intensivo para a Piscine da 42 Sao Paulo. Pratique C, Shell e Python com exercicios interativos, editor integrado e feedback instantaneo.',
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Treino PRO',
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <PWAProvider>
          {children}
          <OfflineIndicator />
          <InstallBanner />
        </PWAProvider>
        <Analytics />
      </body>
    </html>
  )
}
