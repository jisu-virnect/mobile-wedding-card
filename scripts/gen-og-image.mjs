#!/usr/bin/env node
// Generates public/og-image.jpg (1200x630) from the first cover slide
// + an SVG text overlay (names + date + venue).
//
// Run via:  pnpm run gen-og
// Re-run after changing wedding.ts cover/data or swapping the cover photo.
// Output is committed to git so deploys don't need sharp at build time.

import sharp from 'sharp'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const PUBLIC_DIR = join(ROOT, 'public')
const OUT_PATH = join(PUBLIC_DIR, 'og-image.jpg')

// Crude parse of wedding.ts for the values we need. Tiny enough to be a
// regex pass (avoids spinning up a TS loader just for build-time data).
const fullSrc = readFileSync(join(ROOT, 'src/data/wedding.ts'), 'utf8')
// Skip past the type/interface declarations — they also contain the word
// "venue" / "name" and confuse simple regex parsing. Anchor on the data
// object instead.
const dataStart = fullSrc.indexOf('export const wedding')
if (dataStart === -1) {
  console.error('gen-og: could not find "export const wedding" in wedding.ts')
  process.exit(1)
}
const dataSrc = fullSrc.slice(dataStart)
function pull(re) {
  const m = dataSrc.match(re)
  if (!m) throw new Error(`gen-og: could not parse ${re}`)
  return m[1]
}
const groomName = pull(/groom:\s*\{[\s\S]*?name:\s*'([^']+)'/)
const brideName = pull(/bride:\s*\{[\s\S]*?name:\s*'([^']+)'/)
const dateTime = pull(/dateTime:\s*'([^']+)'/)
const venue = pull(/venue:\s*\{[\s\S]*?name:\s*'([^']+)'/)
const firstSlide = pull(/cover:\s*\{[\s\S]*?slides:\s*\[\s*\{\s*src:\s*'([^']+)'/)

// Format date as YYYY.MM.DD in KST (matches the visible cover treatment).
const d = new Date(dateTime)
const kst = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).formatToParts(d)
const get = (t) => kst.find((p) => p.type === t)?.value ?? ''
const dateLabel = `${get('year')}.${get('month')}.${get('day')}`

const heroPath = join(PUBLIC_DIR, firstSlide.replace(/^\//, ''))
if (!existsSync(heroPath)) {
  console.error(`gen-og: hero photo missing at ${heroPath}`)
  process.exit(1)
}

const W = 1200
const H = 630

// Layered text overlay: small eyebrow caps, big serif names, hairline,
// date + venue. Pure SVG so no fonts need to be loaded into sharp;
// rendering uses the host system's font fallback chain. The visible
// effect of font substitution is mild because the layout is dominated
// by the cropped photo.
const overlaySvg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="veil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000000" stop-opacity="0.18"/>
      <stop offset="0.55" stop-color="#000000" stop-opacity="0.05"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.78"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#veil)"/>
  <g fill="#FAF7F1" font-family="Noto Serif KR, serif" text-anchor="middle">
    <text x="600" y="350" font-size="22" letter-spacing="14" fill-opacity="0.85" font-family="Georgia, serif" font-style="italic">WEDDING INVITATION</text>
    <line x1="568" y1="378" x2="632" y2="378" stroke="#FAF7F1" stroke-opacity="0.55" stroke-width="1"/>
    <text x="600" y="445" font-size="72" font-weight="300" letter-spacing="6">${groomName}</text>
    <text x="600" y="490" font-size="20" letter-spacing="10" fill-opacity="0.7" font-style="italic" font-family="Georgia, serif">and</text>
    <text x="600" y="555" font-size="72" font-weight="300" letter-spacing="6">${brideName}</text>
    <text x="600" y="600" font-size="22" letter-spacing="8" fill-opacity="0.9" font-family="Georgia, serif">${dateLabel}  ·  ${venue}</text>
  </g>
</svg>
`.trim()

await sharp(heroPath)
  .resize(W, H, { fit: 'cover', position: 'attention' })
  .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile(OUT_PATH)

const sizeKB = Math.round(readFileSync(OUT_PATH).length / 1024)
console.log(`✓ wrote ${OUT_PATH} (${sizeKB}KB)`)
console.log(`  hero:   ${firstSlide}`)
console.log(`  names:  ${groomName} · ${brideName}`)
console.log(`  date:   ${dateLabel}`)
console.log(`  venue:  ${venue}`)

writeFileSync(
  join(PUBLIC_DIR, 'og-image.meta.json'),
  JSON.stringify(
    { width: W, height: H, generatedAt: new Date().toISOString() },
    null,
    2,
  ) + '\n',
)
