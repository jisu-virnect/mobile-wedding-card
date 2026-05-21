# 핸드오프 — 2026-05-21 야간 자율 작업 요약

이 문서는 본인이 깨면 5분 안에 작업 상태를 파악할 수 있도록 정리한 것입니다.

## 이번 세션에 들어간 커밋 7개

```
f56d2ec docs(deploy): add DEPLOY.md + register helper scripts
14e446a preview(og): auto-generated 1200x630 OG image for KakaoTalk
b8cb358 preview(account): support up to 6 cards (couple + both sides' parents)
7bbdb00 preview(rsvp): copy/UX overhaul + transparency note + optional side
d7a92df preview(cover): tap left/right to flip slides + clickable pagination dots
29ef566 preview(design): cover slideshow + account always-open cards
cf501ce preview(design): Tier 1 elevation — typography, palette, cover, rhythm, tone
+ (이번 커밋) preview(dday): live counter + final-day countdown
```

모두 `preview/jisu-nanseul` 브랜치에 있고, 푸시는 하지 않았습니다.

## 사용자 피드백 반영 현황

| 피드백 | 처리 |
|---|---|
| "소속" 단어 애매하다 | ✅ "어느 쪽 손님이신가요? (선택)" |
| 신랑측 미리 체크되어 있다 | ✅ 둘 다 미선택 + side optional |
| "SEND" 영문 어색 | ✅ "전달하기" / "전달 중…" |
| 어디로 가는지 모르겠다 | ✅ "신랑·신부에게만 안내됩니다" 문구 + [`DEPLOY.md`](./DEPLOY.md) 백엔드 3옵션 |
| 마음전하실곳 아코디언 별로 | ✅ 항상 펼친 카드 (앞 커밋) |
| 슬라이드쇼 추가 | ✅ 3장 크로스페이드 + Ken Burns (앞 커밋) |
| 슬라이드 좌/우 클릭 | ✅ 탭 존 + 페이지네이션 점 (앞 커밋) |

## 새로 추가된 기능 / 자산

1. **양가 부모 계좌** — `Person.fatherAccount`, `motherAccount` 슬롯 추가. Account 섹션이 최대 6장 카드 자동 렌더 (`본인 → 아버지 → 어머니` 순)
2. **OG 이미지 자동생성** — `pnpm gen-og`. 1200×630 JPEG, 커버 사진 + 이름 + 날짜 + 장소. 카카오톡 미리보기 카드용
3. **D-Day 라이브 카운터** — `useLiveDDay` 훅으로 1분 주기 자동 갱신. 결혼식 24시간 이내가 되면 "12시간 32분 남았어요" 자동 추가 (서브 텍스트)
4. **DEPLOY.md** — 본인이 직접 배포할 때 따라가는 5단계 가이드 (백엔드 3옵션 비교 포함)
5. **playwright.config 의 `E2E_PORT`** — 좀비 dev 서버가 5173 점거 중일 때 `E2E_PORT=5180 pnpm e2e` 로 우회
6. **E2E_PLAYBOOK 케이스 2개 추가** — #9 (백그라운드 dev 서버 + MSW), #10 (jsdom 첫 라디오 클릭 누락)

## 다음 본인이 해야 할 일 (우선순위 순)

### 🔴 P0 — 손님 공유 직전 필수 (총 30~60분)

1. **계좌번호 실제 값으로 교체** (`src/data/wedding.ts`)
   - groom/bride/groom.fatherAccount/groom.motherAccount/bride.fatherAccount/bride.motherAccount
   - 안 받을 부모 계좌는 키 자체 삭제 → 카드 자체가 안 보임
   - 수정 후 `pnpm gen-og` 재실행 (이름이나 날짜 바꿨을 때)

2. **RSVP 백엔드 1개 선택 + 연결** (`DEPLOY.md` 2번 섹션)
   - 추천: **Formspree** (5분 셋업, 무료 50건/월)
   - 환경변수 1개만 추가하면 끝

3. **Vercel 배포** (`DEPLOY.md` 3번 섹션)
   - `git push -u origin preview/jisu-nanseul` (현재 미푸시)
   - vercel.com 가입 + 레포 import + 배포 브랜치 = `preview/jisu-nanseul`
   - 무료 `*.vercel.app` 서브도메인부터 OK

### 🟡 P1 — 배포 후 다듬기 (옵션)

4. **방명록 추가** — T17 (Supabase 셋업 + 기본) + T18 (PIN 삭제 · 어드민 · 레이트리밋). 총 ~12시간 분량. 필요하면 자율 루프로 진행 가능
5. **커스텀 도메인** — `jisu-wedding.com` 같은 도메인 구입 후 Vercel 연결 (`DEPLOY.md` 3번)
6. **사진 톤 추가 보정** — Lightroom 등으로 한 번 더 통일하고 싶으면 (현재는 CSS filter 로 가벼운 통일)
7. **커버 슬라이드 사진 교체** — 현재 1, 12, 23번이 기본. 본인 마음에 드는 3장 골라서 `wedding.ts > cover.slides` 의 src 변경

### 🟢 P2 — 와우 포인트 (여유 있으면)

8. **인트로 페이드** (와우 #1) — 페이지 로드 시 아이보리 풀스크린 1.2초 페이드아웃
9. **결혼식 당일 모드** (와우 #3) — 11/28 KST 00시~23시 사이 자동 활성화, "오늘입니다" 라벨
10. **첫 방문 환영 토스트** (와우 #4) — 첫 접속 시 봉투 아이콘 + "초대장이 도착했어요"

## 현재 게이트 상태

| 게이트 | 결과 |
|---|---|
| Lint | ✅ |
| Typecheck | ✅ |
| Vitest unit | ✅ 62/62 |
| Playwright E2E | ✅ 34/34 (iPhone + Galaxy 양쪽) |
| Lighthouse Mobile | ✅ Perf 0.91 · A11y 1.0 · BP 1.0 · SEO 1.0 |

## 자주 확인할 명령어

```bash
pnpm dev --host       # 폰 검수
pnpm gen-og           # 데이터 바꿨을 때 OG 이미지 재생성
pnpm gates            # 풀 게이트
E2E_PORT=5180 pnpm e2e  # 좀비 서버 우회
git log --oneline -10 # 최근 변경 보기
```

## 알려진 사소한 이슈

- `pnpm e2e` 가 가끔 keyboard / RSVP 테스트에서 좀비 dev 서버 (포트 5173) 때문에 실패함. `E2E_PORT=5180 pnpm e2e` 로 우회 또는 백그라운드 dev 서버 종료.
- 현재 노드 좀비 프로세스 일부가 시스템에 남아있을 수 있음 (이번 세션 dev 서버들). 재부팅 한 번이면 깔끔.
- 갤러리 사진 톤은 CSS filter (`saturate 0.9`) 로만 통일됨. 강하게 가고 싶으면 `src/index.css` 의 `.photo-tone` 수정.

수고하셨어요. 깨어나서 천천히 보시고 다음 단계 알려주세요.
