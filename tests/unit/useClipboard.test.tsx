import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useClipboard } from '../../src/lib/useClipboard'

describe('useClipboard', () => {
  let writeText: ReturnType<typeof vi.fn>

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('writes the given text and flips copied to true', async () => {
    const { result } = renderHook(() => useClipboard())
    let ok: boolean | undefined
    await act(async () => {
      ok = await result.current.copy('hello')
    })
    expect(ok).toBe(true)
    expect(writeText).toHaveBeenCalledWith('hello')
    await waitFor(() => expect(result.current.copied).toBe(true))
    expect(result.current.error).toBeNull()
  })

  it('resets copied to false after resetMs', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useClipboard(500))
    await act(async () => {
      await result.current.copy('hi')
    })
    expect(result.current.copied).toBe(true)
    await act(async () => {
      vi.advanceTimersByTime(600)
    })
    expect(result.current.copied).toBe(false)
  })

  it('surfaces an error when clipboard.writeText rejects', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'))
    const { result } = renderHook(() => useClipboard())
    let ok: boolean | undefined
    await act(async () => {
      ok = await result.current.copy('x')
    })
    expect(ok).toBe(false)
    expect(result.current.copied).toBe(false)
    expect(result.current.error?.message).toBe('denied')
  })
})
