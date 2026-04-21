import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'
import {
  formatWeddingLongDate,
  formatWeddingTimeHuman,
  kstYmd,
} from '../lib/formatDate'
import { formatDDay } from '../lib/dday'

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
      <div className="mb-3 text-center text-sm font-medium tracking-widest text-gray-500">
        {year}. {String(month).padStart(2, '0')}
      </div>
      <div className="grid grid-cols-7 text-xs">
        {WEEKDAYS.map((wd, i) => (
          <div
            key={wd}
            className={
              'pb-2 text-center ' +
              (i === 0
                ? 'text-rose-500'
                : i === 6
                  ? 'text-sky-500'
                  : 'text-gray-400')
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
              ? 'text-rose-500'
              : weekCol === 6
                ? 'text-sky-500'
                : 'text-gray-700'
          const base =
            'mx-auto flex h-9 w-9 items-center justify-center rounded-full'
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
                  ? `${base} bg-rose-400 font-semibold text-white`
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
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: 'easeOut' as const },
      }

  const longDate = formatWeddingLongDate(wedding.dateTime)
  const time = formatWeddingTimeHuman(wedding.dateTime)
  const dday = formatDDay(wedding.dateTime)
  const { year, month, day } = kstYmd(wedding.dateTime)

  return (
    <section
      id="when"
      aria-labelledby="when-heading"
      className="px-6 py-20 text-center"
    >
      <motion.h2
        id="when-heading"
        {...fade}
        className="mb-8 text-xl font-semibold tracking-wide text-gray-900"
      >
        예식 일시
      </motion.h2>

      <motion.div
        {...fade}
        className="mx-auto mb-10 max-w-xs rounded-lg bg-white/80 px-6 py-5 shadow-sm ring-1 ring-gray-100"
      >
        <p className="text-base text-gray-900">{longDate}</p>
        <p className="mt-2 text-sm text-gray-600">{time}</p>
      </motion.div>

      <motion.div {...fade} className="mb-10">
        <MonthCalendar year={year} month={month} highlight={day} />
      </motion.div>

      <motion.p
        {...fade}
        aria-label={`결혼식까지 ${dday}`}
        className="inline-block rounded-full bg-rose-50 px-4 py-1 text-sm font-medium tracking-wide text-rose-600"
      >
        {dday}
      </motion.p>
    </section>
  )
}
