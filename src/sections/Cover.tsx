import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'
import { formatWeddingDate } from '../lib/formatDate'

export function Cover() {
  const { combined } = formatWeddingDate(wedding.dateTime)
  const reduce = useReducedMotion()

  const base = reduce
    ? { initial: false as const, animate: {} }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
      }

  const t = (delay: number) =>
    reduce ? undefined : { duration: 0.7, ease: 'easeOut' as const, delay }

  const scrollToNext = () => {
    document
      .getElementById('greeting')
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <section
      id="cover"
      aria-labelledby="cover-heading"
      className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-gradient-to-b from-rose-50 via-white to-amber-50 px-6 py-20 text-center"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/60 to-transparent"
      />

      <motion.p
        {...base}
        transition={t(0)}
        className="text-xs tracking-[0.4em] text-gray-500 uppercase"
      >
        Wedding Invitation
      </motion.p>

      <motion.span
        {...base}
        transition={t(0.15)}
        aria-hidden="true"
        className="block h-px w-16 bg-gray-300"
      />

      <motion.h1
        id="cover-heading"
        {...base}
        transition={t(0.25)}
        className="font-serif text-4xl leading-tight text-gray-900"
      >
        <span className="block">{wedding.groom.name}</span>
        <span
          aria-hidden="true"
          className="my-3 block text-base tracking-[0.3em] text-gray-400"
        >
          &amp;
        </span>
        <span className="block">{wedding.bride.name}</span>
      </motion.h1>

      <motion.p
        {...base}
        transition={t(0.4)}
        className="mt-3 text-lg text-gray-700"
      >
        {combined}
      </motion.p>

      <motion.button
        type="button"
        onClick={scrollToNext}
        aria-label="다음 섹션으로 스크롤"
        initial={reduce ? false : { opacity: 0 }}
        animate={reduce ? {} : { opacity: 1 }}
        transition={reduce ? undefined : { duration: 1.2, delay: 0.9 }}
        className="absolute bottom-8 flex flex-col items-center gap-1 text-gray-400 transition-colors hover:text-gray-600 focus-visible:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gray-500"
      >
        <span aria-hidden="true" className="text-xs tracking-widest uppercase">
          Scroll
        </span>
        <svg
          aria-hidden="true"
          className={reduce ? 'h-4 w-4' : 'h-4 w-4 animate-bounce'}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </motion.button>
    </section>
  )
}
