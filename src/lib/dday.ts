import { useEffect, useState } from 'react'
import { kstYmd } from './formatDate'

export function daysUntilWedding(
  targetIso: string,
  reference: Date = new Date(),
): number {
  const target = kstYmd(targetIso)
  const now = kstYmd(targetIso, reference)
  const targetMs = Date.UTC(target.year, target.month - 1, target.day)
  const nowMs = Date.UTC(now.year, now.month - 1, now.day)
  return Math.round((targetMs - nowMs) / 86_400_000)
}

export function formatDDay(
  targetIso: string,
  reference: Date = new Date(),
): string {
  const diff = daysUntilWedding(targetIso, reference)
  if (diff > 0) return `결혼식까지 ${diff}일 남았어요`
  if (diff === 0) return '오늘이 결혼식이에요'
  return `결혼한 지 ${-diff}일이 지났어요`
}

/**
 * Live-updating D-Day label. Recomputes once per minute so the badge picks
 * up the KST midnight transition without a page reload. Falls back to a
 * one-shot calculation when reference is provided (used by tests).
 */
export function useLiveDDay(targetIso: string): string {
  const [label, setLabel] = useState(() => formatDDay(targetIso))
  useEffect(() => {
    // Tick every minute. Cheap, and 60s resolution is plenty for a D-day
    // counter that flips once a day at midnight KST.
    const id = window.setInterval(() => {
      setLabel(formatDDay(targetIso))
    }, 60_000)
    return () => window.clearInterval(id)
  }, [targetIso])
  return label
}

/**
 * Detailed time-of-day remaining for the final 24 hours: "12시간 32분 남았어요".
 * Returns null when the wedding is more than 24h away or already past.
 * Updates once per minute via useEffect tick.
 */
function computeFinalDayLabel(targetIso: string): string | null {
  const now = Date.now()
  const target = new Date(targetIso).getTime()
  const diffMs = target - now
  if (diffMs <= 0 || diffMs > 86_400_000) return null
  const hours = Math.floor(diffMs / 3_600_000)
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000)
  if (hours === 0) return `${minutes}분 후 시작합니다`
  return `${hours}시간 ${minutes}분 남았어요`
}

export function useFinalDayCountdown(targetIso: string): string | null {
  const [label, setLabel] = useState<string | null>(() =>
    computeFinalDayLabel(targetIso),
  )
  useEffect(() => {
    const id = window.setInterval(
      () => setLabel(computeFinalDayLabel(targetIso)),
      60_000,
    )
    return () => window.clearInterval(id)
  }, [targetIso])
  return label
}
