import { motion, useReducedMotion } from 'framer-motion'

interface SectionHeaderProps {
  /** Two-digit index like "02"; rendered in Cormorant Garamond italic. */
  index: string
  /** Korean title rendered in Noto Serif KR. */
  title: string
  /** Optional subtitle paragraph. */
  subtitle?: string
  /** id of the h2 element — pass into aria-labelledby on the section. */
  headingId: string
}

/**
 * Section eyebrow: minimal numeral + hairline + serif Korean title. The
 * English "Greeting / When / Where" labels were removed — the Korean title
 * already names the section, and dropping the English makes the eyebrow
 * feel more intentional + native.
 */
export function SectionHeader({
  index,
  title,
  subtitle,
  headingId,
}: SectionHeaderProps) {
  const reduce = useReducedMotion()

  const fade = reduce
    ? { initial: false as const, animate: {} }
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.4 },
        transition: { duration: 0.7, ease: 'easeOut' as const },
      }

  return (
    <div className="mb-10 flex flex-col items-center text-center">
      <motion.p
        {...fade}
        className="font-display text-base italic tracking-[0.25em] text-ink-mute"
      >
        {index}
      </motion.p>

      <motion.span
        {...fade}
        aria-hidden="true"
        className="mt-4 h-px w-10 bg-sage/60"
      />

      <motion.h2
        id={headingId}
        {...fade}
        className="mt-6 font-serif text-[1.65rem] leading-tight font-normal text-ink"
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          {...fade}
          className="mx-auto mt-3 max-w-[28ch] text-[15px] leading-relaxed text-ink-soft"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}
