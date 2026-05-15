'use client'

import * as React from 'react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import { MessageCircle, Send, ArrowLeft, Bell, BellOff, ChevronDown, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

type ConvStatus = 'open' | 'needs_reply' | 'waiting_on_customer' | 'booked' | 'closed'
type LeadSource = 'sms' | 'facebook_ads' | 'missed_call' | 'website' | 'returning_client'
interface Conversation { id: string; contact_phone: string; contact_name: string | null; last_message_at: string; last_message_preview: string | null; unread_count: number; status: ConvStatus; lead_source: LeadSource }
interface Message { id: string; direction: 'inbound' | 'outbound'; body: string; created_at: string }
interface QuickReply { id: string; label: string; body: string }

function formatTime(iso: string) { const d = new Date(iso); const now = new Date(); const diff = Math.floor((now.getTime() - d.getTime()) / 86400000); if (diff === 0) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); if (diff === 1) return 'Yesterday'; if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'short' }); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
function formatPhone(phone: string) { const d = phone.replace(/\D/g, '').slice(-10); if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`; return phone }
const STATUS_LABELS: Record<ConvStatus, string> = { open: 'Open', needs_reply: 'Needs reply', waiting_on_customer: 'Waiting', booked: 'Booked', closed: 'Closed' }
const STATUS_COLORS: Record<ConvStatus, string> = { open: 'bg-slate-100 text-slate-600', needs_reply: 'bg-amber-100 text-amber-700', waiting_on_customer: 'bg-blue-100 text-blue-700', booked: 'bg-brand-muted text-brand', closed: 'bg-slate-100 text-slate-400' }
const SOURCE_LABELS: Record<LeadSource, string> = { sms: 'SMS', facebook_ads: 'FB Ad', missed_call: 'Missed call', website: 'Website', returning_client: 'Returning' }
const SOURCE_COLORS: Record<LeadSource, string> = { sms: 'bg-slate-100 text-slate-500', facebook_ads: 'bg-blue-100 text-blue-700', missed_call: 'bg-purple-100 text-purple-700', website: 'bg-brand-muted text-brand', returning_client: 'bg-emerald-100 text-emerald-700' }

export default function InboxPage() { return <div className="min-h-screen bg-slate-50" /> }
