'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import {
  Send, ArrowLeft, Bell, BellOff,
  ChevronDown, Zap, Phone, MessageSquare,
  X, Image as ImageIcon, FileText, Video,
  CheckCheck, Clock, User,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type ConvStatus = 'open' | 'needs_reply' | 'waiting_on_customer' | 'booked' | 'closed'
type LeadSource = 'sms' | 'facebook_ads' | 'missed_call' | 'website' | 'returning_client'

interface Conversation {
  id: string
  contact_phone: string
  contact_name: string | null
  last_message_at: string
  last_message_preview: string | null
  unread_count: number
  status: ConvStatus
  lead_source: LeadSource
  notes: string | null
  tags: string[]
}

interface Message {
  id: string
  conversation_id: string
  direction: 'inbound' | 'outbound'
  body: string
  media_url: string | null
  media_urls?: string[]
  twilio_status?: string | null
  delivered_at?: string | null
  created_at: string
  _optimistic?: boolean
}


interface JobSnapshot {
  id: string
  service_type: string | null
  bedrooms: number | null
  bathrooms: number | null
  address: string | null
  status: string
  deposit_paid: boolean
  estimated_price_low: number | null
  estimated_price_high: number | null
  approved_price: number | null
  remaining_amount: number | null
  stripe_payment_link: string | null
  service_frequency: string | null
  confirmed_date: string | null
  created_at: string
}

interface ConversationEvent {
  id: string
  conversation_id: string
  event_type: 'missed_call' | 'voicemail'
  duration_sec: number | null
  recording_url: string | null
  created_at: string
}

interface QuickReply {
  id: string
  label: string
  body: string
}

interface PendingMedia {
  file: File
  previewUrl: string
  type: 'image' | 'video' | 'file'
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_TAGS = [
  'Hot Lead', 'High Ticket', 'Recurring', 'Bethesda', 'McLean',
  'Commercial', 'Realtor', 'Difficult', 'Airbnb Host',
]

const STATUS_LABELS: Record<ConvStatus, string> = {
  open: 'Open',
  needs_reply: 'Needs reply',
  waiting_on_customer: 'Waiting',
  booked: 'Booked',
  closed: 'Closed',
}

const STATUS_COLORS: Record<ConvStatus, string> = {
  open: 'bg-slate-100 text-slate-600',
  needs_reply: 'bg-amber-100 text-amber-700',
  waiting_on_customer: 'bg-blue-100 text-blue-700',
  booked: 'bg-[#e8f3ec] text-[#4A7C59]',
  closed: 'bg-slate-100 text-slate-400',
}

const SOURCE_LABELS: Record<LeadSource, string> = {
  sms: 'SMS',
  facebook_ads: 'FB Ad',
  missed_call: 'Missed call',
  website: 'Website',
  returning_client: 'Returning',
}

const SOURCE_COLORS: Record<LeadSource, string> = {
  sms: 'bg-slate-100 text-slate-500',
  facebook_ads: 'bg-blue-100 text-blue-700',
  missed_call: 'bg-purple-100 text-purple-700',
  website: 'bg-[#e8f3ec] text-[#4A7C59]',
  returning_client: 'bg-emerald-100 text-emerald-700',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'short' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatFullTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, '').slice(-10)
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  return phone
}

function getInitials(name: string | null, phone: string): string {
  if (name) {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }
  const digits = phone.replace(/\D/g, '')
  return digits.slice(-2)
}

const AVATAR_COLORS = [
  'bg-violet-500', 'bg-blue-500', 'bg-cyan-500', 'bg-teal-500',
  'bg-emerald-500', 'bg-orange-500', 'bg-rose-500', 'bg-pink-500',
]

function getAvatarColor(phone: string): string {
  const sum = phone.replace(/\D/g, '').split('').reduce((a, d) => a + parseInt(d), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

function formatServiceType(type: string | null): string {
  if (!type) return 'Unknown service'
  return { standard: 'Standard Clean', deep: 'Deep Clean', move_out: 'Move-In/Out', post_construction: 'Post-Construction' }[type] ?? type
}

function formatJobStatus(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    new:          { label: 'New',           color: 'bg-slate-100 text-slate-600' },
    partial:      { label: 'Partial',       color: 'bg-slate-100 text-slate-500' },
    under_review: { label: 'In Review',     color: 'bg-amber-100 text-amber-700' },
    contacted:    { label: 'Contacted',     color: 'bg-blue-100 text-blue-700' },
    approved:     { label: 'Quote Sent',    color: 'bg-purple-100 text-purple-700' },
    scheduled:    { label: 'Scheduled',     color: 'bg-[#e8f3ec] text-[#4A7C59]' },
    completed:    { label: 'Completed',     color: 'bg-emerald-100 text-emerald-700' },
    cancelled:    { label: 'Cancelled',     color: 'bg-red-100 text-red-500' },
  }
  return map[status] ?? { label: status, color: 'bg-slate-100 text-slate-500' }
}

function formatPrice(low: number | null, high: number | null, approved: number | null): string {
  if (approved) return `$${approved.toLocaleString()}`
  if (low && high) return `$${low.toLocaleString()}–$${high.toLocaleString()}`
  if (low) return `$${low.toLocaleString()}+`
  return 'No estimate'
}

function getMediaType(file: File): 'image' | 'video' | 'file' {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  return 'file'
}

/**
 * For Twilio media URLs, route through our proxy so the browser
 * can load them without needing Twilio credentials.
 * Blob URLs (optimistic preview) and Vercel Blob URLs pass through unchanged.
 */
function resolveMediaUrl(url: string): string {
  if (url.includes('api.twilio.com')) {
    return `/api/twilio/media?url=${encodeURIComponent(url)}`
  }
  return url
}

// Max 10 attachments per MMS (Twilio limit)
const MAX_ATTACHMENTS = 10
// Max 5MB per attachment (Twilio MMS limit is ~5MB for most carriers)
const MAX_FILE_SIZE_MB = 5

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, phone, size = 'md' }: { name: string | null; phone: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = getInitials(name, phone)
  const color = getAvatarColor(phone)
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-11 w-11 text-base' : 'h-9 w-9 text-sm'
  return (
    <div className={cn('shrink-0 rounded-full flex items-center justify-center font-semibold text-white', sizeClass, color)}>
      {initials}
    </div>
  )
}

// Media attachment preview strip above the compose bar
function AttachmentStrip({
  attachments,
  onRemove,
}: {
  attachments: PendingMedia[]
  onRemove: (index: number) => void
}) {
  if (attachments.length === 0) return null
  return (
    <div className="flex gap-2 overflow-x-auto px-3 py-2 border-t border-slate-100 bg-white">
      {attachments.map((att, i) => (
        <div key={i} className="relative shrink-0">
          {att.type === 'image' && (
            <img
              src={att.previewUrl}
              alt="Attachment preview"
              className="h-16 w-16 rounded-xl object-cover border border-slate-200"
            />
          )}
          {att.type === 'video' && (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-slate-200 bg-slate-100">
              <Video size={20} className="text-slate-400" />
            </div>
          )}
          {att.type === 'file' && (
            <div className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-100 px-1">
              <FileText size={16} className="text-slate-400" />
              <span className="text-[9px] text-slate-500 truncate w-full text-center px-1">
                {att.file.name.slice(0, 8)}
              </span>
            </div>
          )}
          <button
            onClick={() => onRemove(i)}
            className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full bg-slate-700 text-white shadow-md cursor-pointer"
            style={{ height: 18, width: 18 }}
          >
            <X size={10} />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

function JobDrawer({
  job,
  loading,
  expanded,
  onToggle,
}: {
  job: JobSnapshot | null
  loading: boolean
  expanded: boolean
  onToggle: () => void
}) {
  if (loading) {
    return (
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
          <div className="h-4 w-16 rounded bg-slate-100 animate-pulse" />
        </div>
      </div>
    )
  }
  if (!job) return null
  const statusBadge = formatJobStatus(job.status)
  const priceLabel = formatPrice(job.estimated_price_low, job.estimated_price_high, job.approved_price)
  const serviceLabel = formatServiceType(job.service_type)
  const depositLabel = job.deposit_paid ? 'Deposit paid' : job.status === 'approved' ? 'Deposit pending' : null
  return (
    <div className="shrink-0 border-b border-slate-200 bg-white">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors duration-150">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium', statusBadge.color)}>{statusBadge.label}</span>
          <span className="text-xs font-medium text-slate-700 truncate">{serviceLabel}</span>
          <span className="text-xs text-slate-400 font-mono shrink-0">{priceLabel}</span>
          {depositLabel && <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium', job.deposit_paid ? 'bg-[#e8f3ec] text-[#4A7C59]' : 'bg-amber-100 text-amber-700')}>{depositLabel}</span>}
        </div>
        <ChevronDown size={14} className={cn('shrink-0 text-slate-400 transition-transform duration-200', expanded ? 'rotate-180' : '')} />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: 'easeInOut' }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
                {job.service_type && <div><p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Service</p><p className="text-xs text-slate-700 mt-0.5">{serviceLabel}</p></div>}
                {(job.bedrooms || job.bathrooms) && <div><p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Size</p><p className="text-xs text-slate-700 mt-0.5">{[job.bedrooms && `${job.bedrooms}BR`, job.bathrooms && `${job.bathrooms}BA`].filter(Boolean).join(' / ')}</p></div>}
                {job.service_frequency && <div><p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Frequency</p><p className="text-xs text-slate-700 mt-0.5 capitalize">{job.service_frequency.replace('_', '-')}</p></div>}
                {job.confirmed_date && <div><p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Date</p><p className="text-xs text-slate-700 mt-0.5">{new Date(job.confirmed_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p></div>}
              </div>
              {job.address && <div><p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Address</p><div className="flex items-start gap-2 mt-0.5"><p className="text-xs text-slate-700 flex-1">{job.address}</p><button onClick={() => navigator.clipboard.writeText(job.address!)} className="shrink-0 rounded-md border border-slate-200 px-2 py-0.5 text-[10px] text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors duration-150 cursor-pointer">Copy</button></div></div>}
              {!job.deposit_paid && job.remaining_amount && job.remaining_amount > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2"><p className="text-xs font-medium text-amber-800">Balance due: <span className="font-mono">${job.remaining_amount.toLocaleString()}</span></p></div>}
              <div className="flex flex-wrap gap-2 pt-1">
                <a href={`/admin/jobs/${job.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors duration-150 cursor-pointer">Open Job ↗</a>
                {job.status === 'approved' && !job.deposit_paid && job.stripe_payment_link && <button onClick={async () => { await navigator.clipboard.writeText(job.stripe_payment_link!); alert('Deposit link copied to clipboard') }} className="flex items-center gap-1.5 rounded-lg bg-[#4A7C59] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#3d6b4a] transition-colors duration-150 cursor-pointer">Copy Deposit Link</button>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ContactCard({
  conv,
  job,
  onClose,
}: {
  conv: Conversation
  job: JobSnapshot | null
  onClose: () => void
}) {
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }} className="absolute inset-0 z-20 flex flex-col bg-white sm:relative sm:w-72 sm:border-l sm:border-slate-200">
      <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-4 py-3" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
        <p className="text-sm font-semibold text-slate-900">Contact</p>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors duration-150 cursor-pointer">
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        <div className="flex flex-col items-center gap-2 pt-2 pb-1">
          <Avatar name={conv.contact_name} phone={conv.contact_phone} size="lg" />
          <div className="text-center">
            <p className="text-base font-semibold text-slate-900">{conv.contact_name ?? formatPhone(conv.contact_phone)}</p>
            {conv.contact_name && <p className="text-xs text-slate-400 mt-0.5">{formatPhone(conv.contact_phone)}</p>}
          </div>
          <div className="flex gap-2 mt-1">
            <a href={`tel:${conv.contact_phone}`} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors duration-150"><Phone size={12} />Call</a>
            <button onClick={() => navigator.clipboard.writeText(conv.contact_phone)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors duration-150 cursor-pointer">Copy number</button>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Lead Info</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between"><span className="text-xs text-slate-500">Source</span><span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', SOURCE_COLORS[conv.lead_source])}>{SOURCE_LABELS[conv.lead_source]}</span></div>
            <div className="flex items-center justify-between"><span className="text-xs text-slate-500">Status</span><span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', STATUS_COLORS[conv.status])}>{STATUS_LABELS[conv.status]}</span></div>
            <div className="flex items-center justify-between"><span className="text-xs text-slate-500">First contact</span><span className="text-xs text-slate-700">{new Date(conv.last_message_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
          </div>
        </div>
        {(conv.tags ?? []).length > 0 && <div><p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Tags</p><div className="flex flex-wrap gap-1.5">{(conv.tags ?? []).map(tag => <span key={tag} className="rounded-full border border-[#4A7C59]/20 bg-[#e8f3ec] px-2.5 py-0.5 text-[10px] font-medium text-[#4A7C59]">{tag}</span>)}</div></div>}
        {job && <div><p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Latest Job</p><div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 space-y-2"><div className="flex items-center justify-between"><span className="text-xs font-medium text-slate-700">{formatServiceType(job.service_type)}</span><span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', formatJobStatus(job.status).color)}>{formatJobStatus(job.status).label}</span></div><div className="flex items-center justify-between"><span className="text-xs text-slate-500">Estimate</span><span className="text-xs font-mono text-slate-700">{formatPrice(job.estimated_price_low, job.estimated_price_high, job.approved_price)}</span></div>{job.address && <div><span className="text-xs text-slate-500">Address</span><p className="text-xs text-slate-700 mt-0.5">{job.address}</p></div>}<a href={`/admin/jobs/${job.id}`} target="_blank" rel="noopener noreferrer" className="block text-center rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors duration-150 mt-1">Open Job ↗</a></div></div>}
        {conv.notes && <div><p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Notes</p><p className="text-xs text-slate-600 leading-relaxed">{conv.notes}</p></div>}
      </div>
    </motion.div>
  )
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [showThread, setShowThread] = useState(false)
  const [showQuickPanel, setShowQuickPanel] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)
  const [justSent, setJustSent] = useState(false)
  const [events, setEvents] = useState<ConversationEvent[]>([])
  const [notes, setNotes] = useState('')
  const [notesSaving, setNotesSaving] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)
  const [showCrmPanel, setShowCrmPanel] = useState(false)
  const [jobSnapshot, setJobSnapshot] = useState<JobSnapshot | null>(null)
  const [jobLoading, setJobLoading] = useState(false)
  const [showJobDrawer, setShowJobDrawer] = useState(false)
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([])
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [showContactCard, setShowContactCard] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Data loading ──────────────────────────────────────────────────────────

  const sortConversations = useCallback((convs: Conversation[]): Conversation[] => {
    return [...convs].sort((a, b) => {
      if (a.status === 'needs_reply' && b.status !== 'needs_reply') return -1
      if (b.status === 'needs_reply' && a.status !== 'needs_reply') return 1
      return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    })
  }, [])

  const loadConversations = useCallback(async () => {
    const { data } = await supabaseBrowser
      .from('sms_conversations')
      .select('*')
      .order('last_message_at', { ascending: false })
    setConversations(sortConversations((data ?? []) as Conversation[]))
  }, [sortConversations])

  const loadMessages = useCallback(async (convId: string) => {
    const { data } = await supabaseBrowser
      .from('sms_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
    setMessages((data ?? []) as Message[])
  }, [])

  const loadQuickReplies = useCallback(async () => {
    const { data } = await supabaseBrowser
      .from('quick_replies')
      .select('id, label, body')
      .order('sort_order', { ascending: true })
    setQuickReplies((data ?? []) as QuickReply[])
  }, [])

  useEffect(() => {
    loadConversations()
    loadQuickReplies()
  }, [loadConversations, loadQuickReplies])

  // ── Realtime ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const channel = supabaseBrowser
      .channel('sms_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sms_messages' }, (payload) => {
        const msg = payload.new as Message
        if (activeConv && msg.conversation_id === activeConv.id) {
          setMessages(p => [...p, msg])
        }
        loadConversations()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sms_conversations' }, () => {
        loadConversations()
      })
      .subscribe()
    return () => { supabaseBrowser.removeChannel(channel) }
  }, [activeConv, loadConversations])

  // ── Auto-scroll ───────────────────────────────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Push permission state ─────────────────────────────────────────────────

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushEnabled(Notification.permission === 'granted')
    }
  }, [])

  // ── Actions ───────────────────────────────────────────────────────────────

  const openConversation = async (conv: Conversation) => {
    setActiveConv(conv)
    setShowThread(true)
    setShowQuickPanel(false)
    setShowCrmPanel(false)
    setShowContactCard(false)
    setPendingMedia([])
    setReply('')
    setNotes(conv.notes ?? '')
    setJobSnapshot(null)
    setShowJobDrawer(false)
    await loadMessages(conv.id)

    if (conv.contact_phone) {
      setJobLoading(true)
      const { data: job } = await supabaseBrowser
        .from('jobs')
        .select(`
          id, service_type, bedrooms, bathrooms, address, status,
          deposit_paid, estimated_price_low, estimated_price_high,
          approved_price, remaining_amount, stripe_payment_link,
          service_frequency, confirmed_date, created_at
        `)
        .eq('client_phone', conv.contact_phone)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      setJobSnapshot(job as JobSnapshot | null)
      setJobLoading(false)
    }

    const { data: evtData } = await supabaseBrowser
      .from('conversation_events')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true })
    setEvents((evtData ?? []) as ConversationEvent[])

    await fetch('/api/admin/sms-mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: conv.id }),
    })
    setConversations(p => sortConversations(p.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c)))
  }

  const updateStatus = async (convId: string, status: ConvStatus) => {
    await supabaseBrowser.from('sms_conversations').update({ status }).eq('id', convId)
    setActiveConv(p => p ? { ...p, status } : p)
    setConversations(p => sortConversations(p.map(c => c.id === convId ? { ...c, status } : c)))
  }

  const saveNotes = async () => {
    if (!activeConv) return
    setNotesSaving(true)
    await fetch('/api/admin/conversation-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: activeConv.id, notes }),
    })
    setNotesSaving(false)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }

  const toggleTag = async (tag: string) => {
    if (!activeConv) return
    const current = activeConv.tags ?? []
    const next = current.includes(tag)
      ? current.filter((t: string) => t !== tag)
      : [...current, tag]
    setActiveConv(p => p ? { ...p, tags: next } : p)
    await fetch('/api/admin/conversation-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: activeConv.id, tags: next }),
    })
  }

  // ── Media handling ────────────────────────────────────────────────────────

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setMediaError(null)

    const newAttachments: PendingMedia[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (pendingMedia.length + newAttachments.length >= MAX_ATTACHMENTS) {
        setMediaError(`Max ${MAX_ATTACHMENTS} attachments per message`)
        break
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setMediaError(`${file.name} exceeds ${MAX_FILE_SIZE_MB}MB limit`)
        continue
      }

      const type = getMediaType(file)
      const previewUrl = type !== 'file' ? URL.createObjectURL(file) : ''
      newAttachments.push({ file, previewUrl, type })
    }

    setPendingMedia(p => [...p, ...newAttachments])
  }

  const removeAttachment = (index: number) => {
    setPendingMedia(p => {
      const next = [...p]
      if (next[index]?.previewUrl) {
        URL.revokeObjectURL(next[index].previewUrl)
      }
      next.splice(index, 1)
      return next
    })
    setMediaError(null)
  }

  // ── Send ──────────────────────────────────────────────────────────────────

  const sendReply = async (text?: string) => {
    const message = (text ?? reply).trim()
    const hasMedia = pendingMedia.length > 0
    if ((!message && !hasMedia) || !activeConv || sending) return

    setSending(true)
    if (!text) setReply('')

    // Close quick panel if sending via quick reply
    if (text) setShowQuickPanel(false)

    // Optimistic message in UI
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      conversation_id: activeConv.id,
      direction: 'outbound',
      body: message,
      media_url: pendingMedia[0]?.previewUrl ?? null,
      media_urls: pendingMedia.map(m => m.previewUrl),
      created_at: new Date().toISOString(),
      _optimistic: true,
    }
    setMessages(p => [...p, optimistic])
    setConversations(p => sortConversations(p.map(c => c.id === activeConv.id ? {
      ...c,
      last_message_at: optimistic.created_at,
      last_message_preview: message || (pendingMedia.length > 0 ? 'Media attachment' : c.last_message_preview),
      status: c.status === 'needs_reply' ? 'open' : c.status,
    } : c)))

    const capturedMedia = [...pendingMedia]
    setPendingMedia([])

    if (capturedMedia.length > 0) {
      const fd = new FormData()
      fd.append('conversationId', activeConv.id)
      fd.append('to', activeConv.contact_phone)
      fd.append('message', message)
      for (const att of capturedMedia) {
        fd.append('media', att.file)
      }
      fetch('/api/admin/sms-reply', { method: 'POST', body: fd }).catch(err =>
        console.error('MMS send failed:', err)
      )
    } else {
      fetch('/api/admin/sms-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConv.id,
          to: activeConv.contact_phone,
          message,
        }),
      }).catch(err => console.error('SMS send failed:', err))
    }

    for (const att of capturedMedia) {
      if (att.previewUrl) URL.revokeObjectURL(att.previewUrl)
    }

    setSending(false)
    setJustSent(true)
    setTimeout(() => setJustSent(false), 2500)
    textareaRef.current?.focus()
  }

  const enablePush = async () => {
    if (!('serviceWorker' in navigator)) return
    setPushLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setPushLoading(false); return }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      })
      await fetch('/api/admin/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })
      setPushEnabled(true)
    } catch (err) {
      console.error('push failed:', err)
    } finally {
      setPushLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMobile = navigator.maxTouchPoints > 0
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault()
      sendReply()
    }
  }

  const totalUnread = conversations.reduce((s, c) => s + (c.unread_count ?? 0), 0)
  const canSend = (reply.trim().length > 0 || pendingMedia.length > 0) && !sending

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,application/pdf,.doc,.docx"
        className="hidden"
        onChange={e => handleFileSelect(e.target.files)}
        onClick={e => { (e.target as HTMLInputElement).value = '' }}
      />

      {/* Lightbox for full-size images */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={() => setLightboxUrl(null)}
          >
            <button
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white cursor-pointer"
              onClick={() => setLightboxUrl(null)}
            >
              <X size={18} />
            </button>
            <img
              src={lightboxUrl}
              alt="Full size"
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="flex flex-col bg-white"
        style={{ height: '100svh', maxHeight: '100svh', position: 'fixed', inset: 0 }}
      >

        {/* ── App header ────────────────────────────────────────────────────── */}
        <div
          className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 sm:px-6"
          style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {showThread ? (
                <button
                  onClick={() => { setShowThread(false); setActiveConv(null); setPendingMedia([]) }}
                  className="sm:hidden flex items-center gap-1 cursor-pointer rounded-lg px-2 py-1.5 text-sm font-medium text-[#4A7C59] active:bg-[#e8f3ec] transition-colors duration-150 min-h-[44px] shrink-0"
                >
                  <ArrowLeft size={18} />
                  <span className="text-sm font-semibold">Back</span>
                </button>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4A7C59] text-white shrink-0">
                    <MessageSquare size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                      Messages
                      {totalUnread > 0 && (
                        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#4A7C59] px-1 text-[9px] font-bold text-white">
                          {totalUnread}
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400">(771) 253-9204</p>
                  </div>
                </div>
              )}

              {/* Mobile thread header — contact name (center, truncated) */}
              {showThread && activeConv && (
                <div className="sm:hidden flex items-center gap-2 min-w-0 flex-1">
                  <Avatar name={activeConv.contact_name} phone={activeConv.contact_phone} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 leading-tight truncate">
                      {activeConv.contact_name ?? formatPhone(activeConv.contact_phone)}
                    </p>
                    {activeConv.contact_name && (
                      <p className="text-[10px] text-slate-400 truncate">{formatPhone(activeConv.contact_phone)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 shrink-0">
              {showThread && activeConv && (
                <>
                  <a
                    href={`tel:${activeConv.contact_phone}`}
                    className="sm:hidden flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 active:bg-[#e8f3ec] active:text-[#4A7C59] transition-colors duration-150 cursor-pointer"
                    title={`Call ${formatPhone(activeConv.contact_phone)}`}
                  >
                    <Phone size={16} />
                  </a>
                  <button
                    onClick={() => setShowContactCard(p => !p)}
                    className={cn('sm:hidden flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-150 cursor-pointer', showContactCard ? 'bg-[#4A7C59] text-white' : 'bg-slate-100 text-slate-500')}
                    title="Contact info"
                  >
                    <User size={16} />
                  </button>
                </>
              )}

              <button
                onClick={enablePush}
                disabled={pushEnabled || pushLoading}
                title={pushEnabled ? 'Notifications enabled' : 'Enable notifications'}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer min-h-[36px]',
                  pushEnabled
                    ? 'border-[#4A7C59]/20 bg-[#e8f3ec] text-[#4A7C59]'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-[#4A7C59]/30 hover:text-[#4A7C59]',
                  (pushEnabled || pushLoading) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {pushEnabled ? <Bell size={13} /> : <BellOff size={13} />}
                <span className="hidden sm:inline">
                  {pushEnabled ? 'Notifications on' : 'Enable notifications'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Conversation list ──────────────────────────────────────────── */}
          <div className={cn(
            'flex flex-col bg-white w-full border-r border-slate-200 sm:w-72 lg:w-80',
            showThread && 'hidden sm:flex'
          )}>
            {conversations.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <MessageSquare size={24} className="text-slate-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">No messages yet</p>
                  <p className="mt-1 text-xs text-slate-400">Texts to (771) 253-9204 appear here</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-slate-100 transition-colors duration-150 cursor-pointer min-h-[72px]',
                      activeConv?.id === conv.id ? 'bg-[#e8f3ec]' : 'hover:bg-slate-50'
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar name={conv.contact_name} phone={conv.contact_phone} />
                      {conv.unread_count > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#4A7C59] px-1 text-[9px] font-bold text-white ring-2 ring-white">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={cn(
                          'truncate text-sm',
                          conv.unread_count > 0 ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                        )}>
                          {conv.contact_name ?? formatPhone(conv.contact_phone)}
                        </p>
                        <p className="shrink-0 text-[10px] text-slate-400">
                          {formatTime(conv.last_message_at)}
                        </p>
                      </div>

                      {conv.last_message_preview && (
                        <p className={cn(
                          'truncate text-xs mt-0.5',
                          conv.unread_count > 0 ? 'text-slate-600' : 'text-slate-400'
                        )}>
                          {conv.last_message_preview}
                        </p>
                      )}

                      <div className="mt-1.5 flex items-center gap-1">
                        <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', SOURCE_COLORS[conv.lead_source])}>
                          {SOURCE_LABELS[conv.lead_source]}
                        </span>
                        <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', STATUS_COLORS[conv.status])}>
                          {STATUS_LABELS[conv.status]}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Thread panel ──────────────────────────────────────────────── */}
          <div className={cn(
            'relative flex flex-1 flex-col bg-slate-50',
            !showThread && 'hidden sm:flex'
          )}>
            {!activeConv ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100">
                  <MessageSquare size={28} className="text-slate-200" />
                </div>
                <p className="text-sm text-slate-400">Select a conversation to start messaging</p>
              </div>
            ) : (
              <>
                {/* Thread header — desktop */}
                <div className="hidden sm:flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={activeConv.contact_name} phone={activeConv.contact_phone} size="md" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {activeConv.contact_name ?? formatPhone(activeConv.contact_phone)}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {activeConv.contact_name && (
                          <span className="text-xs text-slate-400">{formatPhone(activeConv.contact_phone)}</span>
                        )}
                        <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', SOURCE_COLORS[activeConv.lead_source])}>
                          {SOURCE_LABELS[activeConv.lead_source]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCrmPanel(p => !p)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer',
                        showCrmPanel
                          ? 'border-[#4A7C59]/30 bg-[#e8f3ec] text-[#4A7C59]'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                      )}
                    >
                      Notes
                    </button>

                    <a
                      href={`tel:${activeConv.contact_phone}`}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors duration-150"
                    >
                      <Phone size={12} />
                      Call
                    </a>

                    <div className="relative">
                      <select
                        value={activeConv.status}
                        onChange={e => updateStatus(activeConv.id, e.target.value as ConvStatus)}
                        className={cn(
                          'cursor-pointer appearance-none rounded-lg border-0 py-1.5 pl-2.5 pr-7 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 transition-colors duration-200',
                          STATUS_COLORS[activeConv.status]
                        )}
                      >
                        {(Object.keys(STATUS_LABELS) as ConvStatus[]).map(s => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                      <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-50" />
                    </div>
                  </div>
                </div>

                <JobDrawer
                  job={jobSnapshot}
                  loading={jobLoading}
                  expanded={showJobDrawer}
                  onToggle={() => setShowJobDrawer(p => !p)}
                />

                {/* Mobile: slim status bar */}
                <div className="sm:hidden flex items-center justify-between border-b border-slate-100 bg-white px-4 py-2">
                  <div className="relative flex items-center">
                    <select
                      value={activeConv.status}
                      onChange={e => updateStatus(activeConv.id, e.target.value as ConvStatus)}
                      className={cn(
                        'cursor-pointer appearance-none rounded-lg border-0 py-1 pl-2 pr-6 text-xs font-medium focus:outline-none',
                        STATUS_COLORS[activeConv.status]
                      )}
                    >
                      {(Object.keys(STATUS_LABELS) as ConvStatus[]).map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                    <ChevronDown size={10} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 opacity-50" />
                  </div>
                  <p className="text-[10px] text-slate-400">{messages.length} message{messages.length !== 1 ? 's' : ''}</p>
                </div>

                {/* Messages scroll area */}
                <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-1">
                  <AnimatePresence initial={false}>
                    {[
                      ...messages.map(m => ({ ...m, _type: 'message' as const })),
                      ...events.map(e => ({ ...e, _type: 'event' as const })),
                    ]
                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((item, i, arr) => {
                        const prevItem = arr[i - 1]
                        const showTimestamp =
                          !prevItem ||
                          new Date(item.created_at).getTime() - new Date(prevItem.created_at).getTime() > 5 * 60 * 1000

                        if (item._type === 'event') {
                          return (
                            <motion.div key={`evt-${item.id}`}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {showTimestamp && (
                                <p className="text-center text-[10px] text-slate-400 py-2">
                                  {formatFullTime(item.created_at)}
                                </p>
                              )}
                              <div className="flex justify-center py-1">
                                <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 shadow-sm">
                                  <span>📞</span>
                                  <span>Missed call</span>
                                  <span className="text-slate-300">·</span>
                                  <span>{formatTime(item.created_at)}</span>
                                </div>
                              </div>
                            </motion.div>
                          )
                        }

                        // Regular message
                        const msg = item
                        const isOut = msg.direction === 'outbound'
                        // Normalize media URLs — support both old single field and new array
                        const mediaArr: string[] = msg.media_urls?.length
                          ? msg.media_urls
                          : msg.media_url
                            ? [msg.media_url]
                            : []

                        return (
                          <motion.div key={msg.id}
                            initial={{ opacity: 0, y: 8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                          >
                            {showTimestamp && (
                              <p className="text-center text-[10px] text-slate-400 py-2">
                                {formatFullTime(item.created_at)}
                              </p>
                            )}
                            <div className={cn('flex items-end gap-1.5', isOut ? 'justify-end' : 'justify-start')}>
                              {/* Inbound avatar */}
                              {!isOut && (
                                <Avatar
                                  name={activeConv.contact_name}
                                  phone={activeConv.contact_phone}
                                  size="sm"
                                />
                              )}

                              <div className={cn('flex flex-col', isOut ? 'items-end' : 'items-start')}>
                                <div
                                  title={formatFullTime(msg.created_at)}
                                  className={cn(
                                    'max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                                    isOut
                                      ? 'rounded-br-md bg-[#4A7C59] text-white'
                                      : 'rounded-bl-md bg-white text-slate-900 shadow-sm border border-slate-100',
                                    (msg as Message)._optimistic ? 'opacity-75' : ''
                                  )}
                                >
                                  {msg.body && <p className="whitespace-pre-wrap break-words">{msg.body}</p>}
                                  {/* Media grid */}
                                  {mediaArr.length > 0 && (
                                    <div
                                      className={cn('grid gap-1 mt-1.5', mediaArr.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}
                                      style={{ maxWidth: 240 }}
                                    >
                                      {mediaArr.slice(0, 4).map((url, idx) => {
                                        const isImg = /\.(jpg|jpeg|png|gif|webp)/i.test(url) || url.includes('api.twilio.com') || url.startsWith('blob:')
                                        const isVid = /\.(mp4|mov|webm|3gp)/i.test(url)
                                        return (
                                          <div
                                            key={idx}
                                            className="relative overflow-hidden rounded-xl cursor-pointer"
                                            onClick={() => isImg && setLightboxUrl(resolveMediaUrl(url))}
                                          >
                                            {isImg && (
                                              <img
                                                src={resolveMediaUrl(url)}
                                                alt="Media"
                                                className="w-full object-cover"
                                                style={{ maxHeight: mediaArr.length === 1 ? 280 : 140 }}
                                                loading="lazy"
                                              />
                                            )}
                                            {isVid && (
                                              <video
                                                src={resolveMediaUrl(url)}
                                                controls
                                                playsInline
                                                className="w-full rounded-xl"
                                                style={{ maxHeight: 200, maxWidth: 240 }}
                                              />
                                            )}
                                            {!isImg && !isVid && (
                                              <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 no-underline"
                                                onClick={e => e.stopPropagation()}
                                              >
                                                <FileText size={16} className="shrink-0 text-slate-400" />
                                                <span className="text-xs text-slate-600 truncate">{url.split('/').pop()}</span>
                                              </a>
                                            )}
                                            {idx === 3 && mediaArr.length > 4 && (
                                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                                                <span className="text-sm font-semibold text-white">+{mediaArr.length - 4}</span>
                                              </div>
                                            )}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Delivery state indicator for outbound */}
                                {isOut && (
                                  <div className="mt-0.5 flex items-center gap-1 pr-1">
                                    {msg._optimistic ? (
                                      // Still uploading / in-flight
                                      <div className="h-2.5 w-2.5 rounded-full border border-slate-300 border-t-transparent animate-spin" />
                                    ) : msg.twilio_status === 'failed' || msg.twilio_status === 'undelivered' ? (
                                      // Failed — red indicator
                                      <span className="text-[10px] text-red-400 font-medium">Failed</span>
                                    ) : msg.twilio_status === 'delivered' ? (
                                      // Delivered — double check + timestamp
                                      <span className="text-[10px] text-[#4A7C59] flex items-center gap-0.5">
                                        <CheckCheck size={10} />
                                        {msg.delivered_at
                                          ? new Date(msg.delivered_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                                          : 'Delivered'}
                                      </span>
                                    ) : (
                                      // Sent but not yet delivered
                                      <CheckCheck size={10} className="text-slate-300" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })
                    }
                  </AnimatePresence>

                  <AnimatePresence>
                    {justSent && (
                      <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-right text-[10px] text-slate-400 pr-1"
                      >
                        Sent
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <div ref={bottomRef} />
                </div>

                {/* CRM panel — notes + tags */}
                <AnimatePresence>
                  {showCrmPanel && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="shrink-0 overflow-hidden border-t border-slate-200 bg-white"
                    >
                      <div className="px-4 py-3 space-y-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Tags</p>
                          <div className="flex flex-wrap gap-1.5">
                            {PRESET_TAGS.map(tag => {
                              const active = (activeConv.tags ?? []).includes(tag)
                              return (
                                <button
                                  key={tag}
                                  onClick={() => toggleTag(tag)}
                                  className={cn(
                                    'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-150 cursor-pointer min-h-[32px]',
                                    active
                                      ? 'border-[#4A7C59]/30 bg-[#e8f3ec] text-[#4A7C59]'
                                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                  )}
                                >
                                  {tag}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Internal notes</p>
                          <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            onBlur={saveNotes}
                            placeholder="Dog in house. Prefers text. Interested in bi-weekly…"
                            rows={3}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#4A7C59]/40 focus:bg-white focus:outline-none focus:ring-0 transition-colors duration-200 resize-none"
                          />
                          <p className="mt-1 text-right text-[10px] text-slate-400">
                            {notesSaving ? 'Saving…' : notesSaved ? '✓ Saved' : 'Saves on blur'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick replies panel — with close button */}
                <AnimatePresence>
                  {showQuickPanel && quickReplies.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="shrink-0 overflow-hidden border-t border-slate-200 bg-white"
                    >
                      <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                          Quick replies
                        </p>
                        <button
                          onClick={() => setShowQuickPanel(false)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors duration-150 cursor-pointer"
                          aria-label="Close quick replies"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <div className="px-3 pb-2 space-y-1 max-h-44 overflow-y-auto">
                        {quickReplies.map(qr => (
                          <button
                            key={qr.id}
                            onClick={() => sendReply(qr.body)}
                            className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-left text-xs transition-colors duration-150 hover:border-[#4A7C59]/30 hover:bg-[#e8f3ec] hover:text-[#4A7C59] cursor-pointer min-h-[52px]"
                          >
                            <span className="font-semibold text-slate-700">{qr.label}</span>
                            <span className="block truncate text-slate-400 mt-0.5">
                              {qr.body.slice(0, 90)}{qr.body.length > 90 ? '…' : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Reply box ─────────────────────────────────────────────── */}

                {/* Media error toast */}
                <AnimatePresence>
                  {mediaError && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="shrink-0 border-t border-red-100 bg-red-50 px-4 py-2"
                    >
                      <p className="text-xs text-red-600">{mediaError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Attachment preview strip */}
                <AttachmentStrip attachments={pendingMedia} onRemove={removeAttachment} />

                {/* Compose area */}
                <div
                  className="shrink-0 border-t border-slate-200 bg-white px-3 pt-2.5"
                  style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
                >
                  <div className="flex items-end gap-2">

                    {/* Media attach button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach photo, video, or file"
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors duration-200 cursor-pointer',
                        pendingMedia.length > 0
                          ? 'bg-[#4A7C59] text-white'
                          : 'bg-slate-100 text-slate-400 hover:bg-[#e8f3ec] hover:text-[#4A7C59]'
                      )}
                    >
                      {pendingMedia.length > 0 ? (
                        <span className="text-[11px] font-bold">{pendingMedia.length}</span>
                      ) : (
                        <ImageIcon size={17} />
                      )}
                    </button>

                    {/* Quick replies toggle */}
                    <button
                      onClick={() => setShowQuickPanel(p => !p)}
                      title="Quick replies"
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors duration-200 cursor-pointer',
                        showQuickPanel
                          ? 'bg-[#4A7C59] text-white'
                          : 'bg-slate-100 text-slate-400 hover:bg-[#e8f3ec] hover:text-[#4A7C59]'
                      )}
                    >
                      <Zap size={16} />
                    </button>

                    {/* Text input */}
                    <textarea
                      ref={textareaRef}
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={pendingMedia.length > 0 ? 'Add a caption…' : 'Message…'}
                      rows={1}
                      style={{ resize: 'none' }}
                      className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4A7C59]/40 focus:bg-white focus:outline-none focus:ring-0 transition-colors duration-200 leading-relaxed"
                      onInput={e => {
                        const el = e.currentTarget
                        el.style.height = 'auto'
                        el.style.height = `${Math.min(el.scrollHeight, 120)}px`
                      }}
                    />

                    {/* Send button */}
                    <button
                      onClick={() => sendReply()}
                      disabled={!canSend}
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-200 cursor-pointer',
                        canSend
                          ? 'bg-[#4A7C59] text-white hover:bg-[#3d6b4a]'
                          : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                      )}
                    >
                      {sending ? (
                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      ) : (
                        <Send size={16} className={canSend ? 'translate-x-px' : ''} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
            </div>

            <AnimatePresence>
              {showContactCard && activeConv && (
                <ContactCard conv={activeConv} job={jobSnapshot} onClose={() => setShowContactCard(false)} />
              )}
            </AnimatePresence>

          </div>
      </div>
    </>
  )
}
