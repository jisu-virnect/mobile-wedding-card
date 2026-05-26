#!/usr/bin/env node
// Re-encode + downscale a video clip to web-friendly H.264 baseline 480p.
// Used to compress phone-camera originals (HEVC + 1080p, often 20-150MB)
// down to the 2-8MB range suitable for mobile wedding-card gallery cards.
//
// Usage:
//   pnpm run encode-video <input> [output] [--clip=<seconds>]
//
// Examples:
//   pnpm run encode-video originals/02.mp4 02.mp4 --clip=30
//   pnpm run encode-video originals/01.mp4
//
// Requires `ffmpeg` on PATH (winget install Gyan.FFmpeg on Windows).

import { spawnSync } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
const flags = Object.fromEntries(
  args
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [k, v] = a.replace(/^--/, '').split('=')
      return [k, v ?? true]
    }),
)
const positional = args.filter((a) => !a.startsWith('--'))
const input = positional[0]
const output = positional[1] ?? input?.replace(/\.([^.]+)$/, '-web.$1')

if (!input) {
  console.error('Usage: encode-video <input> [output] [--clip=<seconds>]')
  console.error('Example: encode-video originals/02.mp4 02.mp4 --clip=30')
  process.exit(1)
}
if (!existsSync(input)) {
  console.error(`encode-video: input not found: ${input}`)
  process.exit(1)
}

// Detect orientation so we scale the right dimension. Vertical → width 480,
// horizontal → height 480 (both yield ~480p).
const probe = spawnSync(
  'ffprobe',
  [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=width,height',
    '-of',
    'csv=p=0',
    input,
  ],
  { encoding: 'utf8' },
)
if (probe.status !== 0) {
  console.error('ffprobe failed:', probe.stderr)
  process.exit(1)
}
const [w, h] = probe.stdout.trim().split(',').map(Number)
const vertical = h > w
const scale = vertical ? 'scale=480:-2' : 'scale=-2:480'

const ffmpegArgs = ['-y', '-i', input]
if (flags.clip) ffmpegArgs.push('-t', String(flags.clip))
ffmpegArgs.push(
  '-vf',
  `${scale},format=yuv420p`,
  '-c:v',
  'libx264',
  '-profile:v',
  'baseline',
  '-level',
  '3.0',
  '-preset',
  'slow',
  '-crf',
  '26',
  '-c:a',
  'aac',
  '-b:a',
  '96k',
  '-ac',
  '2',
  '-movflags',
  '+faststart',
  output,
)

console.log(`encoding: ${input} → ${output}`)
console.log(`  source:  ${w}x${h} (${vertical ? 'vertical' : 'horizontal'})`)
if (flags.clip) console.log(`  clip:    first ${flags.clip}s`)
console.log()
const enc = spawnSync('ffmpeg', ffmpegArgs, { stdio: 'inherit' })
if (enc.status !== 0) {
  console.error('\nffmpeg failed')
  process.exit(enc.status ?? 1)
}

const inBytes = statSync(input).size
const outBytes = statSync(resolve(output)).size
const pct = Math.round((1 - outBytes / inBytes) * 100)
console.log()
console.log(
  `✓ done: ${(inBytes / 1024 / 1024).toFixed(1)}MB → ${(outBytes / 1024 / 1024).toFixed(2)}MB (-${pct}%)`,
)
