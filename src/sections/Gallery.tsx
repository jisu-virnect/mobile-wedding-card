import { lazy, Suspense, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { wedding } from '../data/wedding'
import { buildGalleryFeed } from '../lib/galleryPlaceholders'
import { SectionHeader } from './SectionHeader'

// The lightbox bundle (+ its CSS) only loads after the user opens a photo,
// keeping the initial gallery paint lean.
const LightboxView = lazy(() => import('./gallery/LightboxView'))

function PlayBadge() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-paper backdrop-blur-sm transition group-hover:bg-black/60">
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </span>
  )
}

export function Gallery() {
  const reduce = useReducedMotion()
  const items = buildGalleryFeed(wedding.gallery, wedding.videos)
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

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
      id="gallery"
      aria-labelledby="gallery-heading"
      className="px-6 pt-24 pb-20 text-center"
    >
      <SectionHeader
        index="05"
        eyebrow="Gallery"
        title="우리의 시간"
        headingId="gallery-heading"
      />

      <motion.ul
        {...fade}
        role="list"
        className="mx-auto grid max-w-md grid-cols-3 gap-1.5"
      >
        {items.map((item, i) => {
          const thumbSrc = item.type === 'video' ? item.poster : item.src
          const a11yLabel =
            item.type === 'video'
              ? `${item.alt} 영상 재생`
              : `${item.alt} 크게 보기`
          return (
            <li key={`${item.src}-${i}`}>
              <button
                type="button"
                onClick={() => {
                  setIndex(i)
                  setOpen(true)
                }}
                aria-label={a11yLabel}
                className="group relative block aspect-square w-full overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
              >
                <img
                  src={thumbSrc}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  className="photo-tone h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />
                {item.type === 'video' && <PlayBadge />}
              </button>
            </li>
          )
        })}
      </motion.ul>

      {open && (
        <Suspense fallback={null}>
          <LightboxView
            items={items}
            open={open}
            index={index}
            onClose={() => setOpen(false)}
            onView={(i) => setIndex(i)}
          />
        </Suspense>
      )}
    </section>
  )
}
