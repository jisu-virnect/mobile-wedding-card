import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Lazy Supabase client. Returns null if env vars are missing so callers can
 * gracefully degrade (the RSVP form falls back to an "준비 중" notice when
 * the backend isn't wired). Both VITE_ vars get inlined at build time so
 * this never makes a network call without them.
 */
let cached: SupabaseClient | null | undefined
export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached
  if (!url || !anonKey) {
    cached = null
    return null
  }
  cached = createClient(url, anonKey, {
    auth: { persistSession: false },
  })
  return cached
}

export function hasSupabase(): boolean {
  return Boolean(url && anonKey)
}
