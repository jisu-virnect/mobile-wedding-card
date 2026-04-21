#!/usr/bin/env node
// Produces a short markdown summary of the latest Playwright run and
// upserts it as a sticky PR comment (identified by COMMENT_MARKER).
//
// Expects these env vars (usually set by the GitHub Actions runner):
//   GH_TOKEN              — GitHub token with pull-request: write
//   GITHUB_REPOSITORY     — "owner/repo"
//   GITHUB_RUN_ID         — current Actions run id
//   GITHUB_SERVER_URL     — e.g. https://github.com
//   PR_NUMBER             — PR number this workflow is running for
//
// Reads Playwright's JSON reporter output from playwright-report/results.json.

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const COMMENT_MARKER = '<!-- e2e-summary:do-not-remove -->'
const JSON_PATH = 'playwright-report/results.json'

const PR = process.env.PR_NUMBER
const REPO = process.env.GITHUB_REPOSITORY
const RUN_ID = process.env.GITHUB_RUN_ID
const SERVER = process.env.GITHUB_SERVER_URL ?? 'https://github.com'

if (!PR) {
  console.log('PR_NUMBER not set; not a pull_request event. Skipping comment.')
  process.exit(0)
}
if (!REPO) {
  console.log('GITHUB_REPOSITORY missing. Skipping comment.')
  process.exit(0)
}

if (!existsSync(JSON_PATH)) {
  console.log(`No Playwright JSON at ${JSON_PATH}. Nothing to summarize.`)
  process.exit(0)
}

const report = JSON.parse(readFileSync(JSON_PATH, 'utf8'))
const stats = report.stats ?? {}
const pass = stats.expected ?? 0
const fail = stats.unexpected ?? 0
const flaky = stats.flaky ?? 0
const skipped = stats.skipped ?? 0
const duration = typeof stats.duration === 'number'
  ? `${(stats.duration / 1000).toFixed(1)}s`
  : 'n/a'

const failures = []
function walk(suite) {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const last = test.results?.[test.results.length - 1]
      if (!last || last.status !== 'failed') continue
      const firstErr =
        last.errors?.[0]?.message ?? last.error?.message ?? 'unknown failure'
      failures.push({
        project: test.projectName ?? 'default',
        title: spec.title,
        file: spec.file ?? '',
        line: spec.line ?? '',
        error: firstErr.split('\n')[0].slice(0, 240),
      })
    }
  }
  for (const child of suite.suites ?? []) walk(child)
}
for (const suite of report.suites ?? []) walk(suite)

const symbol = fail > 0 ? '❌' : flaky > 0 ? '⚠️' : '✅'
const summary =
  `${pass} passed` +
  (fail ? `, ${fail} failed` : '') +
  (flaky ? `, ${flaky} flaky` : '') +
  (skipped ? `, ${skipped} skipped` : '') +
  ` · ${duration}`

const runUrl = RUN_ID ? `${SERVER}/${REPO}/actions/runs/${RUN_ID}` : ''

const lines = [
  COMMENT_MARKER,
  `## ${symbol} Playwright E2E — ${summary}`,
  '',
]

if (failures.length) {
  lines.push('### 실패 상세')
  for (const f of failures) {
    const loc = f.file ? `\`${f.file}${f.line ? `:${f.line}` : ''}\`` : ''
    lines.push(`- **[${f.project}] ${f.title}** ${loc}`)
    lines.push(`  - ${f.error}`)
  }
  lines.push('')
  lines.push(
    '**재발 방지**: 고친 뒤 한 줄 요약을 `pipeline/E2E_PLAYBOOK.md` 에 추가해주세요.',
  )
  lines.push('')
}

if (runUrl) {
  lines.push(`CI run: ${runUrl}`)
}
lines.push(
  '스크린샷(성공·실패)·비디오·trace 는 이 워크플로우의 `playwright-report` / `playwright-test-results` 아티팩트에 있습니다.',
)

const body = lines.join('\n')

const bodyPath = join(tmpdir(), `e2e-comment-${RUN_ID ?? 'local'}.md`)
writeFileSync(bodyPath, body)

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
}

// Find an existing sticky comment with our marker.
const commentsRaw = sh(
  `gh api "repos/${REPO}/issues/${PR}/comments" --paginate`,
)
const comments = JSON.parse(commentsRaw)
const existing = comments.find(
  (c) => typeof c.body === 'string' && c.body.includes(COMMENT_MARKER),
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
