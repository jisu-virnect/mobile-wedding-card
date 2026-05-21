# Mobile Wedding Card

자율 개발 파이프라인 검증을 위한 모바일 청첩장 프로젝트.

> 본인 청첩장으로 배포하려면 [`DEPLOY.md`](./DEPLOY.md) 참고.

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
pnpm dev               # 개발 서버
pnpm dev --host        # LAN 노출 (폰에서 검수)
pnpm lint              # ESLint
pnpm typecheck         # tsc -b
pnpm test              # Vitest
pnpm e2e               # Playwright (Chromium mobile)
E2E_PORT=5180 pnpm e2e # 좀비 dev 서버가 5173 점거 중일 때 우회
pnpm lighthouse        # Lighthouse CI (mobile, categories >= 0.9)
pnpm gen-og            # 1200x630 OG image (커버 사진 + 이름 + 날짜)
pnpm resize-gallery    # public/gallery/* JPG 일괄 다운스케일
```

## Autonomous Pipeline

- 태스크 큐: `pipeline/backlog.json`
- 루프 프롬프트: `pipeline/LOOP_PROMPT.md`

Claude Code에서 `/loop`에 루프 프롬프트를 입력하면 backlog가 빌 때까지 자동으로 태스크를 소비합니다.

## Structure

```
src/
  sections/   # 8개 섹션 (Cover, Greeting, When, Where, Gallery, Rsvp, Account, Share)
  data/       # 결혼식 메타데이터 (wedding.ts)
  lib/        # 날짜·D-day·클립보드·zod 스키마 등 헬퍼
  mocks/      # MSW 핸들러 (dev only)
scripts/
  resize-gallery.mjs  # 갤러리 사진 일괄 다운스케일
  gen-og-image.mjs    # OG 이미지 자동생성 (sharp)
tests/
  unit/       # Vitest
  e2e/        # Playwright
pipeline/     # 자율 루프 큐 + 프롬프트
DEPLOY.md     # 배포 + 백엔드 wiring 가이드
```

## 개인 청첩장 배포

`preview/jisu-nanseul` 브랜치는 김지수·김난슬 개인 청첩장 (main 머지 X).
실제 배포 단계는 [`DEPLOY.md`](./DEPLOY.md) 5단계 가이드 참고:

1. 실제 데이터 채우기 (계좌번호·부모 이름)
2. RSVP 백엔드 선택 (Formspree / Vercel Edge+Resend / Supabase)
3. Vercel 배포 + 도메인
4. 손님 공유 전 최종 점검
5. 배포 후 유지보수
