import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PreEvent } from '../../src/sections/PreEvent'

describe('<PreEvent />', () => {
  it('renders the section heading "피로연 장소"', () => {
    render(<PreEvent />)
    expect(
      screen.getByRole('heading', { level: 2, name: '피로연 장소' }),
    ).toBeInTheDocument()
  })

  it('renders the description body with bold emphasis on the key phrase', () => {
    render(<PreEvent />)
    expect(
      screen.getByText(/수원까지 오시기 어려운/),
    ).toBeInTheDocument()
    expect(screen.getByText('결혼식에 앞서 식사대접')).toBeInTheDocument()
    expect(
      screen.getByText('결혼식에 앞서 식사대접').tagName.toLowerCase(),
    ).toBe('strong')
  })

  it('renders the signoff line', () => {
    render(<PreEvent />)
    expect(
      screen.getByText('혼주 김청섭 · 이경화 올림'),
    ).toBeInTheDocument()
  })

  it('uses the dateDisplay override when set', () => {
    render(<PreEvent />)
    expect(
      screen.getByText('2026년 10월 · 날짜 추후 안내'),
    ).toBeInTheDocument()
    expect(screen.getByText('오후 1시부터')).toBeInTheDocument()
  })

  it('shows the new venue + address', () => {
    render(<PreEvent />)
    expect(screen.getByText('상하 실내체육관')).toBeInTheDocument()
    expect(
      screen.getByText('전라북도 고창군 상하면 선운대로 810'),
    ).toBeInTheDocument()
  })

  it('renders 마음 전하는 곳 cards for both 신부 + 신부 아버지', () => {
    render(<PreEvent />)
    // 신부 (김난슬, 카카오뱅크)
    expect(screen.getByText('카카오뱅크')).toBeInTheDocument()
    expect(screen.getByText('3333-30-4385686')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '신부 김난슬 계좌번호 복사' }),
    ).toBeInTheDocument()
    // 신부 아버지 (김청섭, 농협)
    expect(screen.getByText('농협')).toBeInTheDocument()
    expect(screen.getByText('356-1314-3461-83')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '신부 아버지 김청섭 계좌번호 복사' }),
    ).toBeInTheDocument()
  })

  it('renders Toss / KakaoPay send links on each account card', () => {
    render(<PreEvent />)
    // 신부 김난슬 = 카카오뱅크 → both buttons should appear.
    expect(
      screen.getByRole('link', { name: '신부 김난슬 Toss 로 송금' })
        .getAttribute('href'),
    ).toMatch(/^supertoss:\/\/send\?/)
    expect(
      screen
        .getByRole('link', { name: '신부 김난슬 카카오페이로 송금' })
        .getAttribute('href'),
    ).toMatch(/^kakaotalk:\/\/kakaopay\/money\/to\/bank\?/)
    // 신부 아버지 김청섭 = 농협 → both buttons should appear.
    expect(
      screen.getByRole('link', { name: '신부 아버지 김청섭 Toss 로 송금' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: '신부 아버지 김청섭 카카오페이로 송금',
      }),
    ).toBeInTheDocument()
  })

  it('shows the address-copy button', () => {
    render(<PreEvent />)
    expect(
      screen.getByRole('button', { name: '피로연 주소 복사' }),
    ).toBeInTheDocument()
  })
})
