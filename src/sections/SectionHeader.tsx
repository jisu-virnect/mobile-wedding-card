import { motion, useReducedMotion } from 'framer-motion'

interface SectionHeaderProps {
  /** Two-digit index like "02"; rendered in Cormorant Garamond italic. */
  index: string
  /** Tiny english eyebrow above the Korean title, e.g. "Greeting". */
  eyebrow: string
  /** Korean title rendered in Noto Serif KR. */
  title: string
  /** Optional subtitle paragraph. */
  subtitle?: string
  /** id of the h2 element — pass into aria-labelledby on the section. */
  headingId: string
}

export function SectionHeader({
  index,
  eyebrow,
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
        className="font-display text-[11px] tracking-[0.5em] text-ink-mute uppercase"
      >
        <span className="italic">{index}</span>
        <span aria-hidden="true" className="mx-2 text-ink-mute/60">
          ·
        </span>
        {eyebrow}
      </motion.p>

      <motion.span
        {...fade}
        aria-hidden="true"
        className="mt-4 h-px w-10 bg-sage/60"
      />

      <motion.h2
        id={headingId}
        {...fade}
        className="mt-6 font-serif text-[1.5rem] leading-tight font-normal text-ink"
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          {...fade}
          className="mx-auto mt-3 max-w-[28ch] text-sm leading-relaxed text-ink-soft"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}
