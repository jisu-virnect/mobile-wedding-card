import { useCallback, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'
import { formatWeddingDate, formatWeddingTimeHuman } from '../lib/formatDate'

const PRE_EVENT_ID = 'pre-event'

export function Cover() {
  const { combined } = formatWeddingDate(wedding.dateTime)
  const time = formatWeddingTimeHuman(wedding.dateTime)
  const reduce = useReducedMotion()

  const slides = wedding.cover.slides
  const interval = wedding.cover.interval ?? 5000
  const [active, setActive] = useState(0)
  // Delay mounting non-first slides until after first paint so the LCP image
  // (slide[0], also preloaded via index.html) gets the full network budget.
  // Non-first slides are still cross-faded once they're in the DOM.
  const [extraSlidesReady, setExtraSlidesReady] = useState(false)

  useEffect(() => {
    if (slides.length <= 1) return
    const id = window.setTimeout(() => setExtraSlidesReady(true), 800)
    return () => window.clearTimeout(id)
  }, [slides.length])

  // Schedule the next auto-advance whenever `active` changes — whether from
  // the previous auto-tick or a manual click. This way manual interaction
  // implicitly resets the timer (clicks don't fire and then immediately get
  // overridden by a stale auto-tick).
  useEffect(() => {
    if (reduce || slides.length <= 1 || !extraSlidesReady) return
    const id = window.setTimeout(() => {
      setActive((i) => (i + 1) % slides.length)
    }, interval)
    return () => window.clearTimeout(id)
  }, [active, reduce, slides.length, interval, extraSlidesReady])

  const goTo = useCallback(
    (idx: number) => {
      if (slides.length <= 1) return
      setActive(((idx % slides.length) + slides.length) % slides.length)
    },
    [slides.length],
  )
  const next = useCallback(() => goTo(active + 1), [goTo, active])
  const prev = useCallback(() => goTo(active - 1), [goTo, active])

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

  const scrollToPreEvent = () => {
    document
      .getElementById(PRE_EVENT_ID)
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
  }

  const hasPreEvent = Boolean(wedding.preEvent)

  return (
    <section
      id="cover"
      aria-labelledby="cover-heading"
      className="relative flex min-h-svh flex-col overflow-hidden bg-ink text-paper"
    >
      <div className="absolute inset-0">
        {slides.map((slide, i) => {
          if (i > 0 && !extraSlidesReady) return null
          return (
            <img
              key={slide.src}
              src={slide.src}
              alt=""
              aria-hidden="true"
              className={
                'photo-tone ken-burns absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out ' +
                (i === active ? 'opacity-100' : 'opacity-0')
              }
              style={{ objectPosition: slide.objectPosition ?? 'center' }}
              fetchPriority={i === 0 ? 'high' : 'low'}
              decoding="async"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          )
        })}
      </div>

      <div className="grain-overlay" aria-hidden="true" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-black/10 to-black/70"
      />

      {/* Tap zones: left half = previous slide, right half = next slide.
          tabIndex={-1} keeps them out of the keyboard tab order (the cover's
          only keyboard target stays the "다음 섹션으로 스크롤" button below).
          Mounted only when there's more than one slide. */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="이전 슬라이드"
            tabIndex={-1}
            className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer focus:outline-none"
          />
          <button
            type="button"
            onClick={next}
            aria-label="다음 슬라이드"
            tabIndex={-1}
            className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer focus:outline-none"
          />
        </>
      )}

      {/* pointer-events: none on the container so the tap zones underneath
          still receive clicks in the (mostly empty) flex padding area; each
          actually interactive child opts back in with pointer-events-auto. */}
      <div className="pointer-events-none relative z-20 flex min-h-svh flex-col items-center justify-end px-6 pt-24 pb-20 text-center">
        <motion.p
          {...base}
          transition={t(0)}
          className="font-display text-[13px] italic tracking-[0.32em] text-paper/85"
        >
          저희의 결혼식에 초대합니다
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

        {slides.length > 1 && (
          <motion.div
            {...base}
            transition={t(0.7)}
            className="pointer-events-auto mt-8 flex items-center gap-1.5"
          >
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`슬라이드 ${i + 1}로 이동`}
                tabIndex={-1}
                className={
                  'h-1 cursor-pointer rounded-full transition-all duration-500 focus:outline-none ' +
                  (i === active ? 'w-6 bg-paper/90' : 'w-2 bg-paper/40')
                }
              />
            ))}
          </motion.div>
        )}

        <motion.button
          type="button"
          onClick={scrollToNext}
          aria-label="다음 섹션으로 스크롤"
          initial={reduce ? false : { opacity: 0 }}
          animate={reduce ? {} : { opacity: 1 }}
          transition={reduce ? undefined : { duration: 1.2, delay: 1 }}
          className="pointer-events-auto mt-10 flex flex-col items-center gap-1.5 text-paper/75 transition-colors hover:text-paper focus-visible:text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper/80"
        >
          <span
            aria-hidden="true"
            className="font-display text-[11px] italic tracking-[0.3em]"
          >
            아래로
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

        {hasPreEvent && (
          <motion.button
            type="button"
            onClick={scrollToPreEvent}
            aria-label="고창 앞잔치 안내로 바로 이동"
            initial={reduce ? false : { opacity: 0 }}
            animate={reduce ? {} : { opacity: 1 }}
            transition={reduce ? undefined : { duration: 1.2, delay: 1.15 }}
            className="pointer-events-auto mt-4 inline-flex items-center gap-1.5 rounded-full border border-paper/30 px-3.5 py-1.5 font-serif text-[12px] text-paper/85 transition hover:border-paper/60 hover:bg-paper/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper/80"
          >
            <span>고창 앞잔치 안내</span>
            <svg
              aria-hidden="true"
              className="h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </motion.button>
        )}
      </div>
    </section>
  )
}
