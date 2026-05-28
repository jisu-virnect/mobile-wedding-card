#!/usr/bin/env node
// Regenerate the small cover slide variants used by the hero slideshow.
// These are intentionally smaller than the full gallery photos to keep
// LCP (Largest Contentful Paint) under control on mobile.
//
// Reads the slide list straight from src/data/wedding.ts so renaming the
// slides automatically picks up new entries.
//
// Usage:  pnpm run gen-cover-slides

import sharp from 'sharp'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const dataSrc = readFileSync(join(ROOT, 'src/data/wedding.ts'), 'utf8')

// Pull src paths from the cover.slides block. Tiny regex parse: looks for
// /cover-NN.jpg or /gallery/NN.jpg patterns inside the cover block.
const coverBlock =
  dataSrc.match(/cover:\s*\{[\s\S]*?slides:\s*\[([\s\S]*?)\]/)?.[1] ?? ''
const slidePaths = [...coverBlock.matchAll(/src:\s*'([^']+)'/g)].map((m) =>
  m[1].replace(/^\//, ''),
)

if (slidePaths.length === 0) {
  console.error('gen-cover-slides: no slides found in wedding.ts')
  process.exit(1)
}

// Map cover-NN.jpg back to its source gallery/NN.jpg.
function sourceFor(slide) {
  const m = slide.match(/cover-(\d{2})\.jpg$/)
  if (m) return join('public', 'gallery', `${m[1]}.jpg`)
  return join('public', slide)
}

const WIDTH = 900
const QUALITY = 80

for (const slide of slidePaths) {
  const src = sourceFor(slide)
  const dst = join('public', slide)
  if (!existsSync(src)) {
    console.warn(`  skip: source missing for ${slide} (looked at ${src})`)
    continue
  }
  await sharp(src)
    .resize({ width: WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(dst)
  const size = statSync(dst).size
  console.log(`  ${slide}: ${(size / 1024).toFixed(0)}KB (from ${src})`)
}
console.log(`\n✓ Done. ${slidePaths.length} cover slide(s) regenerated.`)
