import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'
import type { BankAccount } from '../data/wedding'
import { useClipboard } from '../lib/useClipboard'

interface AccountItemProps {
  label: string
  account: BankAccount
  onCopy: (accountNumber: string, label: string) => void
}

function AccountItem({ label, account, onCopy }: AccountItemProps) {
  return (
    <li className="flex items-center justify-between gap-3 border-t border-gray-100 py-3 first:border-t-0">
      <div className="text-left">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-gray-900">
          {account.bank} {account.number}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">예금주 {account.holder}</p>
      </div>
      <button
        type="button"
        aria-label={`${label} 계좌번호 복사`}
        onClick={() => onCopy(account.number, label)}
        className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
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
    <div className="overflow-hidden rounded-lg ring-1 ring-gray-200">
      <button
        type="button"
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
      >
        <span>{label}</span>
        <svg
          aria-hidden="true"
          className={
            'h-4 w-4 text-gray-500 transition-transform ' +
            (open ? 'rotate-180' : '')
          }
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
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
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
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
      className="px-6 py-20 text-center"
    >
      <motion.h2
        id="account-heading"
        {...fade}
        className="mb-2 text-xl font-semibold tracking-wide text-gray-900"
      >
        마음 전하실 곳
      </motion.h2>
      <motion.p {...fade} className="mb-8 text-xs text-gray-500">
        축하의 마음을 전하고 싶으신 분은 아래를 이용해 주세요.
      </motion.p>

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
          (error ? 'text-rose-500' : 'text-emerald-600')
        }
      >
        {toast}
      </p>
    </section>
  )
}
