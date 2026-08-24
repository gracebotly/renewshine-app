import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import { createServerClient } from '@/lib/supabase/server'
import type { ServiceType } from '@/types/database'

// Maps Meta Instant Form answer text to the app's ServiceType.
// Meta returns the full answer label, so match on substrings.
function mapServiceType(raw: string | null | undefined): ServiceType | null {
  if (!raw) return null
  const s = raw.toLowerCase()
  if (s.includes('deep')) return 'deep'
  if (s.includes('moving') || s.includes('move')) return 'move_out'
  if (s.includes('construction')) return 'post_construction'
  if (s.includes('standard') || s.includes('regular')) return 'standard'
  return null
}

function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  if (digits.length === 10) return digits
  return null
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    leadId,
    fullName,
    email,
    phone,
    serviceRaw,
    county,
    timeline,
  } = body as Record<string, string | undefined>

  // client_email is NOT NULL on the jobs table.
  if (!email) {
    return Response.json({ error: 'email is required' }, { status: 400 })
  }

  const supabase = createServerClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  // ── Idempotency — Meta can redeliver the same leadgen webhook ─────────────
  if (leadId) {
    const { data: existing } = await supabase
      .from('jobs')
      .select('id, resume_token')
      .eq('external_lead_id', leadId)
      .maybeSingle()

    if (existing) {
      return Response.json({
        jobId: existing.id,
        resumeToken: existing.resume_token,
        resumeUrl: `${siteUrl}/booking?r=${existing.resume_token}`,
        duplicate: true,
      })
    }
  }

  const resumeToken = randomUUID()

  // Stash the Instant Form answers that have no matching column.
  const noteLines = ['Source: Facebook Lead Ad']
  if (county) noteLines.push(`County answer: ${county}`)
  if (timeline) noteLines.push(`Timeline answer: ${timeline}`)
  if (serviceRaw) noteLines.push(`Service answer: ${serviceRaw}`)

  const { data: job, error } = await supabase
    .from('jobs')
    .insert({
      type: 'residential' as const,
      status: 'partial' as const,
      source: 'facebook' as const,
      external_lead_id: leadId || null,
      resume_token: resumeToken,
      // client_name is NOT NULL — fall back rather than fail the insert.
      client_name: fullName || 'Unknown',
      client_email: email,
      client_phone: normalizePhone(phone),
      service_type: mapServiceType(serviceRaw),
      notes: noteLines.join('\n'),
      // Lead-ad submitters accepted the Instant Form's SMS consent disclaimer.
      sms_opt_in: true,
      preferred_contact: 'text' as const,
      last_completed_step: 1,
      dropped_at_label: 'Home Details',
    })
    .select('id')
    .single()

  if (error || !job) {
    console.error('facebook-lead: insert failed:', error)
    return Response.json({ error: 'Failed to create lead' }, { status: 500 })
  }

  console.log(`facebook-lead: created partial job ${job.id} from lead ${leadId ?? 'n/a'}`)

  return Response.json(
    {
      jobId: job.id,
      resumeToken,
      resumeUrl: `${siteUrl}/booking?r=${resumeToken}`,
    },
    { status: 201 }
  )
}
