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

interface ContactButtonsProps {
  /** Korean-readable name used for aria-labels ("김창길에게 전화 걸기"). */
  name: string
  phone: string
}

function ContactButtons({ name, phone }: ContactButtonsProps) {
  // Strip hyphens/spaces so tel: / sms: deep links work consistently.
  const number = phone.replace(/[\s-]/g, '')
  const linkCls =
    'inline-flex h-7 w-7 items-center justify-center rounded-full text-sage transition hover:bg-sage-soft hover:text-sage-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage'
  return (
    <span className="ml-1.5 inline-flex items-center gap-0.5 align-middle">
      <a
        href={`tel:${number}`}
        aria-label={`${name}에게 전화 걸기`}
        className={linkCls}
      >
        <svg
          aria-hidden="true"
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </a>
      <a
        href={`sms:${number}`}
        aria-label={`${name}에게 문자 보내기`}
        className={linkCls}
      >
        <svg
          aria-hidden="true"
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </a>
    </span>
  )
}

interface ParentColumnProps {
  label: string
  father: string
  fatherPhone?: string
  mother: string
  motherPhone?: string
  relation: string
  child: string
  childPhone?: string
  divider?: 'right' | 'left' | 'none'
}

function ParentColumn({
  label,
  father,
  fatherPhone,
  mother,
  motherPhone,
  relation,
  child,
  childPhone,
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
      <p className="font-display text-[12px] tracking-[0.35em] text-ink-mute uppercase">
        {label}
      </p>
      <ul className="mt-3 space-y-1.5 text-[15px] text-ink-soft">
        <li>
          <span>{father}</span>
          {fatherPhone && <ContactButtons name={father} phone={fatherPhone} />}
        </li>
        <li>
          <span>{mother}</span>
          {motherPhone && <ContactButtons name={mother} phone={motherPhone} />}
        </li>
      </ul>
      <p className="mt-2 text-[13px] text-ink-mute">의 {relation}</p>
      <div className="mt-1 flex items-center justify-center">
        <span className="font-serif text-[17px] font-medium text-ink">
          {child}
        </span>
        {childPhone && <ContactButtons name={child} phone={childPhone} />}
      </div>
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
        className="mx-auto max-w-[28ch] text-base leading-[2] whitespace-pre-line text-ink-soft"
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
          fatherPhone={wedding.groom.fatherPhone}
          mother={wedding.groom.mother}
          motherPhone={wedding.groom.motherPhone}
          relation="아들"
          child={wedding.groom.name}
          childPhone={wedding.groom.phone}
          divider="right"
        />
        <ParentColumn
          label="신부측"
          father={wedding.bride.father}
          fatherPhone={wedding.bride.fatherPhone}
          mother={wedding.bride.mother}
          motherPhone={wedding.bride.motherPhone}
          relation="딸"
          child={wedding.bride.name}
          childPhone={wedding.bride.phone}
        />
      </motion.div>
    </section>
  )
}
