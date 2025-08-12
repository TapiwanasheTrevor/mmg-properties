import type { Metadata } from 'next'
import '../styles/globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'MMG Properties - Professional Property Management',
  description: 'Comprehensive property management platform for Zimbabwe and diaspora property owners. Manage properties, tenants, maintenance, and finances with real-time updates and professional field agent support.',
  keywords: 'property management, Zimbabwe, diaspora, rental management, maintenance, tenants, real estate',
  authors: [{ name: 'MMG Property Consultancy' }],
  openGraph: {
    title: 'MMG Properties - Professional Property Management',
    description: 'Comprehensive property management for Zimbabwe and diaspora property owners',
    url: 'https://mmgproperties.com',
    siteName: 'MMG Properties',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MMG Properties - Professional Property Management',
    description: 'Comprehensive property management for Zimbabwe and diaspora property owners',
  },
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MMG Properties" />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}