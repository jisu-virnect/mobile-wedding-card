import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'
import type { BankAccount, Person } from '../data/wedding'
import { kakaoPaySendUrl, tossSendUrl } from '../lib/paySchemes'
import { useClipboard } from '../lib/useClipboard'
import { ContactButtons } from './ContactButtons'
import { SectionHeader } from './SectionHeader'

interface AccountCardProps {
  role: '본인' | '아버지' | '어머니'
  /** Toast-friendly description, e.g. "신랑 김지수". */
  label: string
  account: BankAccount
  /** Optional contact phone — renders ☎/✉ buttons next to holder name. */
  phone?: string
  onCopy: (number: string, label: string) => Promise<boolean>
}

function CopyIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function AccountCard({ role, label, account, phone, onCopy }: AccountCardProps) {
  // Deep-link URLs are null when the bank isn't in paySchemes' BANK_CODE map
  // → hide the corresponding button. Copy stays visible as a universal fallback.
  const tossUrl = tossSendUrl(account)
  const kakaoUrl = kakaoPaySendUrl(account)

  return (
    <article className="overflow-hidden rounded-sm border border-line bg-paper text-left">
      <header className="flex items-center justify-between gap-1.5 border-b border-line px-3 py-2">
        <span className="font-display text-[11px] tracking-[0.25em] text-ink-mute uppercase">
          {role}
        </span>
        <span className="inline-flex items-center font-serif text-[12px] text-ink-soft">
          {account.holder}
          {phone && <ContactButtons name={account.holder} phone={phone} />}
        </span>
      </header>
      <div className="px-3 py-3">
        <p className="text-[11px] tracking-wide text-ink-mute">{account.bank}</p>
        {/* Account number gets its own line so long numbers
           (e.g. 3333-30-4385686) never get truncated on narrow phones.
           break-all allows hyphens to act as line-break points if the
           number runs longer than the card width. */}
        <p className="mt-1 font-serif text-[13px] tracking-[0.01em] break-all text-ink">
          {account.number}
        </p>
        <div className="mt-2 flex items-center justify-end gap-1">
          {tossUrl && (
            <a
              href={tossUrl}
              aria-label={`${label} Toss 로 송금`}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0064FF] text-[10px] font-bold tracking-tight text-paper transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0064FF]"
            >
              toss
            </a>
          )}
          {kakaoUrl && (
            <a
              href={kakaoUrl}
              aria-label={`${label} 카카오페이로 송금`}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFE812] text-[10px] font-bold tracking-tight text-[#3C1E1E] transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFE812]"
            >
              pay
            </a>
          )}
          <button
            type="button"
            aria-label={`${label} 계좌번호 복사`}
            onClick={() => {
              void onCopy(account.number, label)
            }}
            className="flex h-7 items-center gap-1 rounded-full bg-sage-soft px-2.5 text-[11px] font-medium tracking-wide text-sage-strong transition hover:bg-sage-strong hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-strong"
          >
            <CopyIcon />
            복사
          </button>
        </div>
      </div>
    </article>
  )
}

interface SideRow {
  side: 'groom' | 'bride'
  role: '본인' | '아버지' | '어머니'
  label: string
  account: BankAccount
  phone?: string
}

// Build a flat ordered list of cards from a Person. Skips entries where the
// account is missing — so families that only share one account per side
// degrade gracefully to fewer cards.
function rowsFor(person: Person, side: 'groom' | 'bride'): SideRow[] {
  const sideLabel = side === 'groom' ? '신랑' : '신부'
  const out: SideRow[] = []
  if (person.account) {
    out.push({
      side,
      role: '본인',
      label: `${sideLabel} ${person.name}`,
      account: person.account,
      phone: person.phone,
    })
  }
  if (person.fatherAccount) {
    out.push({
      side,
      role: '아버지',
      label: `${sideLabel} 아버지 ${person.father}`,
      account: person.fatherAccount,
      phone: person.fatherPhone,
    })
  }
  if (person.motherAccount) {
    out.push({
      side,
      role: '어머니',
      label: `${sideLabel} 어머니 ${person.mother}`,
      account: person.motherAccount,
      phone: person.motherPhone,
    })
  }
  return out
}

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="mb-2 flex items-center justify-center gap-2"
    >
      <span className="h-px w-4 bg-line" />
      <span className="font-display text-[11px] tracking-[0.4em] text-ink-mute uppercase">
        {children}
      </span>
      <span className="h-px w-4 bg-line" />
    </div>
  )
}

export function Account() {
  const reduce = useReducedMotion()
  const { copy, error } = useClipboard(2500)
  const [toast, setToast] = useState<string>('')

  const fade = reduce
    ? { initial: false as const, animate: {} }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.7, ease: 'easeOut' as const },
      }

  const handleCopy = async (accountNumber: string, label: string) => {
    const ok = await copy(accountNumber)
    setToast(
      ok
        ? `${label} 계좌번호를 복사했어요.`
        : '복사에 실패했어요. 길게 눌러 직접 복사해주세요.',
    )
    return ok
  }

  const groomRows = rowsFor(wedding.groom, 'groom')
  const brideRows = rowsFor(wedding.bride, 'bride')

  return (
    <section
      id="account"
      aria-labelledby="account-heading"
      className="px-6 pt-24 pb-20 text-center"
    >
      <SectionHeader
        index="08"
        title="마음 전하실 곳"
        subtitle="축하의 마음을 전하고 싶으신 분은 아래 계좌로 부탁드립니다."
        headingId="account-heading"
      />

      <motion.div
        {...fade}
        className="mx-auto grid max-w-md grid-cols-2 gap-2.5"
      >
        {groomRows.length > 0 && (
          <div className="space-y-2.5">
            <ColumnHeading>신랑측</ColumnHeading>
            {groomRows.map((row) => (
              <AccountCard
                key={`groom-${row.role}`}
                role={row.role}
                label={row.label}
                account={row.account}
                phone={row.phone}
                onCopy={handleCopy}
              />
            ))}
          </div>
        )}
        {brideRows.length > 0 && (
          <div className="space-y-2.5">
            <ColumnHeading>신부측</ColumnHeading>
            {brideRows.map((row) => (
              <AccountCard
                key={`bride-${row.role}`}
                role={row.role}
                label={row.label}
                account={row.account}
                phone={row.phone}
                onCopy={handleCopy}
              />
            ))}
          </div>
        )}
      </motion.div>

      <p
        role="status"
        aria-live="polite"
        className={
          'mx-auto mt-5 min-h-[1.25rem] max-w-sm text-xs ' +
          (error ? 'text-sun' : 'text-sage-strong')
        }
      >
        {toast}
      </p>
    </section>
  )
}
