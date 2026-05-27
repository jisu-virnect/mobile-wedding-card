import { useCallback, useEffect, useRef, useState } from 'react'
import { showToast } from './toast'

export interface UseClipboardResult {
  /**
   * Copy `text` to the clipboard, returning true on success. When `label`
   * is supplied a `{label} 복사되었어요.` toast appears; otherwise the
   * fallback `복사되었어요.` is used. Errors surface via toast as well.
   */
  copy: (text: string, label?: string) => Promise<boolean>
  copied: boolean
  error: Error | null
}

/**
 * Cross-context clipboard fallback. iOS Safari + non-secure contexts
 * (LAN IP HTTP dev servers) can't use the async Clipboard API, so we
 * synthesize a temporary off-screen <textarea>, select it via
 * Range + setSelectionRange, and run `document.execCommand('copy')`
 * within the same user-gesture tick. Returns false if the gesture
 * window already closed or execCommand reports failure.
 */
function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined' || !document.body) return false

  const textarea = document.createElement('textarea')
  textarea.value = text
  // iOS Safari requires contenteditable + a real selection range; opacity
  // 0 / visibility hidden / display:none all silently skip the copy.
  // Off-screen via left:-9999px keeps it invisible to the user without
  // breaking selection.
  textarea.setAttribute('readonly', '')
  textarea.contentEditable = 'true'
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  textarea.style.top = '0'
  // 16px prevents iOS auto-zoom if the element ever scrolls into view.
  textarea.style.fontSize = '16px'

  document.body.appendChild(textarea)

  // Cache the prior selection so we can restore it after the copy.
  const previousSelection = document.getSelection()
  const previousRange =
    previousSelection && previousSelection.rangeCount > 0
      ? previousSelection.getRangeAt(0)
      : null

  const range = document.createRange()
  range.selectNodeContents(textarea)
  const selection = window.getSelection()
  if (selection) {
    selection.removeAllRanges()
    selection.addRange(range)
  }
  // iOS Safari also wants the textarea's own input selection set.
  textarea.setSelectionRange(0, text.length)

  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }

  if (selection) {
    selection.removeAllRanges()
    if (previousRange) selection.addRange(previousRange)
  }
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
    async (text: string, label?: string) => {
      const successMessage = label
        ? `${label} 복사되었어요.`
        : '복사되었어요.'

      // Pre-check secure context. Awaiting navigator.clipboard.writeText
      // in a non-secure context rejects on iOS Safari and by then the
      // execCommand fallback has lost the gesture window — so route
      // straight to legacyCopy on HTTP/LAN.
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
          showToast(successMessage, { tone: 'success' })
          return true
        } catch {
          /* fall through to legacy */
        }
      }

      if (legacyCopy(text)) {
        markCopied()
        showToast(successMessage, { tone: 'success' })
        return true
      }

      const err = new Error('Clipboard unavailable')
      setError(err)
      setCopied(false)
      showToast('복사에 실패했어요. 길게 눌러 직접 복사해주세요.', {
        tone: 'error',
        durationMs: 3200,
      })
      return false
    },
    [markCopied],
  )

  return { copy, copied, error }
}
