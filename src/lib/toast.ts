type Tone = 'success' | 'error'

export interface ToastState {
  id: number
  message: string
  tone: Tone
}

type Listener = (state: ToastState | null) => void

const listeners = new Set<Listener>()
let timer: ReturnType<typeof setTimeout> | null = null
let current: ToastState | null = null
let counter = 0

/**
 * Lightweight global toast — no React context, no store library. Anyone
 * imports `showToast` and pushes a message; `<ToastContainer />` mounted
 * once at the App root subscribes and animates the message in/out.
 *
 * Calling showToast again while a toast is visible replaces it (with a
 * new id so the container can re-trigger its enter transition).
 */
export function showToast(
  message: string,
  options: { tone?: Tone; durationMs?: number } = {},
): void {
  const tone = options.tone ?? 'success'
  const durationMs = options.durationMs ?? 2200
  counter += 1
  current = { id: counter, message, tone }
  for (const l of listeners) l(current)
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    current = null
    for (const l of listeners) l(null)
  }, durationMs)
}

export function subscribeToast(listener: Listener): () => void {
  listeners.add(listener)
  // Replay current state so late subscribers see an in-flight toast.
  listener(current)
  return () => {
    listeners.delete(listener)
  }
}
