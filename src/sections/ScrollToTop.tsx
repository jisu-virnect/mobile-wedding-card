import { useEffect, useState } from 'react'

const SHOW_THRESHOLD = 400

/**
 * Floating "back to top" button. Mirror image of BGMToggle:
 *   BGM     ← top-left of the centered card
 *   ToTop   ← bottom-right of the centered card
 *
 * Hidden until the user scrolls past the cover (>{SHOW_THRESHOLD}px) to
 * keep the cover hero clean. Respects prefers-reduced-motion (instant
 * jump instead of smooth scroll).
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_THRESHOLD)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    // Wrapper anchors the button to the bottom-right of the card-shaped
    // 480px column (matching App.tsx's max-w-[480px]). On desktop the
    // button stays inside the card frame instead of floating at the
    // far edge of the viewport.
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[480px] justify-end p-4">
      <button
        type="button"
        onClick={handleClick}
        aria-label="맨 위로"
        tabIndex={visible ? 0 : -1}
        data-visible={visible}
        className={
          'pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-paper/85 text-sage-strong shadow-[0_4px_18px_rgba(0,0,0,0.12)] backdrop-blur transition-opacity duration-300 hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-strong ' +
          (visible ? 'opacity-100' : 'pointer-events-none opacity-0')
        }
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>
    </div>
  )
}
