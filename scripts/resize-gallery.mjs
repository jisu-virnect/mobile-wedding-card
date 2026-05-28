#!/usr/bin/env node
// One-shot: downscale every JPG/JPEG in public/gallery/ to a web-friendly
// size, rename to zero-padded sequential names (01.jpg, 02.jpg, ...), and
// delete the originals. Safe to run multiple times — will resize anything
// not already in NN.jpg form.

import sharp from 'sharp'
import { readdirSync, renameSync, statSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

const GALLERY = 'public/gallery'
const MAX_DIM = 1600
const QUALITY = 82

const entries = readdirSync(GALLERY)
  .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  .filter((f) => !/^\d{2}\.jpg$/.test(f))
  .map((f) => ({ name: f, full: join(GALLERY, f) }))
  .sort((a, b) => a.name.localeCompare(b.name))

if (entries.length === 0) {
  console.log('No unprocessed images found. Nothing to do.')
  process.exit(0)
}

console.log(`Processing ${entries.length} image(s)…`)

// Two-pass so that target NN.jpg names don't clash with source names.
const tmpOutputs = []
let i = 1
for (const entry of entries) {
  const padded = String(i).padStart(2, '0')
  const tmp = join(GALLERY, `__tmp_${padded}.jpg`)
  const sizeBefore = statSync(entry.full).size

  await sharp(entry.full)
    .rotate()
    .resize({
      width: MAX_DIM,
      height: MAX_DIM,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(tmp)

  const sizeAfter = statSync(tmp).size
  const savedPct = Math.round((1 - sizeAfter / sizeBefore) * 100)
  console.log(
    `  ${entry.name} → ${padded}.jpg ` +
      `(${(sizeBefore / 1024 / 1024).toFixed(1)}MB → ` +
      `${(sizeAfter / 1024).toFixed(0)}KB, -${savedPct}%)`,
  )

  tmpOutputs.push({ tmp, final: join(GALLERY, `${padded}.jpg`), orig: entry.full })
  i++
}

// Now atomically swap: delete originals, rename temps to final names.
for (const { tmp, final, orig } of tmpOutputs) {
  unlinkSync(orig)
  renameSync(tmp, final)
}

console.log(`\nDone. ${tmpOutputs.length} image(s) optimized.`)
