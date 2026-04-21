import type { Transition, Variants } from 'framer-motion'

// Viewport-triggered fade/slide-in preset used by all content sections
// except Cover (Cover animates on mount since it's always the first
// viewport). Pair with framer-motion `motion.*` components via spread.
export interface SectionRevealProps {
  initial: false | 'hidden'
  whileInView?: 'visible'
  viewport?: { once: boolean; amount: number | 'some' | 'all' }
  variants?: Variants
  transition?: Transition
}

const variants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export function sectionReveal(
  reduce: boolean | null,
  options: { amount?: number; delay?: number; duration?: number } = {},
): SectionRevealProps {
  if (reduce) {
    return { initial: false }
  }
  const { amount = 0.2, delay = 0, duration = 0.7 } = options
  return {
    initial: 'hidden',
    whileInView: 'visible',
    viewport: { once: true, amount },
    variants,
    transition: { duration, ease: 'easeOut', delay },
  }
}
