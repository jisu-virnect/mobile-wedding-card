import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'
import {
  formatWeddingLongDate,
  formatWeddingTimeHuman,
  kstYmd,
} from '../lib/formatDate'
import { useFinalDayCountdown, useLiveDDay } from '../lib/dday'
import { SectionHeader } from './SectionHeader'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

interface CalendarProps {
  year: number
  month: number
  highlight: number
}

function MonthCalendar({ year, month, highlight }: CalendarProps) {
  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7) cells.push(null)

  return (
    <div
      className="mx-auto w-full max-w-xs"
      aria-label={`${year}년 ${month}월 캘린더`}
      role="group"
    >
      <div className="mb-4 text-center font-display text-base tracking-[0.3em] text-ink-soft">
        {year}.{String(month).padStart(2, '0')}
      </div>
      <div className="grid grid-cols-7 text-[11px]">
        {WEEKDAYS.map((wd, i) => (
          <div
            key={wd}
            className={
              'pb-2 text-center tracking-widest ' +
              (i === 0
                ? 'text-sun/80'
                : i === 6
                  ? 'text-sat/80'
                  : 'text-ink-mute')
            }
          >
            {wd}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-sm">
        {cells.map((d, i) => {
          if (d === null) {
            return <span key={i} aria-hidden="true" className="h-9" />
          }
          const isWedding = d === highlight
          const weekCol = i % 7
          const weekColor =
            weekCol === 0
              ? 'text-sun/80'
              : weekCol === 6
                ? 'text-sat/80'
                : 'text-ink-soft'
          const base =
            'mx-auto flex h-9 w-9 items-center justify-center rounded-full transition-colors'
          return (
            <span
              key={i}
              aria-label={
                isWedding
                  ? `${year}년 ${month}월 ${d}일 결혼식 날`
                  : undefined
              }
              className={
                isWedding
                  ? `${base} bg-sage-strong font-medium text-paper ring-4 ring-sage-soft`
                  : `${base} ${weekColor}`
              }
            >
              {d}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export function When() {
  const reduce = useReducedMotion()
  const fade = reduce
    ? { initial: false as const, animate: {} }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.7, ease: 'easeOut' as const },
      }

  const longDate = formatWeddingLongDate(wedding.dateTime)
  const time = formatWeddingTimeHuman(wedding.dateTime)
  const dday = useLiveDDay(wedding.dateTime)
  const finalCountdown = useFinalDayCountdown(wedding.dateTime)
  const { year, month, day } = kstYmd(wedding.dateTime)

  return (
    <section
      id="when"
      aria-labelledby="when-heading"
      className="px-6 pt-24 pb-20 text-center"
    >
      <SectionHeader
        index="03"
        title="함께할 시간"
        headingId="when-heading"
      />

      <motion.div
        {...fade}
        className="mx-auto mb-12 max-w-xs border-y border-line py-6"
      >
        <p className="font-serif text-xl text-ink">{longDate}</p>
        <p className="mt-2 font-display text-[15px] tracking-[0.22em] text-ink-soft">
          {time}
        </p>
      </motion.div>

      <motion.div {...fade} className="mb-10">
        <MonthCalendar year={year} month={month} highlight={day} />
      </motion.div>

      <motion.div {...fade} className="flex flex-col items-center gap-2.5">
        <p
          aria-label={dday}
          className="inline-block rounded-full bg-sage-soft px-6 py-2 font-serif text-[15px] font-medium tracking-wide text-sage-strong"
        >
          {dday}
        </p>
        {finalCountdown && (
          <p
            aria-live="polite"
            className="font-serif text-[13px] tracking-wide text-sage-strong"
          >
            {finalCountdown}
          </p>
        )}
      </motion.div>
    </section>
  )
}
