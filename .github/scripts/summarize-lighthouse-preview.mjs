#!/usr/bin/env node
// Turns a Lighthouse-CI preview run into a short sticky PR comment.
//
// Env:
//   GH_TOKEN, GITHUB_REPOSITORY, GITHUB_RUN_ID, GITHUB_SERVER_URL
//   PR_NUMBER  — resolved upstream (e.g., by a script that matches deployment SHA -> PR)
//   PREVIEW_URL — the Vercel preview URL that was audited
//   LINKS_PATH — path to .lighthouseci/links.json written by temporary-public-storage upload
//   MANIFEST_PATH — path to .lighthouseci/manifest.json with per-run scores

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const MARKER = '<!-- lighthouse-preview:do-not-remove -->'

const PR = process.env.PR_NUMBER
const REPO = process.env.GITHUB_REPOSITORY
const RUN_ID = process.env.GITHUB_RUN_ID
const SERVER = process.env.GITHUB_SERVER_URL ?? 'https://github.com'
const PREVIEW_URL = process.env.PREVIEW_URL ?? ''
const LINKS_PATH = process.env.LINKS_PATH ?? '.lighthouseci/links.json'
const MANIFEST_PATH = process.env.MANIFEST_PATH ?? '.lighthouseci/manifest.json'

if (!PR || !REPO) {
  console.log('PR_NUMBER or GITHUB_REPOSITORY missing. Skipping comment.')
  process.exit(0)
}

let hostedReportUrl = ''
if (existsSync(LINKS_PATH)) {
  const links = JSON.parse(readFileSync(LINKS_PATH, 'utf8'))
  const first = Object.values(links)[0]
  if (typeof first === 'string') hostedReportUrl = first
}

const scoreRow = []
if (existsSync(MANIFEST_PATH)) {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
  const representative =
    manifest.find((m) => m.isRepresentativeRun) ?? manifest[0]
  if (representative?.summary) {
    for (const [key, value] of Object.entries(representative.summary)) {
      const pct = Math.round(Number(value) * 100)
      scoreRow.push([key, pct])
    }
  }
}

function fmt(key) {
  switch (key) {
    case 'performance':
      return 'Performance'
    case 'accessibility':
      return 'Accessibility'
    case 'best-practices':
      return 'Best Practices'
    case 'seo':
      return 'SEO'
    case 'pwa':
      return 'PWA'
    default:
      return key
  }
}

function emoji(pct) {
  if (pct >= 90) return '🟢'
  if (pct >= 50) return '🟡'
  return '🔴'
}

const lines = [MARKER]
lines.push('## 🔍 Lighthouse (Vercel preview) — 모바일 에뮬레이션')
lines.push('')
if (PREVIEW_URL) {
  lines.push(`URL: ${PREVIEW_URL}`)
  lines.push('')
}
if (scoreRow.length) {
  lines.push('| Category | Score |')
  lines.push('|---|---|')
  for (const [key, pct] of scoreRow) {
    lines.push(`| ${fmt(key)} | ${emoji(pct)} ${pct} |`)
  }
  lines.push('')
}
if (hostedReportUrl) {
  lines.push(`[상세 리포트 보기](${hostedReportUrl})`)
  lines.push('')
}
if (RUN_ID) {
  lines.push(`CI run: ${SERVER}/${REPO}/actions/runs/${RUN_ID}`)
}

const body = lines.join('\n')
const bodyPath = join(tmpdir(), `lh-preview-${RUN_ID ?? 'local'}.md`)
writeFileSync(bodyPath, body)

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
}

const commentsRaw = sh(`gh api "repos/${REPO}/issues/${PR}/comments" --paginate`)
const comments = JSON.parse(commentsRaw)
const existing = comments.find(
  (c) => typeof c.body === 'string' && c.body.includes(MARKER),
)

if (existing) {
  sh(
    `gh api "repos/${REPO}/issues/comments/${existing.id}" -X PATCH -F body=@${bodyPath}`,
  )
  console.log(`Updated existing comment ${existing.id}`)
} else {
  sh(`gh pr comment ${PR} --repo ${REPO} --body-file ${bodyPath}`)
  console.log('Posted new comment')
}
