#!/usr/bin/env node
// Extracts a still frame from every MP4 in public/videos/ and saves it as
// a sibling .jpg — used as the poster/thumbnail in the Films section grid.
// Saves you from hand-curating poster images separately when the videos
// already have a perfectly good frame to use.
//
// Usage:
//   pnpm gen-video-posters                  # extract frame at 2.0s, skip existing
//   pnpm gen-video-posters --force          # overwrite existing posters
//   pnpm gen-video-posters --time=5         # extract frame at 5s
//   pnpm gen-video-posters --time=5 --force
//
// Requires ffmpeg on PATH.

import { spawnSync } from 'node:child_process'
import {
  existsSync,
  readdirSync,
  statSync,
} from 'node:fs'
import { basename, extname, join } from 'node:path'

const VIDEO_DIR = 'public/videos'
const args = process.argv.slice(2)
const force = args.includes('--force')
const timeArg =
  args.find((a) => a.startsWith('--time='))?.split('=')[1] ?? '2.0'

if (!existsSync(VIDEO_DIR)) {
  console.error(`gen-video-posters: ${VIDEO_DIR} not found`)
  process.exit(1)
}

const videos = readdirSync(VIDEO_DIR)
  .filter((f) => f.toLowerCase().endsWith('.mp4'))
  .filter((f) => !f.startsWith('.'))
  .sort()

if (videos.length === 0) {
  console.log(`No .mp4 files in ${VIDEO_DIR}. Nothing to do.`)
  process.exit(0)
}

console.log(`Extracting posters at t=${timeArg}s (force=${force})`)
console.log()

let processed = 0
let skipped = 0
for (const v of videos) {
  const videoPath = join(VIDEO_DIR, v)
  const posterPath = join(VIDEO_DIR, basename(v, extname(v)) + '.jpg')

  if (existsSync(posterPath) && !force) {
    console.log(`  skip ${v} (${basename(posterPath)} exists; use --force)`)
    skipped++
    continue
  }

  // -ss before -i = fast seek (uses keyframes; good enough for posters).
  // -frames:v 1 = grab exactly one frame.
  // -q:v 3 = JPEG quality (lower = better; 2-5 is the sweet spot).
  // -vf scale=900:-2 = constrain width to 900px, keep aspect (auto even).
  const r = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-ss',
      timeArg,
      '-i',
      videoPath,
      '-frames:v',
      '1',
      '-q:v',
      '3',
      '-vf',
      'scale=900:-2',
      posterPath,
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  )

  if (r.status !== 0) {
    console.error(`  fail ${v}:`)
    console.error(r.stderr?.toString().split('\n').slice(-5).join('\n'))
    process.exit(1)
  }
  const size = statSync(posterPath).size
  console.log(
    `  ok   ${v} → ${basename(posterPath)} (${(size / 1024).toFixed(0)}KB)`,
  )
  processed++
}

console.log()
console.log(`✓ Done. ${processed} extracted, ${skipped} skipped.`)
