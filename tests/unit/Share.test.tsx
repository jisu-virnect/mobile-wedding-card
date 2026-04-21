import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Share } from '../../src/sections/Share'

describe('<Share />', () => {
  let writeText: ReturnType<typeof vi.fn>

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    })
    // Default: no Web Share support.
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
      writable: true,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('hides the native share button when navigator.share is unavailable', () => {
    render(<Share />)
    expect(
      screen.queryByRole('button', { name: '기기 공유 시트로 공유하기' }),
    ).toBeNull()
    expect(
      screen.getByRole('button', { name: '초대장 링크 복사' }),
    ).toBeInTheDocument()
  })

  it('shows the native share button when navigator.share exists and invokes it', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', {
      value: share,
      configurable: true,
      writable: true,
    })
    render(<Share />)
    const btn = await screen.findByRole('button', {
      name: '기기 공유 시트로 공유하기',
    })
    await act(async () => {
      fireEvent.click(btn)
    })
    expect(share).toHaveBeenCalledTimes(1)
    const arg = share.mock.calls[0][0]
    expect(arg.url).toBe(window.location.href)
    expect(arg.title).toMatch(/결혼식 초대/)
  })

  it('swallows AbortError without showing an error toast', async () => {
    const share = vi.fn().mockRejectedValue(
      new DOMException('cancelled', 'AbortError'),
    )
    Object.defineProperty(navigator, 'share', {
      value: share,
      configurable: true,
      writable: true,
    })
    render(<Share />)
    const btn = await screen.findByRole('button', {
      name: '기기 공유 시트로 공유하기',
    })
    await act(async () => {
      fireEvent.click(btn)
    })
    // Status region should remain empty after cancel.
    expect(screen.getByRole('status').textContent ?? '').toBe('')
  })

  it('copies location.href and announces success when the link-copy button is clicked', async () => {
    render(<Share />)
    const btn = screen.getByRole('button', { name: '초대장 링크 복사' })
    await act(async () => {
      fireEvent.click(btn)
    })
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(window.location.href),
    )
    expect(
      await screen.findByText(/링크를 복사했어요/),
    ).toBeInTheDocument()
  })
})
