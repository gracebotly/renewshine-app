import Link from 'next/link'
import Image from 'next/image'
import { Mail, Shield } from 'lucide-react'

const footerLinks = {
  Services: [
    { label: 'Standard Clean', href: '/pricing#standard' },
    { label: 'Deep Clean', href: '/pricing#deep' },
    { label: 'Move-In / Move-Out', href: '/pricing#move-out' },
    { label: 'Add-On Services', href: '/pricing#add-ons' },
  ],
  Company: [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Get a Quote', href: '/booking' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand column */}
          <div className="md:col-span-2">
            <Image src="/logo-primary.svg" alt="RenewShine" width={148} height={37} className="h-9 w-auto" />
            <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-xs">
              No surprises. No underquoting. Just a clean you can count on. Serving the DMV area.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href="mailto:renewshinedmv@gmail.com"
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-(--color-brand) transition-colors duration-200"
              >
                <Mail size={14} />
                renewshinedmv@gmail.com
              </a>
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <Shield size={12} />
              Licensed, Insured & Background Checked
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
                {group}
              </h3>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} RenewShine. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            DMV Area · DC · Maryland · Virginia
          </p>
        </div>
      </div>
    </footer>
  )
}
