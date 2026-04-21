import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Account } from '../../src/sections/Account'
import { wedding } from '../../src/data/wedding'

describe('<Account />', () => {
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
    vi.unstubAllGlobals()
  })

  it('renders both side accordion buttons with aria-expanded', () => {
    render(<Account />)
    const groom = screen.getByRole('button', { name: /신랑측/ })
    const bride = screen.getByRole('button', { name: /신부측/ })
    // Default: groom open, bride closed.
    expect(groom).toHaveAttribute('aria-expanded', 'true')
    expect(bride).toHaveAttribute('aria-expanded', 'false')
  })

  it('toggles aria-expanded when an accordion button is clicked', async () => {
    const user = userEvent.setup()
    render(<Account />)
    const bride = screen.getByRole('button', { name: /신부측/ })
    expect(bride).toHaveAttribute('aria-expanded', 'false')
    await user.click(bride)
    expect(bride).toHaveAttribute('aria-expanded', 'true')
    await user.click(bride)
    expect(bride).toHaveAttribute('aria-expanded', 'false')
  })

  it('copies the account number when the copy button is clicked', async () => {
    render(<Account />)
    const copyBtn = screen.getByRole('button', {
      name: `신랑 ${wedding.groom.name} 계좌번호 복사`,
    })
    await act(async () => {
      fireEvent.click(copyBtn)
    })
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(wedding.groom.account!.number),
    )
    expect(
      await screen.findByText(
        `신랑 ${wedding.groom.name} 계좌번호를 복사했어요.`,
      ),
    ).toBeInTheDocument()
  })

  it('surfaces a retry hint when the clipboard call rejects', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'))
    render(<Account />)
    const copyBtn = screen.getByRole('button', {
      name: `신랑 ${wedding.groom.name} 계좌번호 복사`,
    })
    await act(async () => {
      fireEvent.click(copyBtn)
    })
    expect(
      await screen.findByText(/길게 눌러 직접 복사/),
    ).toBeInTheDocument()
  })
})
