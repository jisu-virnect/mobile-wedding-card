import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Gallery } from '../../src/sections/Gallery'

describe('<Gallery />', () => {
  it('renders a 3-column thumbnail grid', () => {
    const { container } = render(<Gallery />)
    const list = container.querySelector('ul')
    expect(list).not.toBeNull()
    expect(list).toHaveClass('grid-cols-3')
    const items = list!.querySelectorAll('li')
    // Default fallback is 6 when wedding.gallery is empty.
    expect(items.length).toBeGreaterThanOrEqual(3)
  })

  it('gives every thumbnail a descriptive aria-label', () => {
    render(<Gallery />)
    expect(
      screen.getAllByRole('button', { name: /크게 보기$/ }).length,
    ).toBeGreaterThan(0)
  })

  it('gives every <img> an alt attribute', () => {
    const { container } = render(<Gallery />)
    const imgs = container.querySelectorAll('img')
    expect(imgs.length).toBeGreaterThan(0)
    imgs.forEach((img) => {
      expect(img.getAttribute('alt')).toBeTruthy()
    })
  })

  it('opens a lightbox when a thumbnail is clicked', async () => {
    render(<Gallery />)
    const firstThumb = screen.getAllByRole('button', { name: /크게 보기$/ })[0]
    fireEvent.click(firstThumb)
    // The lightbox is code-split behind a React.lazy boundary; wait for the
    // chunk to load before asserting the portal root is mounted. Full-suite
    // parallel runs occasionally stretch the dynamic import, so we lift the
    // default timeout.
    await waitFor(
      () =>
        expect(
          document.querySelector('.yarl__container'),
        ).toBeInTheDocument(),
      { timeout: 5000 },
    )
  })
})
