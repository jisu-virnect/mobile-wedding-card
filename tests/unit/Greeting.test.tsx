import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Greeting } from '../../src/sections/Greeting'
import { wedding } from '../../src/data/wedding'

describe('<Greeting />', () => {
  it('renders the invitation body with bold emphasis on the key phrase', () => {
    render(<Greeting />)
    // Line breaks are now `<br/>` (from renderInlineBold) and the
    // **...** segment becomes a real <strong>.
    expect(
      screen.getByText('평생을 함께하기로 약속하는 자리'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('평생을 함께하기로 약속하는 자리').tagName.toLowerCase(),
    ).toBe('strong')
    // Plain segments still rendered too.
    expect(
      screen.getByText('저희 두 사람의 소중한 만남이'),
    ).toBeInTheDocument()
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
      screen.getByRole('heading', { level: 2, name: '결혼합니다' }),
    ).toBeInTheDocument()
  })
})
