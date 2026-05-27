import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Account } from '../../src/sections/Account'
import { ToastContainer } from '../../src/sections/ToastContainer'
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

  it('shows both sides as always-open cards (no accordion)', () => {
    render(<Account />)
    // Both sides' account numbers visible without any toggle interaction.
    // Use getAllByText because parent accounts (placeholder) share the same
    // number string until real data is filled in.
    expect(
      screen.getAllByText(wedding.groom.account!.number).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByText(wedding.bride.account!.number).length,
    ).toBeGreaterThan(0)
  })

  it('shows both sides side-by-side with their holder names', () => {
    render(<Account />)
    // Holder name appears in each card header.
    expect(screen.getAllByText(wedding.groom.account!.holder).length).toBeGreaterThan(0)
    expect(screen.getAllByText(wedding.bride.account!.holder).length).toBeGreaterThan(0)
  })

  it('copies the account number when the copy button is clicked', async () => {
    render(
      <>
        <Account />
        <ToastContainer />
      </>,
    )
    const copyBtn = screen.getByRole('button', {
      name: `신랑 ${wedding.groom.name} 계좌번호 복사`,
    })
    await act(async () => {
      fireEvent.click(copyBtn)
    })
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(wedding.groom.account!.number),
    )
    // Success toast (text now lives in the global ToastContainer).
    expect(
      await screen.findByText(
        `신랑 ${wedding.groom.name} 계좌번호 복사되었어요.`,
      ),
    ).toBeInTheDocument()
  })

  it('renders a Toss send link for mapped banks', () => {
    render(<Account />)
    // 신부 김난슬 = 카카오뱅크 → Toss link should appear.
    const tossLink = screen.getByRole('link', {
      name: `신부 ${wedding.bride.name} 토스로 송금`,
    })
    expect(tossLink.getAttribute('href')).toMatch(/^supertoss:\/\/send\?/)
  })

  it('hides the Kakao send link when kakaoPayUrl is not set', () => {
    render(<Account />)
    expect(
      screen.queryByRole('link', {
        name: `신부 ${wedding.bride.name} 카카오로 송금`,
      }),
    ).toBeNull()
  })

  it('surfaces a retry hint when the clipboard call rejects', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'))
    render(
      <>
        <Account />
        <ToastContainer />
      </>,
    )
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
