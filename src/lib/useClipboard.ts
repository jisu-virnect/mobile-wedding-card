import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseClipboardResult {
  copy: (text: string) => Promise<boolean>
  copied: boolean
  error: Error | null
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

  const copy = useCallback(
    async (text: string) => {
      try {
        if (
          typeof navigator === 'undefined' ||
          !navigator.clipboard ||
          typeof navigator.clipboard.writeText !== 'function'
        ) {
          throw new Error('Clipboard API unavailable')
        }
        await navigator.clipboard.writeText(text)
        setError(null)
        setCopied(true)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), resetMs)
        return true
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e))
        setError(err)
        setCopied(false)
        return false
      }
    },
    [resetMs],
  )

  return { copy, copied, error }
}
