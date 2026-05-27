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
 * KakaoPay send-money link.
 *
 * Resolution order:
 *   1. account.kakaoPayUrl — official QR-issued URL from the recipient's
 *      KakaoPay app (most reliable; recipient must generate it once).
 *   2. fallback unofficial deeplink `kakaotalk://kakaopay/money/to/bank?…`
 *      — KakaoTalk recognizes the URL and opens, but the send screen
 *      may or may not auto-fill depending on app version. Better than
 *      no button at all when the recipient hasn't generated a QR.
 *
 * Returns null only when both the override URL and the bank-code map
 * are unavailable, so the caller hides the chip.
 */
export function kakaoPaySendUrl(account: BankAccount): string | null {
  if (account.kakaoPayUrl) return account.kakaoPayUrl
  const code = BANK_CODE[account.bank]
  if (!code) return null
  const params = new URLSearchParams({
    bank_name: account.bank,
    bank_code: code,
    account_number: account.number,
    account_holder_name: account.holder,
  })
  return `kakaotalk://kakaopay/money/to/bank?${params.toString()}`
}
