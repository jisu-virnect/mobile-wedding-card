import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Cover } from '../../src/sections/Cover'
import { wedding } from '../../src/data/wedding'

describe('<Cover />', () => {
  it('renders h1 containing both names', () => {
    render(<Cover />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent(wedding.groom.name)
    expect(heading).toHaveTextContent(wedding.bride.name)
  })

  it('renders the wedding date as YYYY.MM.DD · 요일', () => {
    render(<Cover />)
    expect(screen.getByText(/2026\.10\.10\s·\s토요일/)).toBeInTheDocument()
  })

  it('exposes a scroll indicator with an aria-label', () => {
    render(<Cover />)
    expect(
      screen.getByRole('button', { name: '다음 섹션으로 스크롤' }),
    ).toBeInTheDocument()
  })
})
