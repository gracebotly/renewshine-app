'use client'

import * as React from 'react'
import { InvoicePanel } from '@/components/admin/InvoicePanel'
import { ComposeSheet } from '@/components/admin/ComposeSheet'

const STATUS_VARIANTS = {
  new: 'neutral',
  under_review: 'warning',
  approved: 'default',
  scheduled: 'success',
  completed: 'neutral',
  cancelled: 'danger',
} as const

const FREQUENCY_LABELS = {
  one_time: 'One-time',
  weekly: 'Weekly',
  bi_weekly: 'Bi-weekly',
  monthly: 'Monthly',
} as const

function formatService(serviceType: string | null) {
  if (serviceType === 'standard') return 'Standard Clean'
  if (serviceType === 'deep') return 'Deep Clean'
  if (serviceType === 'move_out') return 'Move-In / Move-Out'
  return 'Service'
}

function StepRow({
  number,
  title,
  meta,
  state,
  children,
}: {
  number: number
  title: string
  meta: string
  state: 'active' | 'done' | 'locked'
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {overrideStatus === 'new' && (<div className="rounded-t-xl border-b border-red-100 bg-red-50 px-5 py-4"><p className="text-sm font-bold text-red-700">🚨 Action Required</p><p className="mt-0.5 text-xs text-red-600">Review photos and send a quote</p></div>)}
      <div className="p-5 space-y-0"><div className="flex items-center gap-3 mb-5"><div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-xs font-semibold text-blue-700 shrink-0 select-none">{job.client_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}</div><div><p className="text-sm font-semibold text-slate-900">{job.client_name}</p><p className="text-xs text-slate-500">{formatService(job.service_type)} · {job.bedrooms ?? 0} bed / {job.bathrooms ?? 0} bath</p></div></div><div className="divide-y divide-slate-100"><StepRow number={1} title="Contact customer" meta="Reach out before quoting" state={['new', 'under_review'].includes(overrideStatus) ? 'active' : 'done'}>{['new','under_review'].includes(overrideStatus)?<button onClick={()=>setShowCompose(true)} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-(--color-brand) px-4 py-2.5 text-sm font-semibold text-white">Send message</button>:<button onClick={()=>setShowCompose(true)} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">Send another message</button>}</StepRow><StepRow number={2} title="Send quote + deposit link" meta="Build your quote, then send via Stripe" state={['new','under_review'].includes(overrideStatus)?'locked':['scheduled','completed'].includes(overrideStatus)||job.deposit_paid?'done':'active'}>{overrideStatus==='contacted' && !job.deposit_paid && <button onClick={handleStripe} disabled={!canApprove || loadingStripe} className="w-full rounded-lg bg-(--color-brand) px-4 py-3 text-sm font-semibold text-white">Send quote + $100 deposit link — ${quoteTotal.toFixed(2)} total</button>}</StepRow><StepRow number={3} title="Confirm date + complete job" meta="After deposit is received" state={overrideStatus==='completed'?'done':(job.deposit_paid||overrideStatus==='scheduled')?'active':'locked'}><input type="date" value={confirmedDate} onChange={(e)=>setConfirmedDate(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" /></StepRow><StepRow number={4} title="Send final invoice" meta="Remaining balance after deposit" state={overrideStatus==='completed'?'active':'locked'}>{overrideStatus==='completed'?<InvoicePanel job={job} />:<div className="opacity-30 pointer-events-none"><div className="h-8 rounded-lg border border-slate-200 bg-slate-50" /></div>}</StepRow></div>{successMsg && <p className="mt-4 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">{successMsg}</p>}{errorMsg && <p className="mt-4 text-sm font-medium text-red-600 bg-red-50 rounded-lg px-3 py-2">{errorMsg}</p>}</div>{showCompose && <ComposeSheet job={job} mediaCount={job.job_media?.length ?? 0} onClose={() => setShowCompose(false)} onSuccess={handleComposeSuccess} />}</div>
  )


}
