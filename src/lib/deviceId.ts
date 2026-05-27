const STORAGE_KEY = 'rsvp_device_id'

/**
 * Build a RFC 4122 v4 UUID. Prefers `crypto.randomUUID()` when available,
 * but that method requires a *secure context* (HTTPS or localhost) — LAN
 * IP dev servers (e.g. `http://172.16.10.x:5177`) leave it undefined.
 * The getRandomValues fallback works in every browser back to ES2017
 * and outside secure contexts.
 */
function generateUuid(): string {
  if (typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID()
    } catch {
      /* fall through to manual generator */
    }
  }
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  // Per RFC 4122 §4.4: set version (4) and variant (10xx) bits.
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

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
    return generateUuid()
  }
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY)
    if (existing) return existing
    const fresh = generateUuid()
    window.localStorage.setItem(STORAGE_KEY, fresh)
    return fresh
  } catch {
    return generateUuid()
  }
}
