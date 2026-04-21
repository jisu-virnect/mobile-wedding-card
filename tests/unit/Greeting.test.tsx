import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Greeting } from '../../src/sections/Greeting'
import { wedding } from '../../src/data/wedding'

describe('<Greeting />', () => {
  it('renders the invitation text preserving line breaks via whitespace-pre-line', () => {
    const { container } = render(<Greeting />)
    const body = container.querySelector('p.whitespace-pre-line')
    expect(body).not.toBeNull()
    // The raw text node keeps the literal "\n"s; the CSS (whitespace-pre-line)
    // is what renders them as line breaks in the browser.
    expect(body!.textContent).toContain('\n')
    expect(body!.textContent).toContain('평생을 함께하기로 약속하는 자리')
  })

  it('shows both sets of parents grouped by side', () => {
    render(<Greeting />)
    const groom = screen.getByRole('group', { name: '신랑측 가족 정보' })
    expect(groom).toHaveTextContent(wedding.groom.father)
    expect(groom).toHaveTextContent(wedding.groom.mother)
    expect(groom).toHaveTextContent(wedding.groom.name)

    const bride = screen.getByRole('group', { name: '신부측 가족 정보' })
    expect(bride).toHaveTextContent(wedding.bride.father)
    expect(bride).toHaveTextContent(wedding.bride.mother)
    expect(bride).toHaveTextContent(wedding.bride.name)
  })

  it('has a labelled h2 heading', () => {
    render(<Greeting />)
    expect(
      screen.getByRole('heading', { level: 2, name: '초대합니다' }),
    ).toBeInTheDocument()
  })
})
