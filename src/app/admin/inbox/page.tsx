'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import {
  Send, ArrowLeft, Bell, BellOff,
  ChevronDown, Zap, Phone, MessageSquare,
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

const PRESET_TAGS = [
  'Hot Lead', 'High Ticket', 'Recurring', 'Bethesda', 'McLean',
  'Commercial', 'Realtor', 'Difficult', 'Airbnb Host',
]

interface QuickReply {
  id: string
  label: string
  body: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

// Deterministic color from phone number — same contact always same color
const AVATAR_COLORS = [
  'bg-violet-500', 'bg-blue-500', 'bg-cyan-500', 'bg-teal-500',
  'bg-emerald-500', 'bg-orange-500', 'bg-rose-500', 'bg-pink-500',
]

function getAvatarColor(phone: string): string {
  const sum = phone.replace(/\D/g, '').split('').reduce((a, d) => a + parseInt(d), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

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

// ─── Main component ───────────────────────────────────────────────────────────

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
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Data loading ──────────────────────────────────────────────────────────

  const loadConversations = useCallback(async () => {
    const { data } = await supabaseBrowser
      .from('sms_conversations')
      .select('*')
      .order('last_message_at', { ascending: false })
    setConversations((data ?? []) as Conversation[])
  }, [])

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
    setActiveConv(conv); setShowThread(true); setShowQuickPanel(false); setShowCrmPanel(false)
    setNotes(conv.notes ?? '')
    await loadMessages(conv.id)

    // Load conversation events (missed calls)
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
    setConversations(p => p.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c))
  }

  const updateStatus = async (convId: string, status: ConvStatus) => {
    await supabaseBrowser.from('sms_conversations').update({ status }).eq('id', convId)
    setActiveConv(p => p ? { ...p, status } : p)
    setConversations(p => p.map(c => c.id === convId ? { ...c, status } : c))
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

  const sendReply = async (text?: string) => {
    const message = (text ?? reply).trim()
    if (!message || !activeConv || sending) return
    setSending(true)
    if (!text) setReply('')
    setShowQuickPanel(false)

    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      conversation_id: activeConv.id,
      direction: 'outbound',
      body: message,
      created_at: new Date().toISOString(),
    }
    setMessages(p => [...p, optimistic])

    try {
      await fetch('/api/admin/sms-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConv.id,
          to: activeConv.contact_phone,
          message,
        }),
      })
      // Show "Sent" confirmation briefly
      setJustSent(true)
      setTimeout(() => setJustSent(false), 2000)
    } catch (err) {
      console.error('send failed:', err)
      setMessages(p => p.filter(m => m.id !== optimistic.id))
      if (!text) setReply(message)
    } finally {
      setSending(false)
      textareaRef.current?.focus()
    }
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendReply()
    }
  }

  const totalUnread = conversations.reduce((s, c) => s + (c.unread_count ?? 0), 0)

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    // svh = "small viewport height" — stable on iOS when keyboard opens
    // dvh resizes as keyboard animates which causes the reply box to jump
    <div className="flex flex-col bg-white" style={{ height: '100svh', maxHeight: '100svh', position: 'fixed', inset: 0 }}>

      {/* ── App header ────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 sm:px-6"
        style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between">
          {/* Back button (mobile thread view) or logo */}
          <div className="flex items-center gap-3">
            {showThread ? (
              <button
                onClick={() => setShowThread(false)}
                className="sm:hidden flex items-center gap-1.5 cursor-pointer rounded-lg px-2 py-1.5 text-sm font-medium text-[#4A7C59] hover:bg-[#e8f3ec] transition-colors duration-150"
              >
                <ArrowLeft size={16} />
                Messages
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4A7C59] text-white">
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

            {/* On mobile thread view: show contact name in header */}
            {showThread && activeConv && (
              <div className="sm:hidden flex items-center gap-2">
                <Avatar name={activeConv.contact_name} phone={activeConv.contact_phone} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-tight">
                    {activeConv.contact_name ?? formatPhone(activeConv.contact_phone)}
                  </p>
                  {activeConv.contact_name && (
                    <p className="text-[10px] text-slate-400">{formatPhone(activeConv.contact_phone)}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Call button — only show when in a thread on mobile */}
            {showThread && activeConv && (
              <a
                href={`tel:${activeConv.contact_phone}`}
                className="sm:hidden flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors duration-150"
                title={`Call ${formatPhone(activeConv.contact_phone)}`}
              >
                <Phone size={15} />
              </a>
            )}

            {/* Push notification toggle */}
            <button
              onClick={enablePush}
              disabled={pushEnabled || pushLoading}
              title={pushEnabled ? 'Notifications enabled' : 'Enable notifications'}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer',
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
                    'w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-slate-100 transition-colors duration-150 cursor-pointer',
                    activeConv?.id === conv.id ? 'bg-[#e8f3ec]' : 'hover:bg-slate-50'
                  )}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <Avatar name={conv.contact_name} phone={conv.contact_phone} />
                    {conv.unread_count > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#4A7C59] px-1 text-[9px] font-bold text-white ring-2 ring-white">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>

                  {/* Content */}
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

                    {/* Source + status badges */}
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
          'flex flex-1 flex-col bg-slate-50',
          !showThread && 'hidden sm:flex'
        )}>
          {!activeConv ? (
            /* Empty state — desktop only */
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100">
                <MessageSquare size={28} className="text-slate-200" />
              </div>
              <p className="text-sm text-slate-400">Select a conversation to start messaging</p>
            </div>
          ) : (
            <>
              {/* Thread header — desktop only (mobile header is in app bar) */}
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
                  {/* CRM panel toggle */}
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

                  {/* Call button */}
                  <a
                    href={`tel:${activeConv.contact_phone}`}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors duration-150"
                    title={`Call ${formatPhone(activeConv.contact_phone)}`}
                  >
                    <Phone size={12} />
                    Call
                  </a>

                  {/* Status selector */}
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

              {/* Mobile: status selector in a slim bar under the app header */}
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

              {/* Messages scroll area — messages + events merged by timestamp */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
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
                          <div className={cn('flex', isOut ? 'justify-end' : 'justify-start')}>
                            <div
                              title={formatFullTime(msg.created_at)}
                              className={cn(
                                'max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                                isOut
                                  ? 'rounded-br-md bg-[#4A7C59] text-white'
                                  : 'rounded-bl-md bg-white text-slate-900 shadow-sm border border-slate-100'
                              )}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.body}</p>
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
                      {/* Tags */}
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
                                  'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-150 cursor-pointer',
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

                      {/* Notes */}
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

              {/* Quick replies panel */}
              <AnimatePresence>
                {showQuickPanel && quickReplies.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="shrink-0 overflow-hidden border-t border-slate-200 bg-white"
                  >
                    <div className="px-3 py-2 space-y-1 max-h-44 overflow-y-auto">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2 px-1">
                        Quick replies
                      </p>
                      {quickReplies.map(qr => (
                        <button
                          key={qr.id}
                          onClick={() => sendReply(qr.body)}
                          className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-left text-xs transition-colors duration-150 hover:border-[#4A7C59]/30 hover:bg-[#e8f3ec] hover:text-[#4A7C59] cursor-pointer"
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

              {/* Reply box — fixed to bottom, above iPhone home bar */}
              <div
                className="shrink-0 border-t border-slate-200 bg-white px-3 pt-3"
                style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
              >
                <div className="flex items-end gap-2">
                  {/* Quick replies toggle */}
                  <button
                    onClick={() => setShowQuickPanel(p => !p)}
                    title="Quick replies"
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-200 cursor-pointer',
                      showQuickPanel
                        ? 'bg-[#4A7C59] text-white'
                        : 'bg-slate-100 text-slate-400 hover:bg-[#e8f3ec] hover:text-[#4A7C59]'
                    )}
                  >
                    <Zap size={15} />
                  </button>

                  {/* Text input */}
                  <textarea
                    ref={textareaRef}
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message…"
                    rows={1}
                    style={{ resize: 'none' }}
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4A7C59]/40 focus:bg-white focus:outline-none focus:ring-0 transition-colors duration-200"
                    onInput={e => {
                      const el = e.currentTarget
                      el.style.height = 'auto'
                      el.style.height = `${Math.min(el.scrollHeight, 120)}px`
                    }}
                  />

                  {/* Send button */}
                  <button
                    onClick={() => sendReply()}
                    disabled={!reply.trim() || sending}
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200 cursor-pointer',
                      reply.trim() && !sending
                        ? 'bg-[#4A7C59] text-white hover:bg-[#3d6b4a] scale-100'
                        : 'bg-slate-100 text-slate-300 cursor-not-allowed scale-95'
                    )}
                  >
                    <Send size={15} className={reply.trim() ? 'translate-x-px' : ''} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
