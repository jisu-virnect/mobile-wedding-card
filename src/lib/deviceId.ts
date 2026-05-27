const STORAGE_KEY = 'rsvp_device_id'

/**
 * Returns a stable per-device UUID, generating one on first call and
 * persisting it in localStorage. Used as the (device_id, name) primary
 * grouping key for RSVP rows so:
 *
 *   - same device + same name = UPSERT (edit / re-submit)
 *   - same device + different name = INSERT (parents/spouse on shared phone)
 *   - different device = new UUID = INSERT (e.g. private window, new phone)
 *
 * Safe in SSR/test contexts: returns a synthesized id if window/localStorage
 * isn't available (the caller's data won't sync across reloads but the form
 * still functions).
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return crypto.randomUUID()
  }
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY)
    if (existing) return existing
    const fresh = crypto.randomUUID()
    window.localStorage.setItem(STORAGE_KEY, fresh)
    return fresh
  } catch {
    return crypto.randomUUID()
  }
}
