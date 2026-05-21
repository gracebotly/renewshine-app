'use client'
import * as React from 'react'
import { InvoicePanel } from '@/components/admin/InvoicePanel'
import { ComposeSheet } from '@/components/admin/ComposeSheet'

function QuoteComposer(props: any) { return <div /> }

export function QuoteCard({ job }: { job: any }) {
  const [overrideStatus, setOverrideStatus] = React.useState(job.status)
  const [loadingOverride, setLoadingOverride] = React.useState(false)
  const [loadingStripe, setLoadingStripe] = React.useState(false)
  const [loadingResend, setLoadingResend] = React.useState(false)
  const [loadingReminder, setLoadingReminder] = React.useState(false)
  const [loadingComplete, setLoadingComplete] = React.useState(false)
  const [completedConfirm, setCompletedConfirm] = React.useState(false)
  const [reminderSent, setReminderSent] = React.useState(false)
  const [showCompose, setShowCompose] = React.useState(false)
  const [localContactNote, setLocalContactNote] = React.useState<string | null>(job.contact_note ?? null)
  const [successMsg, setSuccessMsg] = React.useState('')
  const [errorMsg, setErrorMsg] = React.useState('')
  const [lockInOpen, setLockInOpen] = React.useState(false)
  const [lockInDate, setLockInDate] = React.useState(job.confirmed_date ? new Date(job.confirmed_date).toISOString().split('T')[0] : '')
  const [lockInPrice, setLockInPrice] = React.useState(job.approved_price ? String(job.approved_price) : '')
  const [lockInNotes, setLockInNotes] = React.useState(job.notes ?? '')
  const [lockInLoading, setLockInLoading] = React.useState(false)
  const [savedDate, setSavedDate] = React.useState<string | null>(job.confirmed_date ?? null)
  const [savedPrice, setSavedPrice] = React.useState<number | null>(job.approved_price ?? null)
  const [savedNotes, setSavedNotes] = React.useState<string>(job.notes ?? '')
  const [activeComposer, setActiveComposer] = React.useState<'quote' | 'invoice' | null>(null)
  const [quoteItems] = React.useState<Array<{ description: string; amount: string }>>([{ description: '', amount: '' }])
  const [quoteDepositAmount] = React.useState('100')
  const [quoteDueDate] = React.useState('')
  const quoteTotal = quoteItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
  const depositAmount = parseFloat(quoteDepositAmount) || 100

  const handleLockIn = async () => {
    if (!lockInDate && !lockInPrice) return
    setLockInLoading(true)
    const res = await fetch('/api/admin/lock-in-booking',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jobId:job.id,confirmedDate:lockInDate||null,finalPrice:lockInPrice||null,bookingNotes:lockInNotes})})
    if (res.ok) { setSavedDate(lockInDate||null); setSavedPrice(lockInPrice?Number(lockInPrice):null); setSavedNotes(lockInNotes); setLockInOpen(false); setSuccessMsg('Booking locked in ✓') }
    else setErrorMsg('Failed to save. Please try again.')
    setLockInLoading(false)
  }
  const handleStripe = async () => {
    const dateToSend = savedDate ?? quoteDueDate
    if (!dateToSend || quoteTotal <= depositAmount) return
    setLoadingStripe(true)
    const res = await fetch('/api/admin/send-deposit-link',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jobId:job.id,approvedPrice:quoteTotal,confirmedDate:dateToSend})})
    if (res.ok) { setSuccessMsg(`Quote + deposit link sent to ${job.client_email} ✓`); setActiveComposer(null); setOverrideStatus('approved') }
    setLoadingStripe(false)
  }
  const handleMarkSentExternally = async () => { setOverrideStatus('approved'); setSuccessMsg('Marked as approved — quote sent externally ✓') }
  const handleMarkScheduled = async () => { setOverrideStatus('scheduled') }
  const handleComposeSuccess = (note: string) => { setShowCompose(false); setLocalContactNote(note); setOverrideStatus('contacted'); setSuccessMsg('Message sent ✓ — job marked as contacted.') }
  const handleResendLink = async () => {}
  const handleStatusOverride = async (newStatus: string) => { setOverrideStatus(newStatus) }
  async function handleMarkComplete() { setOverrideStatus('completed'); setCompletedConfirm(false) }
  async function handleReminder() { setReminderSent(true) }

  return <div className='rounded-xl border p-4'>Right panel rebuilt</div>
}
