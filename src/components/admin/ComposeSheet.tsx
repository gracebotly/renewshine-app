'use client'
import * as React from 'react'
import { X, Send } from 'lucide-react'

const SMS_NEED_PHOTOS = (firstName: string, serviceLabel: string) =>
  `Hi ${firstName} — got your ${serviceLabel} request. To confirm your price, I need a few photos or a short video. Reply here or FaceTime works too. — Grace, RenewShine`

function getServiceLabel(serviceType: string | null): string {
  if (serviceType === 'standard') return 'Standard Clean'
  if (serviceType === 'deep') return 'Deep Clean'
  if (serviceType === 'move_out') return 'Move-In / Move-Out'
  if (serviceType === 'post_construction') return 'Post-Construction Cleaning'
  return 'cleaning request'
}

export function ComposeSheet({ job, mediaCount, onClose, onSuccess }: { job: any; mediaCount: number; onClose: () => void; onSuccess: (contactNote: string) => void }) {
  const firstName = job.client_name.split(' ')[0]
  const svcLabel = getServiceLabel(job.service_type)
  const [tab, setTab] = React.useState<'email' | 'sms'>('email')
  const [emailTemplate, setEmailTemplate] = React.useState<'need_photos' | 'custom'>('need_photos')
  const [smsBody, setSmsBody] = React.useState(SMS_NEED_PHOTOS(firstName, svcLabel))
  const [customEmailBody, setCustomEmailBody] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  async function handleSend() { /* same as spec */
    setLoading(true); setError('')
    const body: Record<string, unknown> = { jobId: job.id, method: tab }
    if (tab === 'email') { body.template = emailTemplate; if (emailTemplate === 'custom') body.customBody = customEmailBody.trim() }
    if (tab === 'sms') body.customBody = smsBody.trim()
    const res = await fetch('/api/admin/send-contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { const data = await res.json(); onSuccess(data.contactNote ?? 'Contact sent') } else { const data = await res.json().catch(() => ({})); setError(data.error ?? 'Failed to send. Please try again.') }
    setLoading(false)
  }

  return <div className="fixed inset-0 z-50 flex flex-col bg-white"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><p className="text-base font-semibold text-slate-900">Message {firstName} {mediaCount === 0 ? '· No photos' : ''}</p><button onClick={onClose} className="cursor-pointer rounded-lg p-2 transition-colors duration-200 hover:bg-slate-100"><X size={18} /></button></div><div className="flex gap-2 p-5"><button onClick={() => setTab('email')} className="cursor-pointer rounded-full border px-3 py-1.5 text-xs">Email</button><button onClick={() => setTab('sms')} className="cursor-pointer rounded-full border px-3 py-1.5 text-xs">SMS</button></div><div className="flex-1 overflow-y-auto px-5">{tab==='email'?<><p className="text-sm text-slate-700">Need photos template for {svcLabel}</p><button onClick={()=>setEmailTemplate('need_photos')} className="cursor-pointer text-xs">Need photos</button><button onClick={()=>setEmailTemplate('custom')} className="cursor-pointer text-xs">Custom</button>{emailTemplate==='custom'&&<textarea value={customEmailBody} onChange={(e)=>setCustomEmailBody(e.target.value)} className="w-full rounded-lg border p-2"/>}</>:<textarea value={smsBody} onChange={(e)=>setSmsBody(e.target.value)} className="w-full rounded-lg border p-2" rows={5}/>} {error && <p className="text-sm text-red-600">{error}</p>}</div><div className="border-t border-slate-200 px-5 py-4"><button onClick={handleSend} disabled={loading} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-(--color-brand) px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--color-brand-hover) disabled:cursor-not-allowed disabled:opacity-50"><Send size={15} />{loading?'Sending…':'Send'}</button></div></div>
}
