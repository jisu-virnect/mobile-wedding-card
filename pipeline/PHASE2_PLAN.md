# Phase 2 플랜 — SaaS 전환 · 런칭 준비

> 상태: **승인 대기 중** (사용자 검토 후 backlog.json + 이슈 생성 진행)
> 작성 근거: 대화 누적 결정 스냅샷. 이후 모든 결정 번복은 이 문서 갱신으로 추적.

## 1. 확정된 제품 결정 (잠금)

| # | 항목 | 결정 |
|---|---|---|
| 1 | 제품 성격 | **판매 가능한 SaaS** — 커플이 직접 가입하여 자기 청첩장 편집 |
| 2 | 편집 주체 | 커플 본인 (가입 → 대시보드 → 에디터) |
| 3 | 과금 모델 | **무료** 로 시작, 검증 후 **₩9,900 단발 결제** |
| 4 | 7일 게이트 방식 | **편집은 평생 무료, 공개 링크만 7일 평가판 → 유료 결제 시 식후 30일까지 유지** |
| 5 | 결제 채널 | **네이버 스마트스토어 단일** (주문 → 관리자 수동 키 발급 → 사용자 키 입력) |
| 6 | 디자인 | **기존 Vite 템플릿 폐기**, v0.dev 로 **3종 새로 제작** |
| 7 | 블록화 UX | **각 섹션 블록화** (Cover / Greeting / Parents / When / Where / Gallery / RSVP / Account / Share / Custom Text / Custom Image / Spacer), 드래그·추가·삭제 가능한 에디터가 **0순위** |
| 8 | 바이럴 장치 | **무료 사용자 청첩장 하단 크레딧 배너 필수**, 유료 결제 시 제거 |
| 9 | 갤러리 기능 | 오토 슬라이드(가운데 줌·무한 루프)·그리드 토글·라이트박스·핀치 줌·더블탭 확대취소 |
| 10 | 광고 예산 | 초기 3개월 월 **₩50,000** (성과 확인 후 조정) |
| 11 | 콘텐츠 전략 | **AI 초안 + 사람 리뷰** |
| 12 | Phase 4 수평확장 PoC | **MVP 이후 결정** |
| 13 | 서비스명·브랜드 | 추후 확정 (도메인 구매 전) |

## 2. 스택 결정

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | **Next.js 15 App Router + TypeScript** | v0.dev 네이티브, 라우팅·서버 컴포넌트·Vercel 풀스택 기능 모두 활용 |
| 스타일/UI | Tailwind + **shadcn/ui** | v0 출력과 호환, 접근성 기본기 탄탄 |
| 인증 | **Clerk** | 한국어 지원, 카카오 로그인 연동 가능, MAU 10k 까지 무료, 세션/CSRF/2FA 자동 |
| DB · Storage · RLS | **Supabase** (Postgres + Storage + Row Level Security) | 한 플랫폼에서 데이터·이미지·권한 통합, Free → Pro($25/월) 매끈한 승급 |
| 배포 | Vercel (현재 그대로) | Next.js 네이티브, 프리뷰 자동 |
| 분석 | **PostHog** | 제품 퍼널 분석·이벤트 무료 1M/월 |
| 디자인 도구 | **v0.dev** | 템플릿 3종 초안 뽑은 뒤 수동 포팅 |
| 결제 | **스마트스토어 외부 구매 + 수동 키** | 접근성·친숙도 우선 (추후 토스페이먼츠 병행 가능) |

## 3. 레포 전략

- **in-place 리라이트**: 이 레포(`mobile-wedding-card`)를 그대로 쓰고 Vite 쪽은 점진 철거.
- **자동화 인프라는 모두 보존**: `pipeline/` (backlog/progress/playbook/loop prompt), `.github/workflows/` (CI, Lighthouse preview), `.github/scripts/` (E2E/Lighthouse 요약 스크립트), E2E 테스트 러너, sticky PR 코멘트.
- 과거 Vite 기반 섹션 코드는 **한 번의 chore 커밋으로 정리 삭제** (git history 에 남으므로 복원 가능).
- 과거 메모리·플레이북 (`.claude/memory/*`, `pipeline/E2E_PLAYBOOK.md`) 은 그대로 누적.

## 4. 데이터 모델 초안

```sql
-- users: Clerk 이 소유. 내부적으로는 clerk_id 를 참조키로 가짐.

create table invitations (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,                -- "/c/:slug"
  owner_clerk_id  text not null,
  theme           text not null default 'theme-a',     -- 'theme-a' | 'theme-b' | 'theme-c'
  data            jsonb not null default '{}'::jsonb,  -- 블록 배열 + 메타
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  public_until    timestamptz not null default now() + interval '7 days',
  paid_until      timestamptz,                         -- 결제 시 식후 +30일로 세팅
  wedding_at      timestamptz
);

create index invitations_owner_idx on invitations (owner_clerk_id);
create index invitations_slug_idx on invitations (slug);

create table invitation_images (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid references invitations(id) on delete cascade,
  storage_path   text not null,
  display_order  int not null,
  created_at     timestamptz not null default now()
);

create table redemption_keys (
  id             uuid primary key default gen_random_uuid(),
  key_hash       text unique not null,                 -- bcrypt 해시
  issued_by      text not null,                        -- 관리자 Clerk id
  note           text,                                 -- 스마트스토어 주문번호 등
  redeemed_by    text,                                 -- 사용자 Clerk id
  redeemed_at    timestamptz,
  invitation_id  uuid references invitations(id),
  created_at     timestamptz not null default now()
);

-- RLS 정책 (필수, E2E 로 검증)
alter table invitations enable row level security;
create policy "owner reads self"       on invitations for select using (owner_clerk_id = auth.jwt() ->> 'sub');
create policy "public reads published" on invitations for select using (public_until > now() or paid_until > now());
create policy "owner writes self"      on invitations for all    using (owner_clerk_id = auth.jwt() ->> 'sub');
```

### 블록 JSON 스키마

```ts
type BlockType =
  | 'cover' | 'greeting' | 'parents' | 'when' | 'where'
  | 'gallery' | 'rsvp' | 'account' | 'share'
  | 'custom-text' | 'custom-image' | 'spacer'

interface Block {
  id: string           // uuid
  type: BlockType
  required?: boolean   // cover 등 필수 블록은 삭제 불가
  config: Record<string, unknown>
}

interface InvitationData {
  blocks: Block[]      // 순서 있음
  theme: 'theme-a' | 'theme-b' | 'theme-c'
  meta: {
    groomName: string
    brideName: string
    weddingAt: string
    ogImageOverride?: string
  }
}
```

## 5. 보안 원칙 (처음부터 적용)

1. **Supabase RLS 정책 필수** — `auth.uid()` 기반 테넌트 격리. Phase 2.1 에서 **타인 청첩장 수정 불가** E2E 로 반드시 검증.
2. **계좌번호 app-level 암호화** — `pgcrypto` 로 컬럼 암호화. DB 덤프 유출 시에도 방어.
3. **개인정보처리방침·이용약관** — 가입 시 동의 체크박스 필수 (Phase 2.6).
4. **XSS 방지** — `dangerouslySetInnerHTML` 금지. URL 입력은 프로토콜 화이트리스트.
5. **이미지 업로드 검증** — MIME + 확장자 이중 확인, 디코딩 시도 후 썸네일 생성.
6. **슬러그 충돌 방지** — 짧은 슬러그에 랜덤 4자 접미사 강제 (`/c/jisu-a3x9`).
7. **레이트 제한** — 계정당 청첩장 3개, 이미지 업로드 20MB 상한.
8. **결제 키** — UUIDv4 이상 랜덤, 1회 사용, 관리자 전용 발급 페이지.
9. **백업** — Free 플랜 기간 주 1회 수동 덤프 저장.

## 6. Phase 2 태스크 분할 (T17~T33, 총 17건)

### 2.0 스택 전환 — 3 tasks, 2~3일

| ID | 제목 | 핵심 산출물 |
|---|---|---|
| T17 | Next.js 15 + shadcn/ui 스캐폴드 | `app/` 라우트, Tailwind v4, shadcn 초기 컴포넌트 |
| T18 | Clerk + Supabase 클라이언트 연결 | `.env.local` 구조, 미들웨어로 보호 라우트, Supabase RLS JWT 연결 |
| T19 | CI·배포·E2E 업데이트 | Next.js preview/build, playwright 설정 변경, Lighthouse preview 유지 |

### 2.1 멀티테넌트 뼈대 — 3 tasks, 3~4일

| T20 | DB 마이그레이션 + RLS 정책 + 타인 격리 E2E | `supabase/migrations/*`, RLS 테스트 |
| T21 | `/c/:slug` 퍼블릭 뷰 (기본 테마 렌더) | 블록 배열 → 컴포넌트 트리 |
| T22 | `/dashboard` + `/edit/:slug` 라우트 뼈대 | 로그인 후 본인 청첩장 목록, "새 청첩장" 버튼 |

### 2.2 블록 에디터 MVP — 3 tasks, 5~7일

| T23 | 블록 타입 12종 정의 + 렌더러 | `blocks/*.tsx`, 각 블록 config 타입 |
| T24 | DnD 에디터 (추가·삭제·순서변경) | `@dnd-kit/sortable`, 필수 블록 보호 |
| T25 | 필드별 설정 폼 + 실시간 프리뷰 | 좌측 폼·우측 모바일 프레임, rhf + zod |

### 2.3 이미지 + 갤러리 폴리시 — 2 tasks, 4~5일

| T26 | Supabase Storage 업로드 + 리사이즈 + 썸네일 | 최대 20장, 1600px 다운스케일, MIME 검증 |
| T27 | 고퀄 갤러리 컴포넌트 | 오토 슬라이드(3.5초)·가운데 1.08 줌·무한 루프·스와이프 pause·그리드 토글·라이트박스 |

### 2.4 디자인 3종 — 2 tasks, 4~6일

| T28 | v0.dev 템플릿 3종 추출 + `themes/` 구현 | "미니멀 아이보리" · "로맨틱 로즈" · "모던 블랙" 등 |
| T29 | 테마 전환 UI (에디터에서 선택 → 실시간 반영) | theme 필드 동기화 |

### 2.5 7일 게이트 + 결제 — 2 tasks, 2~3일

| T30 | 공개링크 만료 로직 + 상태 표시 | `/c/:slug` 만료 시 잠금 화면, 대시보드 상태 뱃지 |
| T31 | 관리자 키 발급 페이지 + 사용자 키 입력 UI | `/admin` (role 기반), 키 redemption 플로우 |

### 2.6 런칭 준비 — 2 tasks, 2~3일

| T32 | 랜딩 3페이지 + SEO 메타 + OG 이미지 자동생성 | `/`, `/templates`, `/pricing` + `@vercel/og` |
| T33 | 이용약관 · 개인정보처리방침 · 쿠키 배너 + 가입동의 체크박스 | 법적 MVP 수준 |

**합계 17 태스크 · 풀타임 예상 25~36일 · 자율 루프로 ≈ 4~5주**

### MVP 체크포인트 (중간 릴리스 기준)

- **T17~T22 + T23~T25 축소판 완료 시점 (≈ 2주차)** 에서 **"가입 → 새 청첩장 → 기본 편집 → 프리뷰 공유"** 가능. 지인 몇 명에게 체험 요청 가능한 상태.
- 전체 17 태스크 완료 시점 (≈ 5주차) 이 **정식 MVP** — 디자인 3종 · 유료 결제 · 런칭 페이지 모두 가동.

## 7. 종료 시점 트리거 (Phase 3 자동 제안)

`pipeline/backlog.json.tasks` 가 비면 자율 루프는 `"BACKLOG EMPTY. STOPPING."` 로 종료. 그 뒤 **사용자와의 다음 대화에서**, 저는:

1. Phase 2 산출물 요약 (머지된 PR, 실제 지표, 겪은 실패 패턴)
2. Phase 3 초안 제시 — 이때 이미 알고 있는 마케팅·바이럴·분석 계획을 **Phase 2 실제 결과 반영** 해서 업데이트 (예: Phase 2 중 발견된 블로커나 UX 이슈가 있으면 Phase 3 에 반영)
3. 사용자 피드백 받고 → `pipeline/PHASE3_PLAN.md` 작성 → 이슈 생성 → 루프 재시작

## 8. Phase 3 브리프 (약속, 미확정)

현재 시점에서 Phase 3 스코프 후보:

- 3.0 다중 페이지 랜딩 확장 (/templates/[slug], /examples, /blog)
- 3.1 PostHog 연동 + 전환 퍼널 5스텝 계측
- 3.2 바이럴 크레딧 배너 + 공유 URL 파라미터 트래킹
- 3.3 블로그 구조 (MDX) + 초기 SEO 콘텐츠 10편 (AI 초안 + 리뷰)
- 3.4 광고 랜딩 A/B + 쿠폰코드 시스템
- 3.5 스마트스토어 상세페이지 (카피·이미지 5종) + 연동

Phase 2 끝난 시점에 실제 사용자 행동 데이터를 보고 재분배.

## 9. Phase 4 브리프 (더 먼 약속)

- Supabase Pro 전환 + 이미지 CDN 이관
- 제품 수평 확장 PoC 1건 (대화에서 구체화)
- B2B 화이트라벨 뼈대 (예식장·웨딩플래너용)
- 관리자 내부 대시보드 고도화

## 10. 리스크 · 가정

| 리스크 | 확률 | 영향 | 대응 |
|---|---|---|---|
| v0 디자인 3종이 한 번에 안 나옴 | 중 | 중 | T28 에 버퍼 1주, 프롬프트 3~5회 튠 |
| Clerk 한국 사용자 결제 연동 마찰 | 저 | 저 | 결제는 외부 스마트스토어이므로 Clerk 영향 없음 |
| Supabase Free 용량 부족 | 저 (초기) | 중 | 런칭 시 Pro 전환, 업로드 리사이즈 필수 |
| RLS 정책 누락으로 테넌트 격리 실패 | 치명 | 치명 | T20 에서 E2E 로 반드시 검증, PR 템플릿 체크리스트 |
| 스마트스토어 판매자 등록 지연 | 중 | 중 | MVP 기간은 "베타" 라벨 + 주변 지인 중심 테스트 |
| Vercel Deployment Protection 유지 | 확정 | 저 | Lighthouse-on-preview workflow 는 해당 시 안내만 포스팅 (이미 구현) |

## 11. 결정·승인 필요

이 문서 승인 후 아래 순서로 진행합니다:

1. 이 파일을 repo 에 커밋 (기록 남김).
2. `pipeline/backlog.json` 을 T17~T33 으로 교체 (기존 T05~T16 은 `done` 유지).
3. GitHub 이슈 17건 생성 (T17~T33 → #13~#29, 기존 #1~#12 는 closed 상태 유지).
4. `pipeline/LOOP_PROMPT.md` 필요 시 보정 (블록·테마 관련 규약 추가).
5. `/loop` 로 자율 루프 재시작 → T17 부터.

---

_Last updated: 2026-04-21 — Phase 2 계획 초안_
