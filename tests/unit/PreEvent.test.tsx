import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PreEvent } from '../../src/sections/PreEvent'

describe('<PreEvent />', () => {
  it('renders the section heading "앞잔치"', () => {
    render(<PreEvent />)
    expect(
      screen.getByRole('heading', { level: 2, name: '앞잔치' }),
    ).toBeInTheDocument()
  })

  it('renders the description text with line breaks preserved', () => {
    const { container } = render(<PreEvent />)
    const body = container.querySelector('p.whitespace-pre-line')
    expect(body).not.toBeNull()
    expect(body!.textContent).toContain('수원까지 오시기 어려운')
    expect(body!.textContent).toContain('앞잔치라 부르는')
  })

  it('shows the formatted date and venue', () => {
    render(<PreEvent />)
    // 2026-10-01 in KST → 목요일
    expect(screen.getByText(/2026년 10월 1일 목요일/)).toBeInTheDocument()
    expect(screen.getByText(/오후 12시/)).toBeInTheDocument()
    expect(screen.getByText('신부 본가')).toBeInTheDocument()
    expect(screen.getByText('전라북도 고창군')).toBeInTheDocument()
  })

  it('shows the address-copy button (map link buttons are conditional)', () => {
    render(<PreEvent />)
    expect(
      screen.getByRole('button', { name: '앞잔치 주소 복사' }),
    ).toBeInTheDocument()
  })
})
