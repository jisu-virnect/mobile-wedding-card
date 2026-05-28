import { describe, expect, it } from 'vitest'
import { kakaoPaySendUrl, tossSendUrl } from '../../src/lib/paySchemes'

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

  it('kakaoPaySendUrl returns the kakaoPayUrl override when present', () => {
    const override = {
      ...kakao,
      kakaoPayUrl: 'https://qr.kakaopay.com/abc123',
    }
    expect(kakaoPaySendUrl(override)).toBe('https://qr.kakaopay.com/abc123')
  })

  it('kakaoPaySendUrl falls back to the kakaotalk:// send screen for any account', () => {
    // No override → open KakaoPay's send screen so the user can paste
    // the account number they just copied from the card.
    expect(kakaoPaySendUrl(kakao)).toBe('kakaotalk://kakaopay/money/to/bank')
    expect(kakaoPaySendUrl(unknown)).toBe(
      'kakaotalk://kakaopay/money/to/bank',
    )
  })
})
