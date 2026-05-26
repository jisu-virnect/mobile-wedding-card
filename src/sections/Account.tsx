import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'
import type { BankAccount, Person } from '../data/wedding'
import { useClipboard } from '../lib/useClipboard'
import { SectionHeader } from './SectionHeader'

interface AccountCardProps {
  /** Two-line micro-label rendered in the header: side + role. */
  side: 'groom' | 'bride'
  role: '본인' | '아버지' | '어머니'
  /** Toast-friendly description, e.g. "신랑 김지수". */
  label: string
  account: BankAccount
  onCopy: (number: string, label: string) => Promise<boolean>
}

function CopyIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
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

function AccountCard({ side, role, label, account, onCopy }: AccountCardProps) {
  const sideLabel = side === 'groom' ? '신랑측' : '신부측'
  return (
    <article className="overflow-hidden rounded-sm border border-line bg-paper text-left">
      <header className="flex items-baseline justify-between gap-2 border-b border-line px-5 py-2.5">
        <span className="font-display text-[12px] tracking-[0.3em] text-ink-mute uppercase">
          {sideLabel}
          <span aria-hidden="true" className="mx-1.5 text-ink-mute/50">
            ·
          </span>
          {role}
        </span>
        <span className="font-serif text-[13px] text-ink-soft">
          {account.holder}
        </span>
      </header>
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="min-w-0">
          <p className="text-[12px] tracking-wide text-ink-mute">{account.bank}</p>
          <p className="mt-1 truncate font-serif text-base tracking-[0.02em] text-ink">
            {account.number}
          </p>
        </div>
        <button
          type="button"
          aria-label={`${label} 계좌번호 복사`}
          onClick={() => {
            void onCopy(account.number, label)
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sage-strong transition hover:bg-sage-strong hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-strong"
        >
          <CopyIcon />
        </button>
      </div>
    </article>
  )
}

interface SideRow {
  side: 'groom' | 'bride'
  role: '본인' | '아버지' | '어머니'
  label: string
  account: BankAccount
}

// Build a flat ordered list of cards from a Person. Skips entries where the
// account is missing — so families that only share one account per side
// degrade gracefully to a single card.
function rowsFor(person: Person, side: 'groom' | 'bride'): SideRow[] {
  const sideLabel = side === 'groom' ? '신랑' : '신부'
  const out: SideRow[] = []
  if (person.account) {
    out.push({
      side,
      role: '본인',
      label: `${sideLabel} ${person.name}`,
      account: person.account,
    })
  }
  if (person.fatherAccount) {
    out.push({
      side,
      role: '아버지',
      label: `${sideLabel} 아버지 ${person.father}`,
      account: person.fatherAccount,
    })
  }
  if (person.motherAccount) {
    out.push({
      side,
      role: '어머니',
      label: `${sideLabel} 어머니 ${person.mother}`,
      account: person.motherAccount,
    })
  }
  return out
}

function SideHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="mt-2 mb-1 flex items-center justify-center gap-3 first:mt-0"
    >
      <span className="h-px w-8 bg-line" />
      <span className="font-display text-[12px] tracking-[0.5em] text-ink-mute uppercase">
        {children}
      </span>
      <span className="h-px w-8 bg-line" />
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

      <motion.div {...fade} className="mx-auto grid max-w-sm gap-3">
        {groomRows.length > 0 && (
          <>
            <SideHeading>신랑측</SideHeading>
            {groomRows.map((row) => (
              <AccountCard
                key={`groom-${row.role}`}
                side={row.side}
                role={row.role}
                label={row.label}
                account={row.account}
                onCopy={handleCopy}
              />
            ))}
          </>
        )}
        {brideRows.length > 0 && (
          <>
            <SideHeading>신부측</SideHeading>
            {brideRows.map((row) => (
              <AccountCard
                key={`bride-${row.role}`}
                side={row.side}
                role={row.role}
                label={row.label}
                account={row.account}
                onCopy={handleCopy}
              />
            ))}
          </>
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
