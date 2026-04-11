# Supabase — RenewShine

**Project ref:** `nueoothgsydbdrseinyu`  
**Dashboard:** https://supabase.com/dashboard/project/nueoothgsydbdrseinyu

---

## Status

| Item | Status |
|---|---|
| `jobs` table | ✅ Live |
| `job_media` table | ✅ Live |
| `job-media` storage bucket | ✅ Live (public) |
| Row Level Security | ✅ Enabled on both tables |

---

## Migrations

All schema changes are tracked in `supabase/migrations/`. Files are named
with a timestamp prefix so they apply in order.

| File | Description |
|---|---|
| `20260410000001_create_jobs_and_media.sql` | Creates `jobs` and `job_media` tables with RLS |
| `20260410000002_create_storage_bucket.sql` | Creates the `job-media` public storage bucket |

---

## Schema

### `jobs`

The core table. One row per booking request.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key, auto-generated |
| `type` | text | `residential` or `commercial` |
| `status` | text | `new → under_review → approved → scheduled → completed` or `cancelled` |
| `client_name` | text | Required |
| `client_email` | text | Required |
| `client_phone` | text | Optional |
| `address` | text | Service address |
| `service_type` | text | `standard`, `deep`, or `move_out` |
| `bedrooms` | int | Residential only |
| `bathrooms` | int | Residential only |
| `add_ons` | jsonb | Array of add-on IDs e.g. `["fridge", "oven"]` |
| `square_footage` | int | Commercial only |
| `condition` | text | Commercial only |
| `business_name` | text | Commercial only |
| `service_frequency` | text | `one_time`, `weekly`, `bi_weekly`, `monthly` |
| `availability_start` | date | Earliest date customer can do |
| `availability_end` | date | Latest date customer can do |
| `availability_time_pref` | text | `morning`, `afternoon`, or `flexible` |
| `confirmed_date` | timestamp | Set by owner when approving |
| `estimated_price_low` | numeric | Shown to customer at booking |
| `estimated_price_high` | numeric | Shown to customer at booking |
| `approved_price` | numeric | Set by owner when approving |
| `deposit_amount` | numeric | Always 100 |
| `remaining_amount` | numeric | `approved_price - 100` |
| `deposit_paid` | boolean | Set to true by Stripe webhook or cash path |
| `stripe_payment_link` | text | URL of the Stripe Payment Link |
| `stripe_session_id` | text | Set by Stripe webhook on payment |
| `notes` | text | Internal owner notes |
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

---

## Storage

**Bucket:** `job-media`  
**Public:** Yes — file URLs are publicly readable without a token  
**Used by:** `src/app/api/upload-media/route.ts`

Files are stored with a random path: `{timestamp}-{random}.{ext}`

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
5. Update env vars in `.env.local` and Vercel

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
