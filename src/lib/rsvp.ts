import { getDeviceId } from './deviceId'
import {
  sideFromRelationship,
  type Relationship,
} from './rsvpSchema'
import { getSupabase } from './supabase'

/** Row shape as it lives in Postgres. */
export interface RsvpRow {
  id: string
  device_id: string
  name: string
  side: 'groom' | 'bride'
  relationship: string | null
  /**
   * Freeform detail only filled in when relationship is `*-other`
   * (e.g. "대학 동기", "회사 동료"). null otherwise.
   */
  relationship_detail: string | null
  attending: boolean
  guests: number
  message: string | null
  created_at: string
  updated_at: string
}

/**
 * Form-side payload — `side` is derived from `relationship`, not collected
 * from the user directly.
 */
export interface RsvpInput {
  name: string
  relationship: Relationship
  /** Required when relationship is `groom-other` / `bride-other`. */
  relationshipDetail?: string
  attending: boolean
  guests: number
  message?: string
}

const TABLE = 'rsvp'

/**
 * UPSERT one RSVP response keyed by (device_id, name). The DB-side unique
 * index enforces the dedup so a guest re-submitting from the same phone
 * just edits their existing row.
 */
export async function submitRsvp(input: RsvpInput): Promise<RsvpRow> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase 가 설정되지 않았어요.')

  const deviceId = getDeviceId()
  const payload = {
    device_id: deviceId,
    name: input.name.trim(),
    side: sideFromRelationship(input.relationship),
    relationship: input.relationship,
    relationship_detail: input.relationshipDetail?.trim() || null,
    attending: input.attending,
    guests: input.guests,
    message: input.message?.trim() || null,
  }

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: 'device_id,name' })
    .select()
    .single()

  if (error) throw error
  return data as RsvpRow
}

/** Returns every RSVP row submitted from this device (for the response card). */
export async function fetchMyRsvps(): Promise<RsvpRow[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const deviceId = getDeviceId()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('device_id', deviceId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as RsvpRow[]
}

/** Delete one of this device's responses (the cancel button). */
export async function cancelRsvp(rowId: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase 가 설정되지 않았어요.')
  const deviceId = getDeviceId()
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', rowId)
    .eq('device_id', deviceId)
  if (error) throw error
}

/**
 * Admin-only: delete any row by id (no device_id check). Use only from the
 * admin page (token-gated). RLS at the DB layer currently allows anon delete
 * — fine for a low-stakes wedding card; harden later if the threat model
 * changes.
 */
export async function adminDeleteRsvp(rowId: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase 가 설정되지 않았어요.')
  const { error } = await supabase.from(TABLE).delete().eq('id', rowId)
  if (error) throw error
}

/** Admin-only: read every row. Relies on RLS to gate by admin token. */
export async function fetchAllRsvps(): Promise<RsvpRow[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as RsvpRow[]
}
