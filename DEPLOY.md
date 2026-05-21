# 프로덕션 배포 + 백엔드 wiring 가이드

이 문서는 현재 청첩장을 손님에게 공유 가능한 상태로 만드는 5단계 절차입니다.
대략 30분~1시간이면 끝납니다. 백엔드 옵션은 3가지 중 본인 취향대로.

---

## 0. 현재 상태 점검

- ✅ UI/UX: 8섹션 + 슬라이드쇼 커버 + 6장 계좌 카드 + RSVP 폼 완성
- ✅ OG 이미지: `/og-image.jpg` 생성 완료 (카카오톡 미리보기)
- ✅ Lighthouse 모바일 점수: Perf 0.91 / A11y 1.0 / BP 1.0 / SEO 1.0
- ⚠️ **RSVP 백엔드 미연결**: `POST /api/rsvp` 호출이 어디로도 가지 않음
- ⚠️ **계좌번호 placeholder**: `110-000-000000` / `000-000-000000` 가짜값

---

## 1. 실제 데이터 채우기 (5분)

`src/data/wedding.ts` 에서 본인 정보로 교체:

```ts
groom: {
  name: '김지수',           // ← 본인 이름 (이미 OK)
  father: '김창길',          // ← 아버지 성함
  mother: '김영미',          // ← 어머니 성함
  account: { bank: '신한은행', number: '실제계좌번호', holder: '김지수' },
  fatherAccount: { bank: '신한은행', number: '...', holder: '김창길' },
  motherAccount: { bank: '신한은행', number: '...', holder: '김영미' },
},
bride: { ... },
```

부모 계좌가 안 받고 싶으면 `fatherAccount`/`motherAccount` 키 자체를 **삭제**.
카드 자체가 안 보입니다.

수정 후 OG 이미지 재생성:
```bash
pnpm gen-og
```

---

## 2. RSVP 백엔드 선택 + 연결 (15~30분)

### 옵션 비교

| 옵션 | 셋업 비용 | 월 한도 | 데이터 보는 곳 | 알림 | 추천 상황 |
|---|---|---|---|---|---|
| **A. Formspree** | 5분 | 50건 | Formspree 대시보드 + 이메일 | 즉시 이메일 | 손쉽게 끝내고 싶음 |
| **B. Vercel Edge + Resend** | 20분 | 100건/일 (Resend) | 이메일 only | 즉시 이메일 | 도메인 이메일 가능, 코드 통제 원함 |
| **C. Supabase** | 30분 | 50k MAU | Supabase 테이블 + Studio | 별도 연동 필요 | 방명록까지 같이 만들 예정 |

### A. Formspree (가장 빠름)

1. <https://formspree.io> 무료 가입
2. New Form → 양식 endpoint URL 복사 (예: `https://formspree.io/f/xyzabc12`)
3. `.env.local` 생성:
   ```
   VITE_RSVP_ENDPOINT=https://formspree.io/f/xyzabc12
   ```
4. `src/sections/Rsvp.tsx` 의 `postRsvp` 한 줄만 변경:
   ```ts
   const res = await fetch(
     import.meta.env.VITE_RSVP_ENDPOINT || '/api/rsvp',
     { ... }
   )
   ```
5. Vercel 환경변수에도 동일하게 `VITE_RSVP_ENDPOINT` 추가
6. 끝. 손님이 폼 제출하면 본인 이메일로 알림 + Formspree 대시보드에 누적

### B. Vercel Edge + Resend (코드 통제)

1. <https://resend.com> 가입 → API key 발급 (`re_...`)
2. `api/rsvp.ts` 생성 (Vercel Edge Function):
   ```ts
   import { Resend } from 'resend'
   const resend = new Resend(process.env.RESEND_API_KEY!)

   export const config = { runtime: 'edge' }
   export default async function handler(req: Request) {
     if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
     const body = await req.json()
     await resend.emails.send({
       from: 'rsvp@본인도메인.com',           // 또는 onboarding@resend.dev (테스트용)
       to: '본인이메일@gmail.com',
       subject: `RSVP: ${body.name} (${body.attending ? '참석' : '불참'})`,
       text: JSON.stringify(body, null, 2),
     })
     return Response.json({ ok: true }, { status: 201 })
   }
   ```
3. `pnpm add resend` (의존성 추가)
4. Vercel 환경변수에 `RESEND_API_KEY` 추가
5. 배포하면 `/api/rsvp` 가 Edge Function 으로 동작

### C. Supabase (방명록도 같이)

방명록 태스크 (T17/T18) 에서 어차피 셋업합니다. 이 옵션은 그 때 같이 처리.
지금은 A 또는 B 로 두고, 방명록 만들 때 Supabase 로 마이그레이션해도 OK.

---

## 3. Vercel 배포 (10~15분)

### 첫 배포

1. 본 레포가 GitHub 에 푸시되어 있어야 함:
   ```bash
   git push -u origin preview/jisu-nanseul
   ```
2. <https://vercel.com> 가입 + GitHub 연동
3. Import Project → `jisu-virnect/mobile-wedding-card` 선택
4. Branch: **preview/jisu-nanseul** 로 설정 (main 이 아님!)
5. Framework Preset: Vite (자동 감지)
6. Environment Variables 에 1단계에서 만든 값들 추가
7. Deploy 클릭

3~5분 뒤 `https://<프로젝트명>.vercel.app` 으로 접속 가능.

### 도메인 옵션

| 옵션 | 비용 | 장점 | 단점 |
|---|---|---|---|
| **Vercel 서브도메인** | 0원 | 즉시, 셋업 없음 | URL 좀 길고 잘 안 외워짐 |
| **커스텀 도메인** (예: jisu-wedding.com) | 1~3만원/년 | 짧고 기억하기 좋음, 신뢰감 | 가비아/네임칩 등에서 구입 후 DNS 설정 |

추천: **무료 vercel.app 으로 일단 가고, 청첩장 인쇄 임박할 때만 커스텀 도메인**.

### 커스텀 도메인 셋업 (선택)

1. 가비아/네임칩에서 도메인 구입
2. Vercel Project Settings → Domains → Add Domain
3. 가비아 DNS 에 Vercel 에서 제시한 A 레코드 / CNAME 추가
4. 5~10분 후 자동으로 SSL 까지 발급됨

---

## 4. 손님 공유 전 최종 점검 (5분)

체크리스트:

- [ ] 본인 폰에서 배포된 URL 직접 접속해서 처음부터 끝까지 스크롤
- [ ] 커버 슬라이드쇼 3장이 잘 흐르는지
- [ ] 캘린더의 11/28 토요일이 강조되는지
- [ ] 카카오맵·네이버맵 버튼이 실제 위치 열어주는지
- [ ] 갤러리 썸네일 → 라이트박스 정상 동작
- [ ] RSVP 폼 제출 → **실제로** 이메일/대시보드에 도착하는지 (가장 중요)
- [ ] 계좌번호 복사 버튼 → 클립보드에 정상 복사
- [ ] 공유 버튼 → 카카오톡으로 보내봤을 때 **OG 이미지 미리보기 카드**가 나오는지
- [ ] 친한 친구 1명에게 미리 보내서 1번부터 다시 검수

---

## 5. 배포 후 유지보수

- 사진 추가/교체: `public/gallery/` 에 새 사진 + `pnpm run resize-gallery` 재실행
- 데이터 수정: `src/data/wedding.ts` 편집 → git push → Vercel 자동 재배포
- OG 이미지 재생성: 커버나 이름 바뀌면 `pnpm gen-og` 후 push
- 슬라이드쇼 사진 교체: `src/data/wedding.ts` 의 `cover.slides` 배열

---

## 자주 묻는 질문

**Q. 손님이 카톡에 링크 붙였는데 미리보기가 안 떠요**
A. 카카오톡은 한 번 캐시한 미리보기를 며칠 유지합니다. 카카오톡 공식
   링크 디버거 (`https://developers.kakao.com/tool/clear/og`) 에 URL
   넣고 캐시 비워주세요.

**Q. RSVP 응답이 안 와요**
A. 옵션 A/B 에서 환경변수 누락이 가장 흔합니다. Vercel 대시보드
   → Project Settings → Environment Variables 확인. 변경했으면
   재배포 필요 (Deployments → Redeploy).

**Q. 배포 후 변경사항이 반영 안 돼요**
A. 브라우저 캐시. 시크릿 창에서 다시 열어보세요. 그래도 안 되면 Vercel
   Deployments 페이지에서 가장 최근 배포의 빌드 로그 확인.

**Q. 결혼식 끝나고 링크 내리고 싶어요**
A. Vercel Dashboard → Project → Settings → General → Delete Project.
   또는 그냥 두고 결혼 기념일에 다시 보기.
