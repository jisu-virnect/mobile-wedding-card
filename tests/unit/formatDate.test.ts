import { describe, expect, it } from 'vitest'
import { formatWeddingDate, formatWeddingTime } from '../../src/lib/formatDate'

describe('formatWeddingDate', () => {
  it('formats 2026-10-10T11:00:00+09:00 as 2026.10.10 · 토요일 (KST)', () => {
    const { date, weekday, combined } = formatWeddingDate(
      '2026-10-10T11:00:00+09:00',
    )
    expect(date).toBe('2026.10.10')
    expect(weekday).toBe('토요일')
    expect(combined).toBe('2026.10.10 · 토요일')
  })

  it('always anchors in Asia/Seoul regardless of host TZ', () => {
    const { date } = formatWeddingDate('2026-10-09T22:00:00Z')
    // 2026-10-09T22:00Z === 2026-10-10T07:00+09:00
    expect(date).toBe('2026.10.10')
  })

  it('throws on an invalid iso string', () => {
    expect(() => formatWeddingDate('not-a-date')).toThrow()
  })
})

describe('formatWeddingTime', () => {
  it('formats 11:00 KST as an am/pm Korean string', () => {
    const formatted = formatWeddingTime('2026-10-10T11:00:00+09:00')
    expect(formatted).toMatch(/오전/)
    expect(formatted).toContain('11')
  })
})
