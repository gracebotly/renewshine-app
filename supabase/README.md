# Supabase — RenewShine

**Project ref:** `nueoothgsydbdrseinyu`
**Dashboard:** https://supabase.com/dashboard/project/nueoothgsydbdrseinyu

---

## Status

| Item | Status |
|---|---|
| `jobs` table | ✅ Live |
| `job_media` table | ✅ Live |
| `satisfaction_score` column | ✅ Live |
| `job-media` storage bucket | ✅ Live (public) |
| `missed_calls` table     | ✅ Live |
| `reactivation_log` table | ✅ Live |
| Row Level Security | ✅ Enabled on both tables |

---

## Migrations

All schema changes are tracked in `supabase/migrations/`. Files are named
with a timestamp prefix so they apply in order.

| File | Description |
|---|---|
| `20260410000001_create_jobs_and_media.sql` | Creates `jobs` and `job_media` tables with RLS |
| `20260410000002_create_storage_bucket.sql` | Creates the `job-media` public storage bucket |
| `20260413000001_add_pets_home_entry.sql` | Adds `pets`, `home_entry` columns; adds CHECK constraints to `condition` and `status`; expands `availability_time_pref`; enforces canonical `service_type` values |
| `20260415000001_add_satisfaction_score.sql` | Adds `satisfaction_score` integer column (1–5) to `jobs` — already applied via MCP |
| `20260415000002_create_missed_calls_and_reactivation_log.sql` | Creates `missed_calls` and `reactivation_log` tables with RLS — already applied via MCP |
| `20260416000001_rename_detailed_service_type_to_deep.sql` | Backfills existing `jobs.service_type` rows (`detailed` → `deep`) and updates the CHECK constraint |

---

## Schema

### `jobs`

The core table. One row per booking request.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key, auto-generated |
| `type` | text | `residential` or `commercial` |
| `status` | text | `partial → new → under_review → approved → scheduled → completed` or `cancelled`. `partial` = lead captured at Step 1, form not yet completed |
| `client_name` | text | Required (except for `partial` records) |
| `client_email` | text | Required |
| `client_phone` | text | Optional — collected on final step |
| `address` | text | Service address |
| `service_type` | text | `standard`, `deep`, or `move_out` |
| `bedrooms` | int | Residential only |
| `bathrooms` | int | Residential only |
| `add_ons` | jsonb | Array of add-on IDs e.g. `["fridge", "oven"]` |
| `square_footage` | int | Commercial only |
| `condition` | text | Home condition — `maintained`, `some_buildup`, `heavy_buildup`, or `reset`. Residential and commercial. |
| `pets` | text | Residential — `none`, `cat`, `dog`, or `other` |
| `home_entry` | text | Residential — `home`, `lockbox`, `fob`, or `other` |
| `satisfaction_score` | int | Optional — set by n8n after post-job SMS rating. Values 1–5. Null until customer replies. Score < 4 triggers re-clean offer and flags job in admin. |
| `business_name` | text | Commercial only |
| `service_frequency` | text | `one_time`, `weekly`, `bi_weekly`, `monthly` |
| `availability_start` | date | Earliest date customer can do |
| `availability_end` | date | Latest date customer can do (same as start for specific-date bookings) |
| `availability_time_pref` | text | One of 8 values — see CHECK constraint in migration |
| `confirmed_date` | timestamp | Set by owner when approving |
| `estimated_price_low` | numeric | Always `0` — pricing set by owner in admin |
| `estimated_price_high` | numeric | Always `0` — pricing set by owner in admin |
| `approved_price` | numeric | Set by owner when approving |
| `deposit_amount` | numeric | Always `100` |
| `remaining_amount` | numeric | `approved_price - 100` |
| `deposit_paid` | boolean | Set to `true` by Stripe webhook or cash path |
| `stripe_payment_link` | text | URL of the Stripe Payment Link |
| `stripe_session_id` | text | Set by Stripe webhook on payment |
| `notes` | text | Free-text notes from customer |
| `created_at` | timestamp | Auto-set on insert |

### `job_media`

One row per uploaded file. Multiple rows per job.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `job_id` | uuid | FK → `jobs.id` (cascade delete) |
| `file_url` | text | Public URL from Supabase Storage |
| `file_type` | text | `image` or `video` |
| `created_at` | timestamp | Auto-set on insert |

### `missed_calls`

Logs missed calls received on the Twilio number. Written by the `missed-call-log` webhook route.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key, auto-generated |
| `caller_phone` | text | Phone number that called |
| `called_at` | timestamp | When the call came in (from Twilio payload) |
| `text_back_sent` | boolean | Always `true` — text-back fires automatically via n8n WF-05 |
| `created_at` | timestamp | Auto-set on insert |

### `reactivation_log`

Logs 90-day reactivation SMS events fired by n8n. One row per reactivation attempt.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key, auto-generated |
| `job_id` | uuid | FK → `jobs.id` (set null on delete) — the completed job that triggered reactivation |
| `client_phone` | text | Phone number the reactivation SMS was sent to |
| `fired_at` | timestamp | When the reactivation SMS fired, auto-set on insert |

---

## Storage

**Bucket:** `job-media`
**Public:** Yes — file URLs are publicly readable without a token
**Used by:** `src/app/api/upload-media/route.ts`

Files are stored with a random path: `{timestamp}-{random}.{ext}`

---

## Job Status Flow

```
partial → new → under_review → approved → scheduled → completed
                                                     ↘ cancelled
```

| Status | Meaning |
|---|---|
| `partial` | Step 1 completed (name + email captured). Form not yet submitted. Used for abandoned lead recovery. |
| `new` | Full form submitted. Pending owner review. |
| `under_review` | Owner is reviewing photos and details. |
| `approved` | Price confirmed. Deposit link sent to customer. |
| `scheduled` | Deposit paid. Job on the calendar. |
| `completed` | Job done. |
| `cancelled` | Cancelled at any stage. |

---

## Row Level Security

Both tables have RLS enabled. The single policy on each table allows full
access via the **service role key** only. API routes use
`SUPABASE_SERVICE_ROLE_KEY` — they bypass RLS entirely. The anon key
has no access to either table.

This means: **no direct database access from the browser, ever.**
All reads and writes go through Next.js API routes.

---

## How to Re-apply (if starting fresh)

If you ever need to set up a new Supabase project from scratch:

1. Create a new project in Supabase
2. Open the SQL editor
3. Run `20260410000001_create_jobs_and_media.sql`
4. Run `20260410000002_create_storage_bucket.sql`
5. Skip `20260413000001` — those changes are already in the initial migration above
6. Update env vars in `.env.local` and Vercel

Or with the Supabase CLI:
```bash
supabase db push
```

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://nueoothgsydbdrseinyu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Never commit actual key values. Add them to `.env.local` locally
and to Vercel environment settings for production.
```

---

## Summary of All Changes Made

| File | Action | Key changes |
|---|---|---|
| `supabase/migrations/20260410000001_create_jobs_and_media.sql` | Updated | Canonicalized `service_type` values (`detailed`→`deep`), expanded `availability_time_pref` to 8 values, added `condition` CHECK, added `status` 'partial', added `pets` + `home_entry` columns |
| `supabase/migrations/20260413000001_add_pets_home_entry.sql` | Created | Documents all incremental MCP changes as a standalone migration for version control |
| `src/types/database.ts` | Updated | Canonicalized `ServiceType` (`detailed`→`deep`), added `'partial'` to `JobStatus`, added `PetOption`, `HomeEntry`, `ConditionOption` types, typed `condition`/`pets`/`home_entry` as proper unions instead of `string` |
| `supabase/README.md` | Updated | All column descriptions, status values, and migration table accurate |

Application logic now normalizes legacy `detailed` payloads to canonical `deep` while preserving backward compatibility in admin views and notifications.
