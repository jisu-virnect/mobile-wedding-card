import { describe, expect, it } from 'vitest'
import { rsvpSchema } from '../../src/lib/rsvpSchema'

describe('rsvpSchema', () => {
  const valid = {
    name: '홍길동',
    side: 'groom' as const,
    attending: 'yes' as const,
    guests: 2,
    message: '축하합니다',
  }

  it('accepts a fully valid payload', () => {
    expect(rsvpSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects payload without `side` (now required)', () => {
    const { side: _omitSide, ...rest } = valid
    void _omitSide
    const result = rsvpSchema.safeParse(rest)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['side'])
    }
  })

  it('accepts optional `relationship`', () => {
    expect(
      rsvpSchema.safeParse({ ...valid, relationship: '대학 동기' }).success,
    ).toBe(true)
    const { relationship: _omit, ...rest } = { ...valid, relationship: '' }
    void _omit
    expect(rsvpSchema.safeParse(rest).success).toBe(true)
  })

  it('rejects payload without `attending`', () => {
    const { attending: _omit, ...rest } = valid
    void _omit
    const result = rsvpSchema.safeParse(rest)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['attending'])
    }
  })

  it('rejects empty name', () => {
    const result = rsvpSchema.safeParse({ ...valid, name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['name'])
      expect(result.error.issues[0].message).toMatch(/이름/)
    }
  })

  it('rejects guests < 0', () => {
    expect(rsvpSchema.safeParse({ ...valid, guests: -1 }).success).toBe(false)
  })

  it('rejects guests > 10', () => {
    expect(rsvpSchema.safeParse({ ...valid, guests: 11 }).success).toBe(false)
  })

  it('accepts guests on the 0..10 boundaries', () => {
    expect(rsvpSchema.safeParse({ ...valid, guests: 0 }).success).toBe(true)
    expect(rsvpSchema.safeParse({ ...valid, guests: 10 }).success).toBe(true)
  })

  it('rejects non-integer guests', () => {
    expect(rsvpSchema.safeParse({ ...valid, guests: 2.5 }).success).toBe(false)
  })

  it('rejects invalid side', () => {
    expect(rsvpSchema.safeParse({ ...valid, side: 'x' }).success).toBe(false)
  })
})
