import { describe, expect, it } from 'vitest'
import { rsvpSchema } from '../../src/lib/rsvpSchema'

describe('rsvpSchema', () => {
  const valid = {
    name: '홍길동',
    relationship: 'groom' as const,
    attending: 'yes' as const,
    guests: 2,
    message: '축하합니다',
  }

  it('accepts a fully valid payload', () => {
    expect(rsvpSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts every non-other relationship enum value', () => {
    const all = [
      'groom',
      'groom-father',
      'groom-mother',
      'bride',
      'bride-father',
      'bride-mother',
      'bride-sibling',
    ] as const
    for (const r of all) {
      expect(rsvpSchema.safeParse({ ...valid, relationship: r }).success).toBe(
        true,
      )
    }
  })

  it('accepts an optional relationshipDetail string', () => {
    expect(
      rsvpSchema.safeParse({
        ...valid,
        relationshipDetail: '대학 동기',
      }).success,
    ).toBe(true)
    expect(
      rsvpSchema.safeParse({ ...valid, relationshipDetail: '' }).success,
    ).toBe(true)
  })

  it('rejects payload without `relationship` (now required)', () => {
    const { relationship: _omit, ...rest } = valid
    void _omit
    const result = rsvpSchema.safeParse(rest)
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0])
      expect(paths).toContain('relationship')
    }
  })

  it('rejects free-form relationship strings (must match the enum)', () => {
    expect(
      rsvpSchema.safeParse({ ...valid, relationship: '대학 동기' }).success,
    ).toBe(false)
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

  it('rejects guests < 1', () => {
    expect(rsvpSchema.safeParse({ ...valid, guests: 0 }).success).toBe(false)
    expect(rsvpSchema.safeParse({ ...valid, guests: -1 }).success).toBe(false)
  })

  it('rejects guests > 10', () => {
    expect(rsvpSchema.safeParse({ ...valid, guests: 11 }).success).toBe(false)
  })

  it('accepts guests on the 1..10 boundaries', () => {
    expect(rsvpSchema.safeParse({ ...valid, guests: 1 }).success).toBe(true)
    expect(rsvpSchema.safeParse({ ...valid, guests: 10 }).success).toBe(true)
  })

  it('rejects non-integer guests', () => {
    expect(rsvpSchema.safeParse({ ...valid, guests: 2.5 }).success).toBe(false)
  })

})
