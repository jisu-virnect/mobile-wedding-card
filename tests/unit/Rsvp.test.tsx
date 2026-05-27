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

  it('blocks submit when relationship chip is unpicked', async () => {
    const user = userEvent.setup()
    render(<Rsvp />)
    await user.type(screen.getByLabelText(/이름/), '홍길동')
    await user.click(screen.getByLabelText('참석'))
    await user.type(screen.getByLabelText(/참석 인원/), '1')
    await user.click(screen.getByRole('button', { name: /참석 여부/ }))
    expect(
      await screen.findByText('관계를 선택해주세요.'),
    ).toBeInTheDocument()
  })

  it('blocks submit when attending is unpicked (no default checked)', async () => {
    const user = userEvent.setup()
    render(<Rsvp />)
    await user.type(screen.getByLabelText(/이름/), '홍길동')
    await user.click(screen.getByLabelText('신랑'))
    await user.type(screen.getByLabelText(/참석 인원/), '1')
    await user.click(screen.getByRole('button', { name: /참석 여부/ }))
    expect(
      await screen.findByText('참석 여부를 선택해주세요.'),
    ).toBeInTheDocument()
  })

  it('shows the "backend not configured" notice when Supabase env is missing', async () => {
    const user = userEvent.setup()
    render(<Rsvp />)
    await user.type(screen.getByLabelText(/이름/), '김하늘')
    await user.click(screen.getByLabelText('신랑'))
    await user.click(screen.getByLabelText('참석'))
    await user.type(screen.getByLabelText(/참석 인원/), '1')
    await user.click(screen.getByRole('button', { name: /참석 여부/ }))
    expect(
      await screen.findByText(/아직 준비 중이에요/),
    ).toBeInTheDocument()
  })

  it('renders both relationship chip groups (신랑측 / 신부측)', () => {
    render(<Rsvp />)
    const group = screen.getByRole('radiogroup', { name: '관계' })
    expect(group).toHaveTextContent('신랑측')
    expect(group).toHaveTextContent('신부측')
    expect(group).toHaveTextContent('신랑')
    expect(group).toHaveTextContent('신랑아버님')
    expect(group).toHaveTextContent('신랑어머님')
    expect(group).toHaveTextContent('신랑측 그 외')
    expect(group).toHaveTextContent('신부')
    expect(group).toHaveTextContent('신부아버님')
    expect(group).toHaveTextContent('신부어머님')
    expect(group).toHaveTextContent('신부동생')
    expect(group).toHaveTextContent('신부측 그 외')
  })

  it('shows the transparency note that data goes to the couple', () => {
    render(<Rsvp />)
    expect(
      screen.getByText(/전달된 정보는 신랑.신부에게만 안내됩니다/),
    ).toBeInTheDocument()
  })
})
