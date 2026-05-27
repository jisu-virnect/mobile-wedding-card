import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ScrollToTop } from '../../src/sections/ScrollToTop'

describe('<ScrollToTop />', () => {
  let scrollTo: ReturnType<typeof vi.fn>

  beforeEach(() => {
    scrollTo = vi.fn()
    Object.defineProperty(window, 'scrollTo', {
      value: scrollTo,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
      writable: true,
      configurable: true,
    })
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the button with accessible label', () => {
    render(<ScrollToTop />)
    expect(
      screen.getByRole('button', { name: '맨 위로' }),
    ).toBeInTheDocument()
  })

  it('starts hidden (opacity-0 + tabIndex -1) when at top', () => {
    render(<ScrollToTop />)
    const btn = screen.getByRole('button', { name: '맨 위로' })
    expect(btn.className).toContain('opacity-0')
    expect(btn).toHaveAttribute('tabIndex', '-1')
    expect(btn).toHaveAttribute('data-visible', 'false')
  })

  it('becomes visible after scrolling past the threshold', () => {
    render(<ScrollToTop />)
    act(() => {
      window.scrollY = 500
      window.dispatchEvent(new Event('scroll'))
    })
    const btn = screen.getByRole('button', { name: '맨 위로' })
    expect(btn.className).toContain('opacity-100')
    expect(btn).toHaveAttribute('data-visible', 'true')
    expect(btn).toHaveAttribute('tabIndex', '0')
  })

  it('calls window.scrollTo on click (smooth by default)', () => {
    render(<ScrollToTop />)
    fireEvent.click(screen.getByRole('button', { name: '맨 위로' }))
    expect(scrollTo).toHaveBeenCalledTimes(1)
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('uses instant scroll when prefers-reduced-motion is set', () => {
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
      writable: true,
      configurable: true,
    })
    render(<ScrollToTop />)
    fireEvent.click(screen.getByRole('button', { name: '맨 위로' }))
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })
})
