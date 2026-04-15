// ─────────────────────────────────────────────────────────────────────────────
// RenewShine — Supabase Database Types
// Matches the live schema in project nueoothgsydbdrseinyu
// Last synced: 2026-04-13
// Update this file whenever the schema changes.
// ─────────────────────────────────────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type JobStatus =
  | 'partial'
  | 'new'
  | 'under_review'
  | 'approved'
  | 'scheduled'
  | 'completed'
  | 'cancelled'

export type JobType = 'residential' | 'commercial'

export type ServiceType = 'standard' | 'detailed' | 'move_out'

// All 8 values accepted by the live CHECK constraint.
// 'morning', 'afternoon', 'flexible' are legacy values kept for backwards
// compatibility. New submissions use the 6 specific window values.
export type TimePreference =
  | 'early_morning'
  | 'mid_morning'
  | 'noon'
  | 'early_afternoon'
  | 'late_afternoon'
  | 'flexible'
  | 'morning'
  | 'afternoon'

export type PetOption    = 'none' | 'cat' | 'dog' | 'other'
export type HomeEntry    = 'home' | 'lockbox' | 'fob' | 'other'
export type ConditionOption = 'maintained' | 'some_buildup' | 'heavy_buildup' | 'reset'

export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string
          type: JobType | null
          status: JobStatus
          client_name: string
          client_phone: string | null
          client_email: string
          address: string | null
          service_type: ServiceType | null
          bedrooms: number | null
          bathrooms: number | null
          add_ons: string[]
          square_footage: number | null
          condition: ConditionOption | null
          pets: PetOption | null
          home_entry: HomeEntry | null
          business_name: string | null
          service_frequency: string | null
          availability_start: string | null
          availability_end: string | null
          availability_time_pref: TimePreference | null
          confirmed_date: string | null
          estimated_price_low: number | null
          estimated_price_high: number | null
          approved_price: number | null
          deposit_amount: number
          remaining_amount: number | null
          deposit_paid: boolean
          stripe_payment_link: string | null
          stripe_session_id: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          type?: JobType | null
          status?: JobStatus
          client_name: string
          client_phone?: string | null
          client_email: string
          address?: string | null
          service_type?: ServiceType | null
          bedrooms?: number | null
          bathrooms?: number | null
          add_ons?: string[]
          square_footage?: number | null
          condition?: ConditionOption | null
          pets?: PetOption | null
          home_entry?: HomeEntry | null
          business_name?: string | null
          service_frequency?: string | null
          availability_start?: string | null
          availability_end?: string | null
          availability_time_pref?: TimePreference | null
          confirmed_date?: string | null
          estimated_price_low?: number | null
          estimated_price_high?: number | null
          approved_price?: number | null
          deposit_amount?: number
          remaining_amount?: number | null
          deposit_paid?: boolean
          stripe_payment_link?: string | null
          stripe_session_id?: string | null
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['jobs']['Row']>
        Relationships: []
      }
      job_media: {
        Row: {
          id: string
          job_id: string
          file_url: string
          file_type: string | null
          created_at: string
        }
        Insert: {
          job_id: string
          file_url: string
          file_type?: string | null
        }
        Update: Partial<Database['public']['Tables']['job_media']['Row']>
        Relationships: [
          {
            foreignKeyName: 'job_media_job_id_fkey'
            columns: ['job_id']
            isOneToOne: false
            referencedRelation: 'jobs'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Job         = Database['public']['Tables']['jobs']['Row']
export type JobMedia    = Database['public']['Tables']['job_media']['Row']
export type JobWithMedia = Job & { job_media: JobMedia[] }
