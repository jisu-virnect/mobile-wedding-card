import { describe, expect, it } from 'vitest'
import { tossSendUrl } from '../../src/lib/paySchemes'

describe('paySchemes', () => {
  const kakao = {
    bank: '카카오뱅크',
    number: '3333-30-4385686',
    holder: '김난슬',
  }
  const unknown = { bank: '미래은행', number: '0000', holder: '홍길동' }

  it('tossSendUrl strips hyphens from account number', () => {
    expect(tossSendUrl(kakao)).toBe(
      'supertoss://send?bank=090&accountNo=3333304385686&origin=wedding',
    )
  })

  it('tossSendUrl returns null for unmapped banks', () => {
    expect(tossSendUrl(unknown)).toBeNull()
  })
})
