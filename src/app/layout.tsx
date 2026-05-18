import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

export const viewport: Viewport = {
  interactiveWidget: 'resizes-content',
  themeColor: '#4A7C59',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://renewshine.co'),
  alternates: {
    canonical: 'https://renewshine.co',
  },
  title: 'RenewShine — Premium House Cleaning Service | DC, MD & VA',
  description:
    'Photo-reviewed residential cleaning in Washington DC, Arlington, Bethesda, McLean, Silver Spring & Northern Virginia. No surprises. Confirmed price before you pay.',
  keywords: [
    'house cleaning DC',
    'cleaning service Arlington VA',
    'cleaning service Bethesda MD',
    'cleaning service McLean VA',
    'residential cleaning DMV',
    'maid service Northern Virginia',
    'move out cleaning Maryland',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RenewShine',
  },
  icons: {
    icon: [{ url: '/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'RenewShine — Premium House Cleaning | DMV Area',
    description:
      'No surprises. No underquoting. Photo-reviewed cleaning service in DC, Maryland & Northern Virginia.',
    url: 'https://renewshine.co',
    siteName: 'RenewShine',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RenewShine — Premium House Cleaning | DMV Area',
    description: 'No surprises. No underquoting. Photo-reviewed cleaning service.',
    images: ['/twitter-card.png'],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? headersList.get('x-invoke-path') ?? ''
  const isAdmin = pathname.startsWith('/admin')

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'HomeAndConstructionBusiness',
              name: 'RenewShine',
              url: 'https://renewshine.co',
              logo: 'https://renewshine.co/logo-primary.svg',
              image: 'https://renewshine.co/og-image.png',
              description:
                'Premium residential cleaning service in Washington DC, Maryland, and Northern Virginia. Photo-reviewed quotes — confirmed price before you pay.',
              telephone: '+17712539204',
              email: 'hello@renewshine.co',
              priceRange: '$$',
              areaServed: [
                { '@type': 'City', name: 'Washington, DC' },
                { '@type': 'City', name: 'Arlington, VA' },
                { '@type': 'City', name: 'Alexandria, VA' },
                { '@type': 'City', name: 'Bethesda, MD' },
                { '@type': 'City', name: 'Silver Spring, MD' },
                { '@type': 'City', name: 'McLean, VA' },
                { '@type': 'City', name: 'Potomac, MD' },
                { '@type': 'City', name: 'Rockville, MD' },
                { '@type': 'City', name: 'Gaithersburg, MD' },
                { '@type': 'City', name: 'Reston, VA' },
              ],
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Cleaning Services',
                itemListElement: [
                  { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Standard House Cleaning' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Deep Cleaning Service' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Move-Out Cleaning' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Move-In Cleaning' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Post-Construction Cleaning' } },
                ],
              },
              sameAs: [],
            }).replace(/</g, '\\u003c'),
          }}
        />
        {isAdmin ? (
          <main className="flex-1">{children}</main>
        ) : (
          <>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </>
        )}
      </body>
    </html>
  )
}
