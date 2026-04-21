'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Services', href: '/#services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Locations', href: '/locations' },
  { label: 'How It Works', href: '/#how-it-works' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 w-full bg-[#1A2E1F] border-b border-[#2d4a35]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-white.svg" alt="RenewShine" width={172} height={44} priority className="h-10 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                  pathname === link.href
                    ? 'text-white bg-white/10'
                    : 'text-[#A8D4B5] hover:text-white hover:bg-white/10'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/admin"
              className="text-sm font-medium text-[#A8D4B5] hover:text-white transition-colors duration-200 px-3 py-2 cursor-pointer"
            >
              Staff
            </Link>
            <Button asChild size="md">
              <Link href="/booking">Get a Quote</Link>
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[#A8D4B5] hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#2d4a35] bg-[#1A2E1F] px-4 pb-4 pt-2">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-3 rounded-lg text-sm font-medium text-[#A8D4B5] hover:text-white hover:bg-white/10 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-[#2d4a35] space-y-2">
              <Button asChild size="md" className="w-full">
                <Link href="/booking">Get a Quote</Link>
              </Button>
              <Link
                href="/admin"
                className="block w-full text-center px-4 py-2 text-sm font-medium text-[#A8D4B5] hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Staff
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}