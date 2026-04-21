# E2E / 테스트 실패 플레이북

이 문서는 **한 번 겪어본 테스트 실패**와 그 재발 방지책을 짧게 누적합니다. 새 테스트를 쓰거나 실패 로그를 볼 때 **가장 먼저** 이 파일을 훑어 동일 함정을 반복하지 않도록 합니다.

## 1. Node small-ICU 런타임에서 ko-KR dayPeriod 가 "AM/PM" 으로 출력됨

- **어디서 터졌나**: T05 `formatWeddingTime` 단위 테스트. 로컬(Windows, full-ICU)에서는 "오전 11:00", GitHub Actions ubuntu-latest 에서는 "AM 11:00".
- **근본 원인**: GitHub Actions 의 Node 이미지는 small-ICU 로 빌드되어 `Intl.DateTimeFormat('ko-KR', { hour12: true })` 의 `dayPeriod` 가 ko 로케일 데이터를 못 찾고 영문 fallback.
- **고정 방법**: `ko-KR` 로 포맷하지 말고 `en-US` + `formatToParts` 로 `dayPeriod` 를 뽑아 "오전/오후" 로 직접 매핑. 날짜/요일은 `ko-KR` + `weekday: 'long'` 이 small-ICU 에서도 잘 동작해 그대로 유지.
- **체크리스트 (새 한국어 시간 포맷 추가 시)**: `Intl.DateTimeFormat('ko-KR', { hour12: true })` 쓰지 않기.

## 2. jsdom 29 의 `navigator.clipboard` 는 getter-only 라 덮어쓰기가 터짐

- **어디서 터졌나**: T11 `Account.test.tsx` `beforeEach` 에서 `Object.assign(navigator, { clipboard: ... })` → `TypeError: Cannot set property clipboard of #<Navigator> which has only a getter`.
- **근본 원인**: jsdom 29 부터 네이티브 `navigator.clipboard` 게터가 내장되어 있어 `Object.assign` 이 set 을 거부함.
- **고정 방법**: `Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true, writable: true })` 로 재정의.
- **부가 이슈**: 일부 비동기 복사 플로우에서 `userEvent.click` 이 `React 상태 업데이트 + 비동기 clipboard Promise` 타이밍을 맞추지 못해 `writeText` 호출이 안 기록될 때가 있음. 그 경우 `fireEvent.click` + `await act()` 로 우회.

## 3. jsdom 은 `IntersectionObserver` 미구현 → framer-motion `whileInView` 가 영원히 initial 상태

- **어디서 터졌나**: T13 에서 `whileInView` 도입 예정이었는데, jsdom 에서 콘텐츠가 `opacity: 0` 으로 머물러 query 는 DOM 에 있어도 framer-motion 측 계산이 멈춤.
- **고정 방법**: `tests/unit/setup.ts` 에 동기적으로 fully-intersecting 을 emit 하는 Mock `IntersectionObserver` 폴리필 설치.
- **체크리스트 (새 `whileInView`/`useInView` 사용 시)**: 유닛 테스트에서 감춤이 풀려야 할 때 setup 이 폴리필을 로드하는지 확인.

## 4. Playwright Chromium 에서 Clipboard 읽기 는 권한 필요

- **어디서 터졌나**: T08, T11 의 클립보드 복사 검증 E2E.
- **고정 방법**: `await context.grantPermissions(['clipboard-read', 'clipboard-write'])` 를 `page.goto` 전에 호출. 또한 `browserName !== 'chromium'` 이면 `test.skip` 으로 비-Chromium 엔진 보호 (현재는 모두 chromium 이지만 안전장치).

## 5. ESLint `react-hooks/set-state-in-effect` — "마운트 시 1회 감지" 는 useState 의 lazy initializer 로

- **어디서 터졌나**: T12 `Share.tsx` 에서 `useEffect(() => setSupported(hasWebShare()), [])` 가 lint 에 걸림.
- **고정 방법**: `const [supported] = useState(hasWebShare)` (게으른 초기자). 효과 제거.

## 6b. Playwright `screenshot: 'on'` + 높은 로컬 병렬성 = RSVP/Account/Greeting 플레이크

- **어디서 터졌나**: PR #24 이후 로컬 `pnpm e2e` 가 워커 ~8개로 돌 때, 스크린샷 캡처 타이밍이 겹쳐 `click → await expect(status).toHaveText(…)` 류가 간헐적으로 실패. 재실행시 다른 조합이 실패.
- **고정 방법**: `playwright.config.ts` 에서 `workers: process.env.CI ? 1 : 4` 로 로컬 병렬성 상한을 4로 제한. CI 는 이미 `workers: 1` 이라 무관. 격리 실행(`--workers=1`) 또는 `pnpm exec playwright test <file>` 는 항상 통과.
- **체크리스트**: 로컬에서 E2E 가 간헐 실패하면 먼저 워커 수부터 낮춰볼 것. 코드 버그가 아닐 가능성 큼.

## 6. `getByText(predicate)` 가 복수 매칭 → 조상 요소까지 같이 걸림

- **어디서 터졌나**: T06 `Greeting.test.tsx` 에서 본문 인용구를 predicate 로 찾다가 `<p>`, `<div>`, `<section>` 이 모두 매칭.
- **고정 방법**: 특정 클래스나 역할로 좁히는 쿼리 사용. 예: `container.querySelector('p.whitespace-pre-line')`.

---

## 작성 규칙

- **짧게.** 1 케이스 당 5-10 줄 이내.
- 새 실패를 만나면 **고치고 나서** 이 파일에 바로 한 줄 추가. (LOOP_PROMPT 의 자가 수정 단계에서 반영)
- 항목 순서는 겪은 시간 역순이 아니라 **주제별** (런타임/DOM/테스트 러너/CI) 로 자연 누적.
- 성공 스크린샷은 `playwright-report/` 와 `test-results/` 의 artifact 로 자동 업로드되므로 이 문서에 인라인하지 않음.
