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
 * synthesize a temporary on-screen-but-tiny `<textarea>`, give it a
 * real selection range, and run `document.execCommand('copy')` inside
 * the same user-gesture tick.
 *
 * iOS Safari gotchas that all bite copy-to-clipboard implementations:
 *   - off-screen via `left: -9999px` works but `opacity:0` / display:none
 *     silently skip the copy.
 *   - the element must have a non-zero (>= 1×1px) bounding box.
 *   - `-webkit-user-select: text` has to be explicit; iOS strips it from
 *     non-input elements by default.
 *   - the element needs both a DOM Range AND a textarea selection range
 *     to count as "selected" for execCommand.
 *   - if the page later scrolls the element into view its font-size has
 *     to be 16px to avoid the iOS auto-zoom flash.
 */
function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined' || !document.body) return false

  const ta = document.createElement('textarea')
  ta.value = text
  ta.setAttribute('readonly', '')
  ta.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'width:1px',
    'height:1px',
    'padding:0',
    'border:0',
    'outline:0',
    'box-shadow:none',
    'background:transparent',
    'color:transparent',
    'font-size:16px',
    '-webkit-user-select:text',
    'user-select:text',
    'z-index:-1',
  ].join(';')

  document.body.appendChild(ta)

  // Preserve whatever the user had selected before.
  const docSel = document.getSelection()
  const previousRange =
    docSel && docSel.rangeCount > 0 ? docSel.getRangeAt(0) : null

  // iOS-specific selection path. Older Android Chromes work either way.
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent || '')
  if (isIOS) {
    const range = document.createRange()
    range.selectNodeContents(ta)
    const sel = window.getSelection()
    if (sel) {
      sel.removeAllRanges()
      sel.addRange(range)
    }
    ta.setSelectionRange(0, text.length)
  } else {
    ta.focus()
    ta.select()
    ta.setSelectionRange(0, text.length)
  }

  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }

  const sel = window.getSelection()
  if (sel) {
    sel.removeAllRanges()
    if (previousRange) sel.addRange(previousRange)
  }
  document.body.removeChild(ta)
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
