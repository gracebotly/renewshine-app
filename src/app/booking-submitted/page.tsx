'use client'

import * as React from 'react'
import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'motion/react'
import { CheckCircle, Clock, Mail, Phone, ClipboardCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

function SubmittedContent() {
  const params = useSearchParams()
  const name = params.get('name') ?? ''
  const email = params.get('email') ?? ''
  const phone = params.get('phone') ?? ''
  const firstName = name.split(' ')[0] ?? 'there'

  return (
    <section className="min-h-screen bg-white py-20">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-6"
        >
          {/* Logo mark */}
          <div className="flex justify-center mb-2">
            <Image
              src="/logo-mark.svg"
              alt="RenewShine"
              width={48}
              height={48}
              className="w-12 h-12"
            />
          </div>

          {/* Success icon */}
          <CheckCircle size={48} className="mx-auto text-emerald-500" />

          {/* Heading */}
          <h1 className="font-display text-3xl font-bold text-slate-900">
            {firstName ? `Got it, ${firstName}!` : 'Request Received!'}
          </h1>
          <p className="text-slate-600">
            We&apos;re reviewing your photos now. You&apos;ll hear from us as soon as possible — usually within a few hours.
          </p>

          {/* Contact confirmation card — check and balance for typos */}
          {(email || phone) && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-left space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                We&apos;ll reach you at
              </p>

              {email && (
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-slate-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-900 break-all">{email}</span>
                </div>
              )}

              {phone && (
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-700">{phone}</span>
                </div>
              )}

              <p className="text-xs text-slate-500 pt-1">
                Don&apos;t see a confirmation email within 5 minutes? Check your spam folder or{' '}
                <Link href="/booking" className="underline text-slate-600 hover:text-slate-900 transition-colors duration-200">
                  resubmit with the correct address
                </Link>
                .
              </p>
            </div>
          )}

          {/* What happens next card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-left space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              What happens next
            </p>
            <div className="flex items-start gap-3">
              <ClipboardCheck size={15} className="text-brand mt-0.5 shrink-0" />
              <span className="text-sm text-slate-700">
                We&apos;ll review your photos and confirm your exact price
              </span>
            </div>
            <div className="flex items-start gap-3">
              <Mail size={15} className="text-brand mt-0.5 shrink-0" />
              <span className="text-sm text-slate-700">
                We&apos;ll reach out by your preferred contact method with your quote
              </span>
            </div>
          </div>

          {/* Status checklist */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-left">
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                Details submitted
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                Photos uploaded
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                Availability noted
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} className="text-amber-500 shrink-0" />
                Quote incoming — check your email
              </li>
            </ul>
          </div>

          {/* Back to home */}
          <Button asChild variant="ghost">
            <Link href="/">Back to Home</Link>
          </Button>

          {/* Admin access link — discreet, owner-only, at the bottom */}
          <p className="text-xs text-slate-300 pt-4">
            <Link
              href="/admin/login"
              className="hover:text-slate-500 transition-colors duration-200"
            >
              Admin login
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default function BookingSubmittedPage() {
  return (
    <Suspense>
      <SubmittedContent />
    </Suspense>
  )
}
