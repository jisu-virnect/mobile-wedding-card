import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Rsvp } from '../../src/sections/Rsvp'

// Supabase env is stubbed to '' in tests/unit/setup.ts → hasSupabase() is
// false and submitRsvp() never fires. We exercise the validation paths
// (required fields) + the "backend not configured" fallback, which is the
// real-world state until the wedding party rolls out the deployed
// .env.local on Vercel.

describe('<Rsvp />', () => {
  it('blocks submit when the name is empty and shows an error', async () => {
    const user = userEvent.setup()
    render(<Rsvp />)
    await user.click(screen.getByRole('button', { name: /참석 여부/ }))
    expect(
      await screen.findByText('이름을 입력해주세요.'),
    ).toBeInTheDocument()
  })

  it('blocks submit when side is unpicked (now required)', async () => {
    const user = userEvent.setup()
    render(<Rsvp />)
    await user.type(screen.getByLabelText(/이름/), '홍길동')
    await user.click(screen.getByLabelText('참석'))
    await user.click(screen.getByRole('button', { name: /참석 여부/ }))
    expect(
      await screen.findByText('신랑측 / 신부측 중 하나를 선택해주세요.'),
    ).toBeInTheDocument()
  })

  it('blocks submit when attending is unpicked (no default checked)', async () => {
    const user = userEvent.setup()
    render(<Rsvp />)
    await user.type(screen.getByLabelText(/이름/), '홍길동')
    await user.click(screen.getByLabelText('신랑측'))
    await user.click(screen.getByRole('button', { name: /참석 여부/ }))
    expect(
      await screen.findByText('참석 여부를 선택해주세요.'),
    ).toBeInTheDocument()
  })

  it('shows the "backend not configured" notice when Supabase env is missing', async () => {
    const user = userEvent.setup()
    render(<Rsvp />)
    await user.type(screen.getByLabelText(/이름/), '김하늘')
    await user.click(screen.getByLabelText('신랑측'))
    await user.click(screen.getByLabelText('참석'))
    await user.click(screen.getByRole('button', { name: /참석 여부/ }))
    expect(
      await screen.findByText(/아직 준비 중이에요/),
    ).toBeInTheDocument()
  })

  it('exposes the optional relationship input', () => {
    render(<Rsvp />)
    expect(screen.getByLabelText(/관계/)).toBeInTheDocument()
  })

  it('shows the transparency note that data goes to the couple', () => {
    render(<Rsvp />)
    expect(
      screen.getByText(/전달된 정보는 신랑.신부에게만 안내됩니다/),
    ).toBeInTheDocument()
  })
})
