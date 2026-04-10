import type { Metadata } from 'next'
import Link from 'next/link'
import { motion } from 'motion/react'
import { CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Request Received — RenewShine',
}

export default function BookingSubmittedPage() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-6"
        >
          <CheckCircle size={48} className="mx-auto text-emerald-500" />
          <h1 className="font-display text-3xl font-bold text-slate-900">Request Received!</h1>
          <p className="text-slate-600">We&apos;ll review your photos and send your confirmed quote within 24 hours.</p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-left">
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Details submitted</li>
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Photos uploaded</li>
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Availability noted</li>
              <li className="flex items-center gap-2"><Clock size={16} className="text-amber-500" /> Quote pending — check your email</li>
            </ul>
          </div>

          <Button asChild variant="ghost">
            <Link href="/">Back to Home</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
