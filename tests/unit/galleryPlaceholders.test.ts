import { describe, expect, it } from 'vitest'
import { buildGalleryImages } from '../../src/lib/galleryPlaceholders'

describe('buildGalleryImages', () => {
  it('uses provided URLs when non-empty, with sequential alt labels', () => {
    const urls = ['/a.jpg', '/b.jpg']
    const imgs = buildGalleryImages(urls)
    expect(imgs).toHaveLength(2)
    expect(imgs[0]).toEqual({ src: '/a.jpg', alt: '웨딩 갤러리 사진 1' })
    expect(imgs[1]).toEqual({ src: '/b.jpg', alt: '웨딩 갤러리 사진 2' })
  })

  it('falls back to 6 inline SVG data URIs when urls are empty', () => {
    const imgs = buildGalleryImages([])
    expect(imgs).toHaveLength(6)
    imgs.forEach((img, i) => {
      expect(img.src.startsWith('data:image/svg+xml')).toBe(true)
      expect(img.alt).toBe(`웨딩 갤러리 샘플 ${i + 1}`)
    })
  })

  it('respects a custom fallbackCount', () => {
    expect(buildGalleryImages(undefined, 3)).toHaveLength(3)
  })
})
