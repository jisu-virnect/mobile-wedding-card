import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'
import type { BankAccount, Person } from '../data/wedding'
import { kakaoPaySendUrl, tossSendUrl } from '../lib/paySchemes'
import { useClipboard } from '../lib/useClipboard'
import { ContactButtons } from './ContactButtons'
import { SectionHeader } from './SectionHeader'

interface AccountCardProps {
  /** Side-prefixed role label e.g. "신랑", "신랑 아버지". The column heading
   *  already shows 신랑측/신부측 once, but each card duplicates the prefix
   *  so the role is unambiguous when scrolling cards individually. */
  role: string
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
  // Deep-link returns null when the bank isn't in paySchemes' BANK_CODE
  // map → hide that pill. Copy stays visible as universal fallback.
  const tossUrl = tossSendUrl(account)
  const kakaoUrl = kakaoPaySendUrl(account)

  return (
    <article className="overflow-hidden rounded-sm border border-line bg-paper text-left">
      <header className="border-b border-line px-3 py-2">
        <div className="flex items-baseline justify-between gap-1.5">
          <span className="font-display text-[11px] tracking-[0.25em] text-ink-mute uppercase">
            {role}
          </span>
          <span className="font-serif text-[12px] text-ink-soft break-keep">
            {account.holder}
          </span>
        </div>
        {phone && (
          <div className="mt-1 flex justify-end">
            <ContactButtons name={account.holder} phone={phone} />
          </div>
        )}
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
        <div className="mt-2 flex flex-wrap items-center justify-end gap-1.5">
          {tossUrl && (
            <a
              href={tossUrl}
              aria-label={`${label} 토스로 송금`}
              className="shrink-0 rounded-xl transition active:opacity-70 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-strong"
            >
              <img
                src="/pay/toss.png"
                alt=""
                aria-hidden="true"
                className="h-7 w-7 shrink-0 rounded-xl"
              />
            </a>
          )}
          {kakaoUrl && (
            <a
              href={kakaoUrl}
              aria-label={`${label} 카카오로 송금`}
              className="shrink-0 rounded-xl transition active:opacity-70 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-strong"
            >
              <img
                src="/pay/kakaopay.png"
                alt=""
                aria-hidden="true"
                className="h-7 w-7 shrink-0 rounded-xl"
              />
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
  role: string
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
      role: sideLabel,
      label: `${sideLabel} ${person.name}`,
      account: person.account,
      phone: person.phone,
    })
  }
  if (person.fatherAccount) {
    out.push({
      side,
      role: `${sideLabel} 아버지`,
      label: `${sideLabel} 아버지 ${person.father}`,
      account: person.fatherAccount,
      phone: person.fatherPhone,
    })
  }
  if (person.motherAccount) {
    out.push({
      side,
      role: `${sideLabel} 어머니`,
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
  const { copy } = useClipboard(2500)

  const fade = reduce
    ? { initial: false as const, animate: {} }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.7, ease: 'easeOut' as const },
      }

  const handleCopy = async (accountNumber: string, label: string) => {
    // success / failure both surface as a global toast via useClipboard.
    return copy(accountNumber, `${label} 계좌번호`)
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
    </section>
  )
}
