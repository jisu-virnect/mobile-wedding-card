# Mobile Wedding Card

자율 개발 파이프라인 검증을 위한 모바일 청첩장 프로젝트.

## Stack

- Vite 8 + React 19 + TypeScript (strict)
- Tailwind CSS 4 (via `@tailwindcss/vite`)
- react-hook-form + zod (폼/검증)
- yet-another-react-lightbox (갤러리)
- framer-motion (섹션 애니메이션)
- MSW (RSVP API 모킹)

## Quality Gates

로컬에서 전체 관문 실행:

```bash
pnpm gates   # lint → typecheck → test → build → e2e → lighthouse
```

개별:

```bash
pnpm dev            # 개발 서버
pnpm lint           # ESLint
pnpm typecheck      # tsc -b
pnpm test           # Vitest
pnpm e2e            # Playwright (Chromium mobile)
pnpm lighthouse     # Lighthouse CI (mobile, categories >= 0.9)
```

## Autonomous Pipeline

- 태스크 큐: `pipeline/backlog.json`
- 루프 프롬프트: `pipeline/LOOP_PROMPT.md`

Claude Code에서 `/loop`에 루프 프롬프트를 입력하면 backlog가 빌 때까지 자동으로 태스크를 소비합니다.

## Structure

```
src/
  sections/   # 8개 섹션 (Cover, Greeting, When, Where, Gallery, Rsvp, Account, Share)
  data/       # 결혼식 메타데이터
  mocks/      # MSW 핸들러
tests/
  unit/       # Vitest
  e2e/        # Playwright
pipeline/     # 자율 루프 큐 + 프롬프트
```
