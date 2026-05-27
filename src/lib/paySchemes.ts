import type { BankAccount } from '../data/wedding'

/**
 * Korean standard 3-digit bank codes (금융결제원), used by Toss's
 * `supertoss://send` deep-link scheme. Add new banks here as wedding.ts
 * gains them.
 *
 * KakaoPay was previously supported via `kakaotalk://kakaopay/money/to/bank`
 * but the scheme only opens KakaoTalk without populating the send screen
 * (undocumented and unstable across KakaoTalk versions), so it was dropped.
 * The copy-to-clipboard fallback covers anyone who prefers KakaoPay.
 */
const BANK_CODE: Record<string, string> = {
  신한은행: '088',
  농협: '011',
  농협은행: '011',
  카카오뱅크: '090',
  우리은행: '020',
  국민은행: '004',
  기업은행: '003',
  하나은행: '081',
  토스뱅크: '092',
}

/**
 * Toss `supertoss://send` deep link. Pre-fills the send-money screen
 * with bank + account number when the user taps. Returns null for any
 * bank not in BANK_CODE so the caller can hide the button.
 *
 * Mobile-only — desktop browsers silently fail. The copy-to-clipboard
 * button stays visible as a fallback either way.
 */
export function tossSendUrl(account: BankAccount): string | null {
  const code = BANK_CODE[account.bank]
  if (!code) return null
  const accountNo = account.number.replace(/\D/g, '')
  return `supertoss://send?bank=${code}&accountNo=${accountNo}&origin=wedding`
}

/**
 * KakaoPay send-money link — override-only.
 *
 * Earlier attempts at an unofficial `kakaotalk://kakaopay/money/to/bank?…`
 * deeplink opened KakaoTalk but the send screen never auto-filled across
 * the KakaoTalk versions we tested. Since a broken button is worse than
 * no button, the helper now returns `null` unless the recipient supplies
 * an explicit `kakaoPayUrl`.
 *
 * To get an override:
 *   카카오톡 → 더보기 → pay → 송금 → 받기 → QR 코드 → URL 복사.
 *   Example: 'https://qr.kakaopay.com/Ej7n3Hk2zS'.
 *
 * Tapping that URL on a phone opens the official KakaoPay send sheet
 * with the recipient already filled in.
 */
export function kakaoPaySendUrl(account: BankAccount): string | null {
  return account.kakaoPayUrl ?? null
}
