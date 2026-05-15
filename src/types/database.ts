// ─────────────────────────────────────────────────────────────────────────────
// RenewShine — Supabase Database Types
// Matches the live schema in project nueoothgsydbdrseinyu
// Last synced: 2026-04-21
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

export type ServiceType = 'standard' | 'deep' | 'move_out' | 'post_construction'

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
          condition: string | null
          pets: 'none' | 'cat' | 'dog' | 'other' | null
          home_entry: 'home' | 'lockbox' | 'fob' | 'other' | null
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
          satisfaction_score: number | null
          automation_paused_until: string | null
          preferred_contact: 'email' | 'phone' | null
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
          condition?: string | null
          pets?: 'none' | 'cat' | 'dog' | 'other' | null
          home_entry?: 'home' | 'lockbox' | 'fob' | 'other' | null
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
          satisfaction_score?: number | null
          automation_paused_until?: string | null
          preferred_contact?: 'email' | 'phone' | null
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
      missed_calls: {
        Row: {
          id: string
          caller_phone: string
          called_at: string
          text_back_sent: boolean | null
          created_at: string
        }
        Insert: {
          caller_phone: string
          called_at: string
          text_back_sent?: boolean | null
        }
        Update: Partial<Database['public']['Tables']['missed_calls']['Row']>
        Relationships: []
      }

      sms_conversations: {
        Row: {
          id: string
          contact_phone: string
          contact_name: string | null
          last_message_at: string
          last_message_preview: string | null
          unread_count: number
          status: 'open' | 'needs_reply' | 'waiting_on_customer' | 'booked' | 'closed'
          lead_source: 'sms' | 'facebook_ads' | 'missed_call' | 'website' | 'returning_client'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['sms_conversations']['Row'], 'id' | 'created_at' | 'unread_count'> & { unread_count?: number }
        Update: Partial<Database['public']['Tables']['sms_conversations']['Insert']>
        Relationships: []
      }
      sms_messages: {
        Row: {
          id: string
          conversation_id: string
          direction: 'inbound' | 'outbound'
          body: string
          twilio_sid: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['sms_messages']['Row'], 'id' | 'created_at' | 'twilio_sid'> & { twilio_sid?: string | null }
        Update: Partial<Database['public']['Tables']['sms_messages']['Insert']>
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['push_subscriptions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['push_subscriptions']['Insert']>
        Relationships: []
      }
      quick_replies: {
        Row: {
          id: string
          label: string
          body: string
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['quick_replies']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['quick_replies']['Insert']>
        Relationships: []
      }
      reactivation_log: {
        Row: {
          id: string
          job_id: string | null
          client_phone: string | null
          fired_at: string
        }
        Insert: {
          job_id?: string | null
          client_phone?: string | null
          fired_at?: string
        }
        Update: Partial<Database['public']['Tables']['reactivation_log']['Row']>
        Relationships: [
          {
            foreignKeyName: 'reactivation_log_job_id_fkey'
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
export type MissedCall      = Database['public']['Tables']['missed_calls']['Row']
export type ReactivationLog = Database['public']['Tables']['reactivation_log']['Row']
