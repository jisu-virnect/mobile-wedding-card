import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BGMToggle } from '../../src/sections/BGMToggle'

describe('<BGMToggle />', () => {
  // Stub out the Audio constructor — jsdom's implementation is minimal and
  // doesn't actually decode media, but we don't need real playback to verify
  // the toggle wiring.
  let pause: ReturnType<typeof vi.fn>
  let play: ReturnType<typeof vi.fn>
  let originalAudio: typeof window.Audio

  beforeEach(() => {
    pause = vi.fn()
    play = vi.fn().mockResolvedValue(undefined)
    originalAudio = window.Audio
    // Constructible stub (jsdom's Audio is incomplete in v29).
    class FakeAudio {
      pause = pause
      play = play
      loop = false
      preload = ''
      volume = 0
      src = ''
      paused = true
      constructor(src?: string) {
        if (src) this.src = src
      }
    }
    // @ts-expect-error — minimal stub
    window.Audio = FakeAudio
    window.localStorage.clear()
  })

  afterEach(() => {
    window.Audio = originalAudio
    vi.restoreAllMocks()
  })

  it('starts in the paused state with an accessible label', () => {
    render(<BGMToggle config={{ src: '/bgm.mp3' }} />)
    const btn = screen.getByRole('button', { name: '배경음악 켜기' })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('aria-pressed', 'false')
  })

  it('toggles to playing on click and updates the label', async () => {
    render(<BGMToggle config={{ src: '/bgm.mp3' }} />)
    const btn = screen.getByRole('button', { name: '배경음악 켜기' })
    fireEvent.click(btn)
    // play() returns a resolved promise; wait a microtask for setPlaying.
    await Promise.resolve()
    expect(play).toHaveBeenCalledTimes(1)
    const offBtn = await screen.findByRole('button', {
      name: '배경음악 끄기',
    })
    expect(offBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('persists muted=false in localStorage after a successful play', async () => {
    render(<BGMToggle config={{ src: '/bgm.mp3' }} />)
    fireEvent.click(screen.getByRole('button', { name: '배경음악 켜기' }))
    await Promise.resolve()
    await Promise.resolve()
    expect(window.localStorage.getItem('bgm:muted')).toBe('false')
  })

  it('uses the configured volume', () => {
    let captured: number | undefined
    const Spy = class extends (window.Audio as unknown as new () => {
      volume: number
    }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(...args: any[]) {
        super(...args)
        Object.defineProperty(this, 'volume', {
          set(v: number) {
            captured = v
          },
          get() {
            return captured ?? 0
          },
          configurable: true,
        })
      }
    } as unknown as typeof window.Audio
    window.Audio = Spy
    render(<BGMToggle config={{ src: '/bgm.mp3', volume: 0.3 }} />)
    expect(captured).toBe(0.3)
  })
})
