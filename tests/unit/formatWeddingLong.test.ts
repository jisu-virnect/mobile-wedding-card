import { describe, expect, it } from 'vitest'
import {
  formatWeddingDateTimeHuman,
  formatWeddingLongDate,
  formatWeddingTimeHuman,
  kstYmd,
  koreanWeekdayOf,
} from '../../src/lib/formatDate'

const WEDDING = '2026-10-10T11:00:00+09:00'

describe('formatWeddingLongDate', () => {
  it('returns "YYYY년 M월 D일 요일" anchored in KST', () => {
    expect(formatWeddingLongDate(WEDDING)).toBe('2026년 10월 10일 토요일')
  })
})

describe('formatWeddingTimeHuman', () => {
  it('omits minutes when zero', () => {
    expect(formatWeddingTimeHuman(WEDDING)).toBe('오전 11시')
  })
  it('renders non-zero minutes', () => {
    expect(formatWeddingTimeHuman('2026-10-10T14:30:00+09:00')).toBe(
      '오후 2시 30분',
    )
  })
})

describe('formatWeddingDateTimeHuman', () => {
  it('combines long date and human time', () => {
    expect(formatWeddingDateTimeHuman(WEDDING)).toBe(
      '2026년 10월 10일 토요일 오전 11시',
    )
  })
})

describe('kstYmd / koreanWeekdayOf', () => {
  it('kstYmd parses KST parts from UTC instant', () => {
    const ymd = kstYmd('2026-10-09T22:00:00Z')
    expect(ymd).toEqual({ year: 2026, month: 10, day: 10 })
  })
  it('koreanWeekdayOf maps to Korean weekday string', () => {
    expect(koreanWeekdayOf({ year: 2026, month: 10, day: 10 })).toBe('토요일')
  })
})
