import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseClipboardResult {
  copy: (text: string) => Promise<boolean>
  copied: boolean
  error: Error | null
}

/**
 * Fallback clipboard writer using the deprecated-but-universal
 * `document.execCommand('copy')`. Needed because `navigator.clipboard`
 * is gated behind *secure context* — LAN IP HTTP dev servers
 * (e.g. `http://172.16.10.106:5177/`) leave it undefined, and so do
 * older mobile browsers. Returns false if the document body isn't
 * available or the copy command itself reports failure.
 */
function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined' || !document.body) return false
  const textarea = document.createElement('textarea')
  textarea.value = text
  // Off-screen so the user never sees it. `readOnly` prevents the iOS
  // keyboard from popping up; `contentEditable=true` lets iOS select.
  textarea.setAttribute('readonly', '')
  textarea.contentEditable = 'true'
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '0'
  textarea.style.width = '1px'
  textarea.style.height = '1px'
  textarea.style.opacity = '0'
  textarea.style.pointerEvents = 'none'
  document.body.appendChild(textarea)

  // iOS Safari needs an explicit range selection — focus + select alone
  // doesn't trigger the copy.
  const range = document.createRange()
  range.selectNodeContents(textarea)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
  textarea.setSelectionRange(0, text.length)

  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  selection?.removeAllRanges()
  document.body.removeChild(textarea)
  return ok
}

export function useClipboard(resetMs = 2000): UseClipboardResult {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const markCopied = useCallback(() => {
    setError(null)
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), resetMs)
  }, [resetMs])

  const copy = useCallback(
    async (text: string) => {
      // Decide modern vs legacy BEFORE consuming the user-gesture window.
      // Awaiting navigator.clipboard.writeText in an insecure context
      // rejects on iOS Safari and by then execCommand has already lost
      // the gesture — so jump straight to execCommand on HTTP/LAN.
      const isSecure =
        typeof window !== 'undefined' && window.isSecureContext === true
      const hasModern =
        typeof navigator !== 'undefined' &&
        Boolean(navigator.clipboard) &&
        typeof navigator.clipboard?.writeText === 'function'

      if (isSecure && hasModern) {
        try {
          await navigator.clipboard.writeText(text)
          markCopied()
          return true
        } catch {
          /* fall through to legacy */
        }
      }
      if (legacyCopy(text)) {
        markCopied()
        return true
      }
      const err = new Error('Clipboard unavailable')
      setError(err)
      setCopied(false)
      return false
    },
    [markCopied],
  )

  return { copy, copied, error }
}
