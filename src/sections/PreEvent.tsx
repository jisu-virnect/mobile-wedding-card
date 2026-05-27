import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'
import type { BankAccount } from '../data/wedding'
import {
  formatWeddingLongDate,
  formatWeddingTimeHuman,
} from '../lib/formatDate'
import { renderInlineBold } from '../lib/inlineBold'
import { tossSendUrl } from '../lib/paySchemes'
import { useClipboard } from '../lib/useClipboard'
import { ContactButtons } from './ContactButtons'
import { KakaoMap } from './KakaoMap'
import { MapButtonsRow } from './MapButtonsRow'
import { SectionHeader } from './SectionHeader'

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

function HairlineDivider({ label }: { label: string }) {
  return (
    <div
      aria-hidden="true"
      className="mx-auto flex items-center justify-center gap-3"
    >
      <span className="h-px w-10 bg-line" />
      <span className="font-display text-[12px] tracking-[0.5em] text-ink-mute uppercase">
        {label}
      </span>
      <span className="h-px w-10 bg-line" />
    </div>
  )
}

/**
 * 피로연 — regional bride-side gathering held in 고창 ahead of the
 * main wedding. Same visual language as When + Where but body type
 * runs one notch larger since most readers are senior relatives.
 *
 * Renders nothing if `wedding.preEvent` is undefined.
 */
function PreEventAccountCard({
  role,
  account,
  phone,
  onCopy,
}: {
  role: string
  account: BankAccount
  phone?: string
  onCopy: () => void
}) {
  const label = `${role} ${account.holder}`
  const tossUrl = tossSendUrl(account)

  return (
    <article className="mx-auto w-full max-w-sm overflow-hidden rounded-sm border border-line bg-paper text-left">
      <header className="flex items-center justify-between gap-2 border-b border-line px-5 py-2.5">
        <span className="font-display text-[12px] tracking-[0.3em] text-ink-mute uppercase">
          {role}
        </span>
        <span className="inline-flex items-center font-serif text-[13px] text-ink-soft">
          {account.holder}
          {phone && <ContactButtons name={account.holder} phone={phone} />}
        </span>
      </header>
      <div className="px-5 py-4">
        <p className="text-[12px] tracking-wide text-ink-mute">
          {account.bank}
        </p>
        <p className="mt-1 break-all font-serif text-base tracking-[0.02em] text-ink">
          {account.number}
        </p>
        <div className="mt-3 flex items-center justify-end gap-1.5">
          {tossUrl && (
            <a
              href={tossUrl}
              aria-label={`${label} Toss 로 송금`}
              className="flex h-8 items-center rounded-full border border-line bg-paper px-3 text-[12px] font-medium tracking-wide text-ink-soft transition hover:bg-sage-soft hover:text-sage-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
            >
              토스 송금
            </a>
          )}
          <button
            type="button"
            onClick={onCopy}
            aria-label={`${label} 계좌번호 복사`}
            className="flex h-8 items-center gap-1 rounded-full bg-sage-soft px-3 text-[12px] font-medium tracking-wide text-sage-strong transition hover:bg-sage-strong hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-strong"
          >
            <CopyIcon />
            복사
          </button>
        </div>
      </div>
    </article>
  )
}

export function PreEvent() {
  const reduce = useReducedMotion()
  const { copy: copyAcct, error: acctError } = useClipboard(2500)
  const [acctToast, setAcctToast] = useState<string>('')
  const event = wedding.preEvent

  const fade = reduce
    ? { initial: false as const, animate: {} }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.7, ease: 'easeOut' as const },
      }

  if (!event) return null

  const longDate = event.dateDisplay ?? formatWeddingLongDate(event.dateTime)
  const time = event.timeDisplay ?? formatWeddingTimeHuman(event.dateTime)
  const { name, address, detail, kakaoMapUrl, naverMapUrl, tmapUrl } =
    event.venue

  const handleAccountCopy = async (
    accountNumber: string,
    label: string,
  ) => {
    const ok = await copyAcct(accountNumber)
    setAcctToast(
      ok
        ? `${label} 계좌번호를 복사했어요.`
        : '복사에 실패했어요. 길게 눌러 직접 복사해주세요.',
    )
  }

  return (
    <section
      id="pre-event"
      aria-labelledby="pre-event-heading"
      className="px-6 pt-24 pb-20 text-center"
    >
      <SectionHeader
        index="09"
        title="피로연 장소"
        headingId="pre-event-heading"
      />

      {/* Larger body type for senior readers. break-keep prevents
         awkward "가족" / "과 친지" mid-word splits. */}
      <motion.p
        {...fade}
        className="mx-auto max-w-[28ch] text-[17px] leading-[2.05] break-keep text-ink-soft"
      >
        {renderInlineBold(event.description)}
      </motion.p>

      {event.signoff && (
        <motion.p
          {...fade}
          className="mt-7 font-serif text-[15px] tracking-wide text-ink-mute break-keep"
        >
          {event.signoff}
        </motion.p>
      )}

      <motion.div
        {...fade}
        className="mx-auto mt-10 mb-8 max-w-xs border-y border-line py-6"
      >
        <p className="font-serif text-[20px] text-ink break-keep">{longDate}</p>
        <p className="mt-2 font-display text-[17px] tracking-[0.2em] text-ink-soft">
          {time}
        </p>
      </motion.div>

      <motion.div {...fade} className="mb-6">
        <KakaoMap
          address={address}
          venueName={name}
          fallback={
            <div
              role="img"
              aria-label={`${name} 약도 이미지`}
              className="mx-auto flex aspect-[4/3] w-full max-w-sm items-center justify-center rounded-sm bg-paper ring-1 ring-line"
            >
              <svg
                aria-hidden="true"
                className="h-10 w-10 text-sage/70"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
            </div>
          }
        />
      </motion.div>

      <motion.div {...fade} className="space-y-2 break-keep">
        <p className="font-serif text-[22px] text-ink">{name}</p>
        <p className="text-[17px] text-ink-soft">{address}</p>
        {detail && (
          <p className="mx-auto max-w-[30ch] text-[15px] leading-relaxed text-ink-mute">
            {detail}
          </p>
        )}
      </motion.div>

      <motion.div {...fade} className="mt-7">
        <MapButtonsRow
          kakaoMapUrl={kakaoMapUrl}
          naverMapUrl={naverMapUrl}
          tmapUrl={tmapUrl}
          address={address}
          copyAriaLabel="피로연 주소 복사"
        />
      </motion.div>

      {event.accounts && event.accounts.length > 0 && (
        <>
          <motion.div {...fade} className="mt-12 mb-4">
            <HairlineDivider label="마음 전하는 곳" />
          </motion.div>
          <motion.div {...fade} className="mx-auto grid max-w-sm gap-3">
            {event.accounts.map((entry) => (
              <PreEventAccountCard
                key={`${entry.role}-${entry.account.holder}`}
                role={entry.role}
                account={entry.account}
                phone={entry.phone}
                onCopy={() =>
                  handleAccountCopy(
                    entry.account.number,
                    `${entry.role} ${entry.account.holder}`,
                  )
                }
              />
            ))}
          </motion.div>
          <p
            role="status"
            aria-live="polite"
            className={
              'mx-auto mt-3 min-h-[1.25rem] max-w-sm text-[13px] ' +
              (acctError ? 'text-sun' : 'text-sage-strong')
            }
          >
            {acctToast}
          </p>
        </>
      )}
    </section>
  )
}
