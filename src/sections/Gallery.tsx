import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

import { wedding } from '../data/wedding'
import { buildGalleryImages } from '../lib/galleryPlaceholders'

export function Gallery() {
  const reduce = useReducedMotion()
  const images = buildGalleryImages(wedding.gallery)
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const fade = reduce
    ? { initial: false as const, animate: {} }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: 'easeOut' as const },
      }

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="px-6 py-20 text-center"
    >
      <motion.h2
        id="gallery-heading"
        {...fade}
        className="mb-8 text-xl font-semibold tracking-wide text-gray-900"
      >
        갤러리
      </motion.h2>

      <motion.ul
        {...fade}
        role="list"
        className="mx-auto grid max-w-md grid-cols-3 gap-1"
      >
        {images.map((img, i) => (
          <li key={`${img.src}-${i}`}>
            <button
              type="button"
              onClick={() => {
                setIndex(i)
                setOpen(true)
              }}
              aria-label={`${img.alt} 크게 보기`}
              className="group block aspect-square w-full overflow-hidden rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </motion.ul>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        on={{ view: ({ index: i }) => setIndex(i) }}
        slides={images.map((img) => ({ src: img.src, alt: img.alt }))}
        controller={{ closeOnBackdropClick: true }}
      />
    </section>
  )
}
