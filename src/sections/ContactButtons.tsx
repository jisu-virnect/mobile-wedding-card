interface ContactButtonsProps {
  /** Korean-readable name used for aria-labels ("김창길에게 전화 걸기"). */
  name: string
  phone: string
}

/**
 * Tiny inline ☎ + ✉ pair. Drops next to any name in the card.
 * Used by both Greeting (parent / couple) and Account (account holder).
 */
export function ContactButtons({ name, phone }: ContactButtonsProps) {
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
