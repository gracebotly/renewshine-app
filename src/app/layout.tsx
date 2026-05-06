import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}