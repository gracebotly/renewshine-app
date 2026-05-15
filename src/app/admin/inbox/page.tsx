'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import {
  MessageCircle, Send, ArrowLeft,
  Bell, BellOff, ChevronDown, Zap,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

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
}

interface Message {
  id: string
  conversation_id: string
  direction: 'inbound' | 'outbound'
  body: string
  created_at: string
}

interface QuickReply {
  id: string
  label: string
  body: string
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'short' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, '').slice(-10)
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  return phone
}

const STATUS_LABELS: Record<ConvStatus, string> = {
  open: 'Open', needs_reply: 'Needs reply',
  waiting_on_customer: 'Waiting', booked: 'Booked', closed: 'Closed',
}
const STATUS_COLORS: Record<ConvStatus, string> = {
  open: 'bg-slate-100 text-slate-600', needs_reply: 'bg-amber-100 text-amber-700',
  waiting_on_customer: 'bg-blue-100 text-blue-700',
  booked: 'bg-[#e8f3ec] text-[#4A7C59]', closed: 'bg-slate-100 text-slate-400',
}
const SOURCE_LABELS: Record<LeadSource, string> = {
  sms: 'SMS', facebook_ads: 'FB Ad', missed_call: 'Missed call',
  website: 'Website', returning_client: 'Returning',
}
const SOURCE_COLORS: Record<LeadSource, string> = {
  sms: 'bg-slate-100 text-slate-500', facebook_ads: 'bg-blue-100 text-blue-700',
  missed_call: 'bg-purple-100 text-purple-700',
  website: 'bg-[#e8f3ec] text-[#4A7C59]', returning_client: 'bg-emerald-100 text-emerald-700',
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
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const loadConversations = useCallback(async () => {
    const { data } = await supabaseBrowser
      .from('sms_conversations').select('*')
      .order('last_message_at', { ascending: false })
    setConversations((data ?? []) as Conversation[])
  }, [])

  const loadMessages = useCallback(async (convId: string) => {
    const { data } = await supabaseBrowser
      .from('sms_messages').select('*').eq('conversation_id', convId)
      .order('created_at', { ascending: true })
    setMessages((data ?? []) as Message[])
  }, [])

  const loadQuickReplies = useCallback(async () => {
    const { data } = await supabaseBrowser
      .from('quick_replies').select('id, label, body')
      .order('sort_order', { ascending: true })
    setQuickReplies((data ?? []) as QuickReply[])
  }, [])

  useEffect(() => { loadConversations(); loadQuickReplies() }, [loadConversations, loadQuickReplies])

  useEffect(() => {
    const channel = supabaseBrowser
      .channel('sms_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sms_messages' }, (payload) => {
        const msg = payload.new as Message
        if (activeConv && msg.conversation_id === activeConv.id) setMessages(p => [...p, msg])
        loadConversations()
      }).subscribe()
    return () => { supabaseBrowser.removeChannel(channel) }
  }, [activeConv, loadConversations])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window)
      setPushEnabled(Notification.permission === 'granted')
  }, [])

  const openConversation = async (conv: Conversation) => {
    setActiveConv(conv); setShowThread(true); setShowQuickPanel(false)
    await loadMessages(conv.id)
    await fetch('/api/admin/sms-mark-read', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: conv.id }),
    })
    setConversations(p => p.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c))
  }

  const updateStatus = async (convId: string, status: ConvStatus) => {
    await supabaseBrowser.from('sms_conversations').update({ status }).eq('id', convId)
    setActiveConv(p => p ? { ...p, status } : p)
    setConversations(p => p.map(c => c.id === convId ? { ...c, status } : c))
  }

  const sendReply = async (text?: string) => {
    const message = (text ?? reply).trim()
    if (!message || !activeConv || sending) return
    setSending(true); if (!text) setReply(''); setShowQuickPanel(false)
    const optimistic: Message = {
      id: `opt-${Date.now()}`, conversation_id: activeConv.id,
      direction: 'outbound', body: message, created_at: new Date().toISOString(),
    }
    setMessages(p => [...p, optimistic])
    try {
      await fetch('/api/admin/sms-reply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeConv.id, to: activeConv.contact_phone, message }),
      })
    } catch (err) {
      console.error('send failed:', err)
      setMessages(p => p.filter(m => m.id !== optimistic.id))
      if (!text) setReply(message)
    } finally { setSending(false); textareaRef.current?.focus() }
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })
      setPushEnabled(true)
    } catch (err) { console.error('push failed:', err) }
    finally { setPushLoading(false) }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() }
  }

  const totalUnread = conversations.reduce((s, c) => s + (c.unread_count ?? 0), 0)

  return (
    <div className="flex flex-col bg-slate-50" style={{ height: '100dvh' }}>

      {/* Header */}
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4A7C59] text-white">
              <MessageCircle size={18} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                SMS Inbox
                {totalUnread > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4A7C59] px-1.5 text-xs font-medium text-white">
                    {totalUnread}
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500">(771) 253-9204</p>
            </div>
          </div>
          <button
            onClick={enablePush} disabled={pushEnabled || pushLoading}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors duration-200 cursor-pointer',
              pushEnabled ? 'border-[#4A7C59]/20 bg-[#e8f3ec] text-[#4A7C59]'
                : 'border-slate-200 bg-white text-slate-600 hover:border-[#4A7C59]/30 hover:text-[#4A7C59]',
              (pushEnabled || pushLoading) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {pushEnabled ? <Bell size={13} /> : <BellOff size={13} />}
            {pushEnabled ? 'Notifications on' : 'Enable notifications'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Conversation list */}
        <div className={cn(
          'flex flex-col border-r border-slate-200 bg-white w-full sm:w-72 lg:w-80',
          showThread && 'hidden sm:flex'
        )}>
          <div className="shrink-0 border-b border-slate-100 px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 p-8 text-center h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <MessageCircle size={22} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">No messages yet</p>
                  <p className="mt-1 text-xs text-slate-400">Texts to (771) 253-9204 appear here</p>
                </div>
              </div>
            ) : conversations.map(conv => (
              <button key={conv.id} onClick={() => openConversation(conv)}
                className={cn(
                  'w-full border-b border-slate-50 px-4 py-3 text-left transition-colors duration-150 cursor-pointer',
                  activeConv?.id === conv.id ? 'bg-[#e8f3ec]' : 'hover:bg-slate-50'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className={cn('truncate text-sm', conv.unread_count > 0 ? 'font-semibold text-slate-900' : 'font-medium text-slate-700')}>
                        {conv.contact_name ?? formatPhone(conv.contact_phone)}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#4A7C59] px-1 text-[10px] font-bold text-white">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1 flex-wrap">
                      <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', SOURCE_COLORS[conv.lead_source])}>
                        {SOURCE_LABELS[conv.lead_source]}
                      </span>
                      <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', STATUS_COLORS[conv.status])}>
                        {STATUS_LABELS[conv.status]}
                      </span>
                    </div>
                    {conv.last_message_preview && (
                      <p className="mt-1 truncate text-xs text-slate-400">{conv.last_message_preview}</p>
                    )}
                  </div>
                  <p className="shrink-0 text-[10px] text-slate-400 mt-0.5">{formatTime(conv.last_message_at)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thread */}
        <div className={cn('flex flex-1 flex-col bg-white', !showThread && 'hidden sm:flex')}>
          {!activeConv ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <MessageCircle size={26} className="text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-400">Select a conversation</p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="shrink-0 flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowThread(false)}
                    className="sm:hidden cursor-pointer rounded-lg p-1 text-slate-500 hover:bg-slate-100 transition-colors duration-150">
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {activeConv.contact_name ?? formatPhone(activeConv.contact_phone)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', SOURCE_COLORS[activeConv.lead_source])}>
                        {SOURCE_LABELS[activeConv.lead_source]}
                      </span>
                      {activeConv.contact_name && (
                        <span className="text-xs text-slate-400">{formatPhone(activeConv.contact_phone)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <select value={activeConv.status}
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
                  <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-50" />
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                <AnimatePresence initial={false}>
                  {messages.map(msg => (
                    <motion.div key={msg.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className={cn('flex', msg.direction === 'outbound' ? 'justify-end' : 'justify-start')}
                    >
                      <div className={cn(
                        'max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                        msg.direction === 'outbound'
                          ? 'rounded-br-sm bg-[#4A7C59] text-white'
                          : 'rounded-bl-sm bg-slate-100 text-slate-900'
                      )}>
                        <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                        <p className={cn('mt-1 text-[10px]', msg.direction === 'outbound' ? 'text-white/60' : 'text-slate-400')}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>

              {/* Quick replies panel */}
              <AnimatePresence>
                {showQuickPanel && quickReplies.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                    className="shrink-0 border-t border-slate-100 bg-slate-50 px-3 py-2 space-y-1 max-h-44 overflow-y-auto"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Quick replies</p>
                    {quickReplies.map(qr => (
                      <button key={qr.id} onClick={() => sendReply(qr.body)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 transition-colors duration-150 hover:border-[#4A7C59]/30 hover:bg-[#e8f3ec] hover:text-[#4A7C59] cursor-pointer"
                      >
                        <span className="font-semibold">{qr.label}</span>
                        <span className="block truncate text-slate-400 mt-0.5">
                          {qr.body.slice(0, 80)}{qr.body.length > 80 ? '…' : ''}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reply box */}
              <div className="shrink-0 border-t border-slate-100 bg-white px-3 py-3">
                <div className="flex items-end gap-2">
                  <button onClick={() => setShowQuickPanel(p => !p)} title="Quick replies"
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 cursor-pointer',
                      showQuickPanel ? 'bg-[#4A7C59] text-white' : 'bg-slate-100 text-slate-500 hover:bg-[#e8f3ec] hover:text-[#4A7C59]'
                    )}
                  >
                    <Zap size={16} />
                  </button>
                  <textarea ref={textareaRef} value={reply}
                    onChange={e => setReply(e.target.value)} onKeyDown={handleKeyDown}
                    placeholder="Reply as RenewShine…" rows={1} style={{ resize: 'none' }}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4A7C59]/40 focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/10 transition-colors duration-200"
                    onInput={e => {
                      const el = e.currentTarget; el.style.height = 'auto'
                      el.style.height = `${Math.min(el.scrollHeight, 120)}px`
                    }}
                  />
                  <button onClick={() => sendReply()} disabled={!reply.trim() || sending}
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 cursor-pointer',
                      reply.trim() && !sending
                        ? 'bg-[#4A7C59] text-white hover:bg-[#3d6b4a]'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    )}
                  >
                    <Send size={16} />
                  </button>
                </div>
                <p className="mt-1.5 text-center text-[10px] text-slate-300">
                  Enter to send · Shift+Enter for new line
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
