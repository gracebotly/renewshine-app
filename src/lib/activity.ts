import { createServerClient } from '@/lib/supabase/server'

export type ActivityType = 'email' | 'sms' | 'note' | 'status_change' | 'external'

/**
 * Append one entry to a job's activity timeline.
 *
 * Never throws. Activity logging is observability, not business logic — a failure
 * here must never break a send or change a route's response. Callers should not
 * await this in a way that affects control flow beyond ordering.
 */
export async function logActivity(
  jobId: string,
  type: ActivityType,
  label: string,
  body?: string | null
): Promise<void> {
  try {
    const supabase = createServerClient()
    await supabase.from('job_activity').insert({
      job_id: jobId,
      type,
      label,
      body: body ?? null,
    })
  } catch (err) {
    console.error('logActivity failed (non-blocking):', label, err)
  }
}

/**
 * Log a send that failed. Kept separate so the label convention stays consistent
 * across every route: the timeline should read "Failed — <what>" for any failure.
 */
export async function logActivityFailure(
  jobId: string,
  type: ActivityType,
  label: string,
  err: unknown
): Promise<void> {
  const detail = err instanceof Error ? err.message : String(err)
  await logActivity(jobId, type, `Failed — ${label}`, detail)
}
