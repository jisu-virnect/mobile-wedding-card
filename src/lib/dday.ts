import { kstYmd } from './formatDate'

export function daysUntilWedding(targetIso: string, reference: Date = new Date()): number {
  const target = kstYmd(targetIso)
  const now = kstYmd(targetIso, reference)
  const targetMs = Date.UTC(target.year, target.month - 1, target.day)
  const nowMs = Date.UTC(now.year, now.month - 1, now.day)
  return Math.round((targetMs - nowMs) / 86_400_000)
}

export function formatDDay(targetIso: string, reference: Date = new Date()): string {
  const diff = daysUntilWedding(targetIso, reference)
  if (diff > 0) return `D-${diff}`
  if (diff === 0) return 'D-Day'
  return `D+${-diff}`
}
