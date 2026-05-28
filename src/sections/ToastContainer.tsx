import { useEffect, useState } from 'react'
import { subscribeToast, type ToastState } from '../lib/toast'

/**
 * Single floating toast pinned to the bottom of the invitation column.
 * Pointer-events disabled so it never blocks taps on the page underneath.
 * Re-renders whenever showToast() pushes a new state.
 */
export function ToastContainer() {
  const [state, setState] = useState<ToastState | null>(null)

  useEffect(() => subscribeToast(setState), [])

  const visible = state !== null
  const tone = state?.tone ?? 'success'

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={
        'pointer-events-none fixed inset-x-0 bottom-8 z-50 mx-auto flex max-w-[480px] justify-center px-6 transition-all duration-200 ' +
        (visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0')
      }
    >
      <div
        role="status"
        className={
          'rounded-full px-5 py-2.5 text-sm font-medium shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur ' +
          (tone === 'error'
            ? 'bg-sun/95 text-paper'
            : 'bg-ink/90 text-paper')
        }
        key={state?.id}
      >
        {state?.message ?? ' '}
      </div>
    </div>
  )
}
