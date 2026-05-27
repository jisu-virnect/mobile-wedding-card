import { describe, expect, it } from 'vitest'
import { kakaoPaySendUrl, tossSendUrl } from '../../src/lib/paySchemes'

describe('paySchemes', () => {
  const kakao = {
    bank: '카카오뱅크',
    number: '3333-30-4385686',
    holder: '김난슬',
  }
  const woori = {
    bank: '우리은행',
    number: '1002-734-147623',
    holder: '이경화',
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

  it('kakaoPaySendUrl preserves original number + URL-encodes holder name', () => {
    const url = kakaoPaySendUrl(woori)
    expect(url).not.toBeNull()
    expect(url).toContain('bank_code=020')
    // URLSearchParams encodes hyphens to themselves; numbers stay intact.
    expect(url).toContain('account_number=1002-734-147623')
    // 이경화 → percent-encoded UTF-8.
    expect(url).toContain('account_holder_name=%EC%9D%B4%EA%B2%BD%ED%99%94')
  })

  it('kakaoPaySendUrl returns null for unmapped banks', () => {
    expect(kakaoPaySendUrl(unknown)).toBeNull()
  })
})
