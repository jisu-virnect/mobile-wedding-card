import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'
import { formatWeddingDate, formatWeddingTimeHuman } from '../lib/formatDate'

export function Cover() {
  const { combined } = formatWeddingDate(wedding.dateTime)
  const time = formatWeddingTimeHuman(wedding.dateTime)
  const reduce = useReducedMotion()

  const base = reduce
    ? { initial: false as const, animate: {} }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
      }

  const t = (delay: number) =>
    reduce ? undefined : { duration: 0.9, ease: 'easeOut' as const, delay }

  const scrollToNext = () => {
    document
      .getElementById('greeting')
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <section
      id="cover"
      aria-labelledby="cover-heading"
      className="relative flex min-h-svh flex-col overflow-hidden bg-ink text-paper"
    >
      <img
        src={wedding.cover.src}
        alt=""
        aria-hidden="true"
        className="photo-tone absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: wedding.cover.objectPosition ?? 'center' }}
        fetchPriority="high"
        decoding="async"
      />

      <div className="grain-overlay" aria-hidden="true" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-black/10 to-black/70"
      />

      <div className="relative z-10 flex min-h-svh flex-col items-center justify-end px-6 pt-24 pb-20 text-center">
        <motion.p
          {...base}
          transition={t(0)}
          className="font-display text-[11px] tracking-[0.55em] text-paper/80 uppercase"
        >
          We invite you · 01
        </motion.p>

        <motion.span
          {...base}
          transition={t(0.15)}
          aria-hidden="true"
          className="mt-5 block h-px w-12 bg-paper/50"
        />

        <motion.h1
          id="cover-heading"
          {...base}
          transition={t(0.3)}
          className="mt-8 font-serif text-[2.6rem] leading-[1.15] font-light tracking-[0.04em] text-paper drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)]"
        >
          <span className="block">{wedding.groom.name}</span>
          <span
            aria-hidden="true"
            className="my-2 block font-display text-base font-light italic tracking-[0.4em] text-paper/70"
          >
            and
          </span>
          <span className="block">{wedding.bride.name}</span>
        </motion.h1>

        <motion.div
          {...base}
          transition={t(0.5)}
          className="mt-10 flex flex-col items-center gap-1.5"
        >
          <p className="font-display text-[0.95rem] tracking-[0.32em] text-paper/95">
            {combined}
          </p>
          <p className="text-xs tracking-[0.3em] text-paper/75">{time}</p>
          <p className="mt-1 text-[11px] tracking-[0.25em] text-paper/65">
            {wedding.venue.name}
          </p>
        </motion.div>

        <motion.button
          type="button"
          onClick={scrollToNext}
          aria-label="다음 섹션으로 스크롤"
          initial={reduce ? false : { opacity: 0 }}
          animate={reduce ? {} : { opacity: 1 }}
          transition={reduce ? undefined : { duration: 1.2, delay: 1 }}
          className="mt-12 flex flex-col items-center gap-1.5 text-paper/75 transition-colors hover:text-paper focus-visible:text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper/80"
        >
          <span
            aria-hidden="true"
            className="font-display text-[10px] tracking-[0.4em] uppercase"
          >
            Scroll
          </span>
          <svg
            aria-hidden="true"
            className={reduce ? 'h-4 w-4' : 'h-4 w-4 animate-bounce'}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.button>
      </div>
    </section>
  )
}
