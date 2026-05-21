import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'
import type { BankAccount } from '../data/wedding'
import { useClipboard } from '../lib/useClipboard'
import { SectionHeader } from './SectionHeader'

interface AccountCardProps {
  side: 'groom' | 'bride'
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

function AccountCard({ side, label, account, onCopy }: AccountCardProps) {
  return (
    <article className="overflow-hidden rounded-sm border border-line bg-paper text-left">
      <header className="flex items-center justify-between border-b border-line px-5 py-2.5">
        <span className="font-display text-[10px] tracking-[0.4em] text-ink-mute uppercase">
          {side === 'groom' ? '신랑측' : '신부측'}
        </span>
        <span className="font-serif text-xs text-ink-soft">{account.holder}</span>
      </header>
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="min-w-0">
          <p className="text-[11px] tracking-wide text-ink-mute">{account.bank}</p>
          <p className="mt-1 truncate font-serif text-[15px] tracking-[0.02em] text-ink">
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
        subtitle="축하의 마음을 전하고 싶으신 분은 아래 계좌로 부탁드립니다."
        headingId="account-heading"
      />

      <motion.div {...fade} className="mx-auto grid max-w-sm gap-3">
        {wedding.groom.account && (
          <AccountCard
            side="groom"
            label={`신랑 ${wedding.groom.name}`}
            account={wedding.groom.account}
            onCopy={handleCopy}
          />
        )}
        {wedding.bride.account && (
          <AccountCard
            side="bride"
            label={`신부 ${wedding.bride.name}`}
            account={wedding.bride.account}
            onCopy={handleCopy}
          />
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
