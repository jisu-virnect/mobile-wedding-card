import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'
import { SectionHeader } from './SectionHeader'

function Ornament() {
  return (
    <div
      aria-hidden="true"
      className="my-12 flex items-center justify-center gap-3 text-sage/50"
    >
      <span className="h-px w-14 bg-line" />
      <svg
        className="h-3 w-3 text-sage"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M12 4 C 13 9 15 11 20 12 C 15 13 13 15 12 20 C 11 15 9 13 4 12 C 9 11 11 9 12 4 Z" />
      </svg>
      <span className="h-px w-14 bg-line" />
    </div>
  )
}

/**
 * Line-art icon for the 신랑측 column — a bow tie. The classic groom
 * silhouette signifier without leaning on tuxedos or top-hats.
 */
function GroomIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
      strokeLinecap="round"
      className="h-5 w-10 text-sage"
    >
      <path d="M2 3 L13 8 L2 13 Z" />
      <path d="M30 3 L19 8 L30 13 Z" />
      <rect x="13" y="6" width="6" height="4" rx="0.5" />
      <path d="M16 6 V 10" strokeOpacity="0.45" />
    </svg>
  )
}

/**
 * Line-art icon for the 신부측 column — a tiny bouquet. Three blossoms
 * with stems, mirroring the bow-tie's optical weight.
 */
function BrideIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
      strokeLinecap="round"
      className="h-7 w-7 text-sage"
    >
      <circle cx="11" cy="10" r="2.8" />
      <circle cx="21" cy="10" r="2.8" />
      <circle cx="16" cy="14" r="2.8" />
      <path d="M16 17 L13 27" />
      <path d="M16 17 L19 27" />
      <path d="M11 21 L21 21" strokeOpacity="0.5" />
    </svg>
  )
}

interface ParentColumnProps {
  label: string
  icon: 'groom' | 'bride'
  father: string
  mother: string
  relation: string
  child: string
  divider?: 'right' | 'left' | 'none'
}

function ParentColumn({
  label,
  icon,
  father,
  mother,
  relation,
  child,
  divider = 'none',
}: ParentColumnProps) {
  return (
    <div
      role="group"
      aria-label={`${label} 가족 정보`}
      className={
        'flex-1 px-3 ' +
        (divider === 'right'
          ? 'border-r border-line'
          : divider === 'left'
            ? 'border-l border-line'
            : '')
      }
    >
      <div className="flex justify-center">
        {icon === 'groom' ? <GroomIcon /> : <BrideIcon />}
      </div>
      <p className="mt-2 font-display text-[12px] tracking-[0.35em] text-ink-mute uppercase">
        {label}
      </p>
      {/* Contact buttons (☎ ✉) moved to Account section; this column now
         shows just the name lineage for a cleaner reading flow. */}
      <ul className="mt-3 space-y-1.5 text-[15px] break-keep text-ink-soft">
        <li>{father}</li>
        <li>{mother}</li>
      </ul>
      <p className="mt-2 text-[13px] text-ink-mute">의 {relation}</p>
      <p className="mt-1 font-serif text-[17px] font-medium text-ink">
        {child}
      </p>
    </div>
  )
}

export function Greeting() {
  const reduce = useReducedMotion()
  const fade = reduce
    ? { initial: false as const, animate: {} }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.7, ease: 'easeOut' as const },
      }

  return (
    <section
      id="greeting"
      aria-labelledby="greeting-heading"
      className="px-6 pt-24 pb-20 text-center"
    >
      <SectionHeader
        index="02"
        title="결혼합니다"
        headingId="greeting-heading"
      />

      <motion.p
        {...fade}
        className="mx-auto max-w-[28ch] text-base leading-[2] break-keep whitespace-pre-line text-ink-soft"
      >
        {wedding.invitation}
      </motion.p>

      <Ornament />

      <motion.div
        {...fade}
        className="mx-auto flex max-w-sm items-stretch justify-between"
      >
        <ParentColumn
          label="신랑측"
          icon="groom"
          father={wedding.groom.father}
          mother={wedding.groom.mother}
          relation="아들"
          child={wedding.groom.name}
          divider="right"
        />
        <ParentColumn
          label="신부측"
          icon="bride"
          father={wedding.bride.father}
          mother={wedding.bride.mother}
          relation="딸"
          child={wedding.bride.name}
        />
      </motion.div>
    </section>
  )
}
