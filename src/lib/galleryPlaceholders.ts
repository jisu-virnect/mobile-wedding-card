// Network-free placeholder images as data:image/svg+xml URIs.
// Kept inline so first-paint stays instant and Lighthouse Performance holds.

import type { VideoItem } from '../data/wedding'

const PALETTE = [
  { bg: '#fecdd3', fg: '#be123c' },
  { bg: '#fed7aa', fg: '#c2410c' },
  { bg: '#fef08a', fg: '#854d0e' },
  { bg: '#bbf7d0', fg: '#166534' },
  { bg: '#bae6fd', fg: '#075985' },
  { bg: '#e9d5ff', fg: '#6b21a8' },
] as const

/**
 * A unified gallery item — either a still photo or a short video. Videos
 * have a poster (used as the grid thumbnail + lightbox preview frame).
 */
export type GalleryItem =
  | { type: 'photo'; src: string; alt: string }
  | { type: 'video'; src: string; poster: string; alt: string }

/** Back-compat alias — still photos use this shape. */
export interface GalleryImage {
  src: string
  alt: string
}

function svgDataUri(index: number, total: number): string {
  const { bg, fg } = PALETTE[index % PALETTE.length]
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img">`,
    `<rect width="400" height="400" fill="${bg}"/>`,
    `<text x="50%" y="50%" font-family="system-ui,sans-serif" font-size="56" font-weight="600" fill="${fg}" text-anchor="middle" dominant-baseline="middle">`,
    `${index + 1} / ${total}`,
    `</text>`,
    `</svg>`,
  ].join('')
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function buildGalleryImages(
  urls: readonly string[] | undefined,
  fallbackCount = 6,
): GalleryImage[] {
  if (urls && urls.length > 0) {
    return urls.map((src, i) => ({
      src,
      alt: `웨딩 갤러리 사진 ${i + 1}`,
    }))
  }
  return Array.from({ length: fallbackCount }, (_, i) => ({
    src: svgDataUri(i, fallbackCount),
    alt: `웨딩 갤러리 샘플 ${i + 1}`,
  }))
}

/**
 * Compose video items + photos into a single ordered gallery feed. Videos
 * (if present) come first so the gallery opens with movement, then the
 * still photos. Each entry carries its `type` for the renderer to branch.
 */
export function buildGalleryFeed(
  urls: readonly string[] | undefined,
  videos: readonly VideoItem[] | undefined,
): GalleryItem[] {
  const photos: GalleryItem[] = buildGalleryImages(urls).map((img) => ({
    type: 'photo' as const,
    src: img.src,
    alt: img.alt,
  }))
  const vids: GalleryItem[] = (videos ?? []).map((v) => ({
    type: 'video' as const,
    src: v.src,
    poster: v.poster,
    alt: v.alt,
  }))
  // Videos first; if user wants them in another position they can splice
  // into the array after this call.
  return [...vids, ...photos]
}
