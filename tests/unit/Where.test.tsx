import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Where } from '../../src/sections/Where'
import { wedding } from '../../src/data/wedding'

describe('<Where />', () => {
  it('shows venue name, address, and detail', () => {
    render(<Where />)
    expect(screen.getByText(wedding.venue.name)).toBeInTheDocument()
    expect(screen.getByText(wedding.venue.address)).toBeInTheDocument()
    if (wedding.venue.detail)
      expect(screen.getByText(wedding.venue.detail)).toBeInTheDocument()
  })

  it('renders map buttons with correct hrefs and accessible labels', () => {
    render(<Where />)
    const kakao = screen.getByRole('link', { name: '카카오맵으로 열기' })
    const naver = screen.getByRole('link', { name: '네이버지도로 열기' })
    expect(kakao).toHaveAttribute('href', wedding.venue.kakaoMapUrl)
    expect(naver).toHaveAttribute('href', wedding.venue.naverMapUrl)
    expect(kakao).toHaveAttribute('target', '_blank')
    expect(kakao).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('exposes a labelled copy button and a live status region', () => {
    render(<Where />)
    expect(screen.getByRole('button', { name: '주소 복사' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('labels the map placeholder with the venue name', () => {
    render(<Where />)
    expect(
      screen.getByRole('img', { name: `${wedding.venue.name} 약도 이미지` }),
    ).toBeInTheDocument()
  })
})
