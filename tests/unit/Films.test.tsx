import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Films } from '../../src/sections/Films'

// Films pulls from wedding.videos. We mock the module so each test can pick
// what's in the list (or that the section is hidden when empty).
vi.mock('../../src/data/wedding', () => ({
  wedding: {
    videos: [
      { src: '/videos/01.mp4', poster: '/videos/01.jpg', alt: '본식 하이라이트' },
      { src: '/videos/02.mp4', poster: '/videos/02.jpg', alt: '프로포즈 순간' },
    ],
  },
}))

describe('<Films />', () => {
  beforeEach(() => {
    // jsdom's HTMLMediaElement.play/pause are not implemented; stub them.
    HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
    HTMLMediaElement.prototype.pause = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders one card per video with its poster as the thumbnail', () => {
    render(<Films />)
    expect(
      screen.getByRole('button', { name: '본식 하이라이트 영상 재생' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '프로포즈 순간 영상 재생' }),
    ).toBeInTheDocument()
  })

  it('replaces the poster with a <video> + close button on tap', () => {
    render(<Films />)
    fireEvent.click(
      screen.getByRole('button', { name: '본식 하이라이트 영상 재생' }),
    )
    // After tap: the play button is gone; close button appears.
    expect(
      screen.queryByRole('button', { name: '본식 하이라이트 영상 재생' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '본식 하이라이트 영상 닫기' }),
    ).toBeInTheDocument()
  })

  it('returns to the poster state when close is tapped', () => {
    render(<Films />)
    fireEvent.click(
      screen.getByRole('button', { name: '본식 하이라이트 영상 재생' }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: '본식 하이라이트 영상 닫기' }),
    )
    expect(
      screen.getByRole('button', { name: '본식 하이라이트 영상 재생' }),
    ).toBeInTheDocument()
  })

  it('renders the section heading with the Korean title only', () => {
    render(<Films />)
    expect(
      screen.getByRole('heading', { level: 2, name: '함께한 순간' }),
    ).toBeInTheDocument()
  })
})
