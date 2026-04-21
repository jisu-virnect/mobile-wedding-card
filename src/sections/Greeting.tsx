import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'

function Ornament() {
  return (
    <div
      aria-hidden="true"
      className="my-10 flex items-center justify-center gap-3 text-gray-300"
    >
      <span className="h-px w-16 bg-gray-200" />
      <svg
        className="h-3 w-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 3 L14 11 L22 12 L14 13 L12 21 L10 13 L2 12 L10 11 Z" />
      </svg>
      <span className="h-px w-16 bg-gray-200" />
    </div>
  )
}

interface ParentColumnProps {
  label: string
  father: string
  mother: string
  relation: string
  child: string
  divider?: 'right' | 'left' | 'none'
}

function ParentColumn({
  label,
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
        'flex-1 px-4 ' +
        (divider === 'right'
          ? 'border-r border-gray-200'
          : divider === 'left'
            ? 'border-l border-gray-200'
            : '')
      }
    >
      <p className="text-[11px] tracking-[0.3em] text-gray-500 uppercase">
        {label}
      </p>
      <p className="mt-3 text-sm text-gray-700">
        {father}
        <span className="mx-1 text-gray-500">·</span>
        {mother}
      </p>
      <p className="mt-1 text-xs text-gray-500">의 {relation}</p>
      <p className="mt-2 text-base font-semibold text-gray-900">{child}</p>
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
      className="px-6 py-20 text-center"
    >
      <motion.h2
        id="greeting-heading"
        {...fade}
        className="mb-8 text-xl font-semibold tracking-wide text-gray-900"
      >
        초대합니다
      </motion.h2>
      <motion.p
        {...fade}
        className="mx-auto max-w-[28ch] text-sm leading-relaxed whitespace-pre-line text-gray-600"
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
          father={wedding.groom.father}
          mother={wedding.groom.mother}
          relation="아들"
          child={wedding.groom.name}
          divider="right"
        />
        <ParentColumn
          label="신부측"
          father={wedding.bride.father}
          mother={wedding.bride.mother}
          relation="딸"
          child={wedding.bride.name}
        />
      </motion.div>
    </section>
  )
}
