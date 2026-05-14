'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Nav link config.
 * type 'page'   → standard Next.js Link to a separate route
 * type 'anchor' → scrolls to a section ID on the homepage.
 *                 If already on '/', scrolls directly.
 *                 If on any other page, navigates to '/' first then scrolls after mount.
 */
type NavLink =
  | { label: string; type: 'page'; href: string }
  | { label: string; type: 'anchor'; sectionId: string }

const navLinks: NavLink[] = [
  { label: 'Services',     type: 'anchor', sectionId: 'services'     },
  { label: 'How It Works', type: 'anchor', sectionId: 'how-it-works' },
  { label: 'Locations',    type: 'page',   href: '/locations'         },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  // Stores the sectionId to scroll to after a homepage navigation completes
  const pendingScroll = React.useRef<string | null>(null)

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // After navigating to '/', scroll to the pending section
  React.useEffect(() => {
    if (pathname === '/' && pendingScroll.current) {
      const id = pendingScroll.current
      pendingScroll.current = null
      // Small delay lets the page render before scrolling
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 120)
    }
  }, [pathname])

  function handleAnchorClick(
    e: React.MouseEvent,
    sectionId: string
  ) {
    e.preventDefault()
    setMobileOpen(false)

    if (pathname === '/') {
      // Already on homepage — scroll directly
      const el = document.getElementById(sectionId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      // On another page — store the target and navigate home
      pendingScroll.current = sectionId
      router.push('/')
    }
  }

  function renderLink(link: NavLink, mobile = false) {
    const baseClass = mobile
      ? 'px-4 py-3 rounded-lg text-sm font-medium text-[#A8D4B5] hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer'
      : cn(
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer',
          link.type === 'page' && pathname === link.href
            ? 'text-white bg-white/10'
            : 'text-[#A8D4B5] hover:text-white hover:bg-white/10'
        )

    if (link.type === 'anchor') {
      return (
        <a
          key={link.sectionId}
          href={`/#${link.sectionId}`}
          onClick={(e) => handleAnchorClick(e, link.sectionId)}
          className={baseClass}
        >
          {link.label}
        </a>
      )
    }

    return (
      <Link
        key={link.href}
        href={link.href}
        className={baseClass}
      >
        {link.label}
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[#1A2E1F] border-b border-[#2d4a35]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo — click takes you home */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-white.svg"
              alt="RenewShine"
              width={172}
              height={44}
              priority
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => renderLink(link))}
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
            {navLinks.map((link) => renderLink(link, true))}
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
