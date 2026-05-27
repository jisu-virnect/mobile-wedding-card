import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'
import {
  formatWeddingLongDate,
  formatWeddingTimeHuman,
} from '../lib/formatDate'
import { useClipboard } from '../lib/useClipboard'
import { SectionHeader } from './SectionHeader'

/**
 * 앞잔치 (pre-wedding gathering) — regional Korean tradition for
 * the bride's side. Same visual language as When + Where but
 * deliberately scaled one notch smaller so it reads as supplementary
 * info, not a parallel main event.
 *
 * Renders nothing if `wedding.preEvent` is undefined.
 */
export function PreEvent() {
  const reduce = useReducedMotion()
  const { copy, copied, error } = useClipboard()
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

  const longDate = formatWeddingLongDate(event.dateTime)
  const time = formatWeddingTimeHuman(event.dateTime)
  const { name, address, detail, kakaoMapUrl, naverMapUrl } = event.venue

  const handleCopy = () => {
    void copy(address)
  }

  const feedback = error
    ? '주소 복사에 실패했어요. 길게 눌러 직접 복사해주세요.'
    : copied
      ? '주소를 복사했어요.'
      : ''

  return (
    <section
      id="pre-event"
      aria-labelledby="pre-event-heading"
      className="px-6 pt-24 pb-20 text-center"
    >
      <SectionHeader
        index="09"
        title="앞잔치"
        headingId="pre-event-heading"
      />

      {/* Larger body type than other sections: 어르신들이 주된 독자라
         가독성 우선. Same fonts as everywhere else so visual identity
         is unchanged. */}
      <motion.p
        {...fade}
        className="mx-auto max-w-[26ch] text-[17px] leading-[2.05] whitespace-pre-line text-ink-soft"
      >
        {event.description}
      </motion.p>

      <motion.div
        {...fade}
        className="mx-auto mt-10 mb-8 max-w-xs border-y border-line py-6"
      >
        <p className="font-serif text-[22px] text-ink">{longDate}</p>
        <p className="mt-2 font-display text-[17px] tracking-[0.2em] text-ink-soft">
          {time}
        </p>
      </motion.div>

      <motion.div {...fade} className="space-y-2">
        <p className="font-serif text-[22px] text-ink">{name}</p>
        <p className="text-[17px] text-ink-soft">{address}</p>
        {detail && (
          <p className="mx-auto max-w-[30ch] text-[15px] leading-relaxed text-ink-mute">
            {detail}
          </p>
        )}
      </motion.div>

      <motion.div
        {...fade}
        className="mt-7 flex flex-wrap items-center justify-center gap-2"
      >
        {kakaoMapUrl && (
          <a
            href={kakaoMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="카카오맵으로 앞잔치 장소 열기"
            className="inline-flex items-center gap-1 rounded-full border border-line bg-paper px-5 py-2.5 text-[15px] font-medium tracking-wide text-ink transition hover:bg-sage-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
          >
            카카오맵
          </a>
        )}
        {naverMapUrl && (
          <a
            href={naverMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="네이버지도로 앞잔치 장소 열기"
            className="inline-flex items-center gap-1 rounded-full border border-line bg-paper px-5 py-2.5 text-[15px] font-medium tracking-wide text-ink transition hover:bg-sage-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
          >
            네이버지도
          </a>
        )}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="앞잔치 주소 복사"
          className="inline-flex items-center gap-1 rounded-full bg-sage-strong px-5 py-2.5 text-[15px] font-medium tracking-wide text-paper transition hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-strong"
        >
          주소 복사
        </button>
      </motion.div>

      <p
        role="status"
        aria-live="polite"
        className={
          'mt-3 min-h-[1.25rem] text-[13px] ' +
          (error ? 'text-sun' : 'text-ink-soft')
        }
      >
        {feedback}
      </p>
    </section>
  )
}
