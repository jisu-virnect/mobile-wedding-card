import { describe, expect, it } from 'vitest'
import { daysUntilWedding, formatDDay } from '../../src/lib/dday'

const WEDDING = '2026-10-10T11:00:00+09:00'

describe('daysUntilWedding', () => {
  it('returns positive days before the wedding (KST-anchored)', () => {
    const reference = new Date('2026-10-09T10:00:00+09:00')
    expect(daysUntilWedding(WEDDING, reference)).toBe(1)
  })

  it('returns 0 on the wedding day regardless of time-of-day', () => {
    expect(
      daysUntilWedding(WEDDING, new Date('2026-10-10T00:00:01+09:00')),
    ).toBe(0)
    expect(
      daysUntilWedding(WEDDING, new Date('2026-10-10T23:59:59+09:00')),
    ).toBe(0)
  })

  it('returns negative days after the wedding', () => {
    const reference = new Date('2026-10-13T09:00:00+09:00')
    expect(daysUntilWedding(WEDDING, reference)).toBe(-3)
  })

  it('handles timezone boundaries at KST midnight', () => {
    // 2026-10-09 15:00 UTC === 2026-10-10 00:00 KST (wedding day in KST)
    expect(
      daysUntilWedding(WEDDING, new Date('2026-10-09T15:00:00Z')),
    ).toBe(0)
    // One second earlier is still 10-09 in KST
    expect(
      daysUntilWedding(WEDDING, new Date('2026-10-09T14:59:59Z')),
    ).toBe(1)
  })
})

describe('formatDDay', () => {
  it('formats future days as D-N', () => {
    const reference = new Date('2026-04-21T09:00:00+09:00')
    expect(formatDDay(WEDDING, reference)).toBe('D-172')
  })

  it('formats the wedding day as D-Day', () => {
    expect(
      formatDDay(WEDDING, new Date('2026-10-10T08:00:00+09:00')),
    ).toBe('D-Day')
  })

  it('formats past days as D+N', () => {
    expect(
      formatDDay(WEDDING, new Date('2026-10-15T08:00:00+09:00')),
    ).toBe('D+5')
  })
})
