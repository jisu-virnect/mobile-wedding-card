import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'
import type { BankAccount } from '../data/wedding'
import { useClipboard } from '../lib/useClipboard'
import { SectionHeader } from './SectionHeader'

interface AccountItemProps {
  label: string
  account: BankAccount
  onCopy: (accountNumber: string, label: string) => void
}

function AccountItem({ label, account, onCopy }: AccountItemProps) {
  return (
    <li className="flex items-center justify-between gap-3 border-t border-line py-3 first:border-t-0">
      <div className="text-left">
        <p className="text-xs tracking-wide text-ink-mute">{label}</p>
        <p className="mt-0.5 font-serif text-sm text-ink">
          {account.bank} {account.number}
        </p>
        <p className="mt-0.5 text-xs text-ink-mute">예금주 {account.holder}</p>
      </div>
      <button
        type="button"
        aria-label={`${label} 계좌번호 복사`}
        onClick={() => onCopy(account.number, label)}
        className="shrink-0 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium tracking-wide text-ink-soft transition hover:bg-sage-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
      >
        복사
      </button>
    </li>
  )
}

interface SidePanelProps {
  sideId: string
  label: string
  open: boolean
  onToggle: () => void
  accounts: { label: string; account: BankAccount }[]
  onCopy: (accountNumber: string, label: string) => void
}

function SidePanel({
  sideId,
  label,
  open,
  onToggle,
  accounts,
  onCopy,
}: SidePanelProps) {
  const panelId = `${sideId}-panel`
  const buttonId = `${sideId}-button`
  return (
    <div className="overflow-hidden rounded-sm border border-line bg-paper">
      <button
        type="button"
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left font-serif text-sm font-medium text-ink transition hover:bg-sage-soft"
      >
        <span>{label}</span>
        <svg
          aria-hidden="true"
          className={
            'h-4 w-4 text-ink-mute transition-transform ' +
            (open ? 'rotate-180' : '')
          }
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div id={panelId} role="region" aria-labelledby={buttonId}>
          <ul className="mx-4 mb-3">
            {accounts.map((entry) => (
              <AccountItem
                key={entry.label}
                label={entry.label}
                account={entry.account}
                onCopy={onCopy}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function Account() {
  const reduce = useReducedMotion()
  const { copy, error } = useClipboard(2500)
  const [openSide, setOpenSide] = useState<'groom' | 'bride' | null>('groom')
  const [toast, setToast] = useState<string>('')

  const fade = reduce
    ? { initial: false as const, animate: {} }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.7, ease: 'easeOut' as const },
      }

  const groomAccounts = wedding.groom.account
    ? [{ label: `신랑 ${wedding.groom.name}`, account: wedding.groom.account }]
    : []
  const brideAccounts = wedding.bride.account
    ? [{ label: `신부 ${wedding.bride.name}`, account: wedding.bride.account }]
    : []

  const handleCopy = async (accountNumber: string, label: string) => {
    const ok = await copy(accountNumber)
    setToast(
      ok
        ? `${label} 계좌번호를 복사했어요.`
        : '복사에 실패했어요. 길게 눌러 직접 복사해주세요.',
    )
  }

  return (
    <section
      id="account"
      aria-labelledby="account-heading"
      className="px-6 pt-24 pb-20 text-center"
    >
      <SectionHeader
        index="07"
        eyebrow="With Love"
        title="마음 전하실 곳"
        subtitle="축하의 마음을 전하고 싶으신 분은 아래를 이용해 주세요."
        headingId="account-heading"
      />

      <motion.div {...fade} className="mx-auto grid max-w-sm gap-3 text-left">
        {groomAccounts.length > 0 && (
          <SidePanel
            sideId="account-groom"
            label="신랑측"
            open={openSide === 'groom'}
            onToggle={() =>
              setOpenSide((prev) => (prev === 'groom' ? null : 'groom'))
            }
            accounts={groomAccounts}
            onCopy={handleCopy}
          />
        )}
        {brideAccounts.length > 0 && (
          <SidePanel
            sideId="account-bride"
            label="신부측"
            open={openSide === 'bride'}
            onToggle={() =>
              setOpenSide((prev) => (prev === 'bride' ? null : 'bride'))
            }
            accounts={brideAccounts}
            onCopy={handleCopy}
          />
        )}
      </motion.div>

      <p
        role="status"
        aria-live="polite"
        className={
          'mx-auto mt-4 min-h-[1.25rem] max-w-sm text-xs ' +
          (error ? 'text-sun' : 'text-sage-strong')
        }
      >
        {toast}
      </p>
    </section>
  )
}
