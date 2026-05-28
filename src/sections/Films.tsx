import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'
import type { VideoItem } from '../data/wedding'
import { SectionHeader } from './SectionHeader'

interface FilmCardProps {
  video: VideoItem
}

function PlayBadge() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/45 text-paper backdrop-blur-sm transition group-hover:bg-black/60">
        <svg
          className="h-5 w-5 translate-x-[1px]"
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

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function FilmCard({ video }: FilmCardProps) {
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const stop = useCallback(() => {
    const v = videoRef.current
    if (v) {
      v.pause()
      v.currentTime = 0
    }
    setPlaying(false)
  }, [])

  // If the user scrolls the playing card all the way off-screen, pause it
  // so audio doesn't keep going. (Common Korean wedding-card UX expectation.)
  useEffect(() => {
    if (!playing) return
    const v = videoRef.current
    if (!v) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          v.pause()
        }
      },
      { threshold: 0.1 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [playing])

  if (!playing) {
    return (
      <article className="relative overflow-hidden rounded-sm bg-ink/5">
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`${video.alt} 영상 재생`}
          className="group relative block w-full overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-strong"
        >
          <img
            src={video.poster}
            alt={video.alt}
            loading="lazy"
            decoding="async"
            className="photo-tone aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <PlayBadge />
        </button>
        <p className="px-1 pt-3 pb-1 text-left font-serif text-[14px] text-ink-soft">
          {video.alt}
        </p>
      </article>
    )
  }

  return (
    <article className="relative overflow-hidden rounded-sm bg-ink/95">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- 청첩장 영상은 자막 없음 */}
      <video
        ref={videoRef}
        src={video.src}
        poster={video.poster}
        controls
        autoPlay
        playsInline
        preload="metadata"
        aria-label={video.alt}
        className="block max-h-[78vh] w-full bg-black"
      />
      <button
        type="button"
        onClick={stop}
        aria-label={`${video.alt} 영상 닫기`}
        className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-paper backdrop-blur transition hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
      >
        <CloseIcon />
      </button>
      <p className="px-1 pt-3 pb-1 text-left font-serif text-[14px] text-ink-soft">
        {video.alt}
      </p>
    </article>
  )
}

export function Films() {
  const reduce = useReducedMotion()
  const videos = wedding.videos ?? []

  const fade = reduce
    ? { initial: false as const, animate: {} }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.7, ease: 'easeOut' as const },
      }

  if (videos.length === 0) return null

  return (
    <section
      id="films"
      aria-labelledby="films-heading"
      className="px-6 pt-24 pb-20 text-center"
    >
      <SectionHeader
        index="06"
        title="우리의 시간"
        headingId="films-heading"
      />

      <motion.div
        {...fade}
        className="mx-auto grid max-w-md grid-cols-1 gap-5"
      >
        {videos.map((video) => (
          <FilmCard key={video.src} video={video} />
        ))}
      </motion.div>
    </section>
  )
}
