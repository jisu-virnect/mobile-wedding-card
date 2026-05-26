import { useEffect, useRef, useState } from 'react'
import type { BgmConfig } from '../data/wedding'

const STORAGE_KEY = 'bgm:muted'

interface BGMToggleProps {
  config: BgmConfig
}

/**
 * Floating top-left BGM toggle.
 *
 * UX rules locked by [[feedback-style]]:
 *   - Starts OFF. No autoplay (browsers block it + Korean guests hate it).
 *   - Single tap toggles. Subtle pulse when paused acts as the affordance.
 *   - localStorage remembers the user's choice across reloads.
 *   - Pauses when the tab loses visibility so the music doesn't blast in
 *     background tabs. Resumes if the user had it playing.
 */
export function BGMToggle({ config }: BGMToggleProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  // Track whether the user has interacted with the toggle at least once.
  // Used to suppress the pulse animation after the first tap. Lazy init
  // checks localStorage so returning visitors with prior "playing" state
  // don't see the pulse hint again (we still can't auto-play, but the
  // hint is for new visitors).
  const [touched, setTouched] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'false'
    } catch {
      return false
    }
  })

  // On mount, create the audio element. We don't render <audio> in JSX so
  // we can keep its lifecycle entirely under our control.
  useEffect(() => {
    const audio = new Audio(config.src)
    audio.loop = true
    audio.preload = 'none'
    audio.volume = config.volume ?? 0.5
    audioRef.current = audio
    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [config.src, config.volume])

  // Pause when tab hidden, optionally resume on visible.
  useEffect(() => {
    function onVisibility() {
      const audio = audioRef.current
      if (!audio) return
      if (document.hidden && !audio.paused) {
        audio.pause()
        // Note: we DON'T flip `playing` state here — when the tab returns,
        // useEffect below restores playback if the user had it on.
      } else if (!document.hidden && playing && audio.paused) {
        void audio.play().catch(() => {
          /* autoplay denied (rare for re-resume after explicit play) */
        })
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [playing])

  // First-tap autoplay unlock. Browser autoplay policy refuses sound until
  // the page has received a user gesture; we hijack the user's very first
  // tap (anywhere on the document) to start BGM. Skipped if the user has
  // previously chosen to mute, so we don't override their preference.
  useEffect(() => {
    let userMutedBefore = false
    try {
      userMutedBefore = window.localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      /* ignore */
    }
    if (userMutedBefore) return

    function startOnFirstGesture() {
      const audio = audioRef.current
      if (!audio || !audio.paused) return
      const p = audio.play()
      if (p && typeof p.then === 'function') {
        p.then(
          () => {
            setPlaying(true)
            setTouched(true)
            try {
              window.localStorage.setItem(STORAGE_KEY, 'false')
            } catch {
              /* ignore */
            }
          },
          () => {
            /* still blocked — give up silently */
          },
        )
      }
    }
    // `pointerdown` covers mouse + touch. { once: true } so listener
    // self-removes after the first event.
    document.addEventListener('pointerdown', startOnFirstGesture, { once: true })
    return () => {
      document.removeEventListener('pointerdown', startOnFirstGesture)
    }
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    setTouched(true)
    if (playing) {
      audio.pause()
      setPlaying(false)
      try {
        window.localStorage.setItem(STORAGE_KEY, 'true')
      } catch {
        /* ignore */
      }
    } else {
      // play() returns a promise that rejects if blocked or if the file
      // doesn't exist. We swallow both — the toggle stays in its previous
      // state and the user can try again or assume the file isn't there.
      const p = audio.play()
      if (p && typeof p.then === 'function') {
        p.then(
          () => {
            setPlaying(true)
            try {
              window.localStorage.setItem(STORAGE_KEY, 'false')
            } catch {
              /* ignore */
            }
          },
          () => {
            setPlaying(false)
          },
        )
      } else {
        setPlaying(true)
      }
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={playing ? '배경음악 끄기' : '배경음악 켜기'}
      aria-pressed={playing}
      title={config.title ?? '배경음악'}
      className={
        'fixed top-4 left-1/2 z-40 flex h-10 w-10 -translate-x-[228px] items-center justify-center rounded-full bg-paper/85 text-sage-strong shadow-[0_4px_18px_rgba(0,0,0,0.12)] backdrop-blur transition hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-strong ' +
        (playing || touched ? '' : 'animate-pulse-slow')
      }
    >
      {playing ? (
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      )}
    </button>
  )
}
