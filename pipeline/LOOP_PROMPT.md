# Autonomous Development Loop — Mobile Wedding Card

이 문서는 자율 파이프라인의 **루프 프롬프트**입니다. Claude Code의 `/loop` 자가 페이싱 모드에서
아래 내용을 그대로 입력해 반복 실행합니다.

## 루프 프롬프트 (그대로 사용)

```
모바일 청첩장 프로젝트의 자율 개발 루프를 한 이터레이션 실행한다.

작업 경로: C:\Users\VIRNECT\projects\mobile-wedding-card

규칙:
1. pipeline/backlog.json의 `tasks` 배열에서 맨 앞 태스크를 하나 꺼낸다.
   - 비어있으면 "BACKLOG EMPTY. STOPPING."을 출력하고 루프를 종료한다 (ScheduleWakeup 호출하지 않음).
2. 꺼낸 태스크의 goal과 acceptance 기준에 따라 구현한다.
   - 큰 변경은 general-purpose 서브에이전트에 위임해도 된다.
   - 새 단위 테스트/E2E 테스트가 필요하면 함께 작성한다.
3. 관문 실행: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm e2e && pnpm lighthouse`
4. 실패 시 진단하고 자가 수정. 같은 태스크에서 최대 3번까지 시도.
   - 3번 초과 시: 태스크를 backlog에서 제거하고 pipeline/backlog.json의 `failed` 배열에 이유와 함께 이동. 실패 보고 출력 후 루프 종료.
5. 관문 모두 통과 시:
   - 파일을 `git add`하고 Conventional Commits 형식으로 커밋한다.
     예: `feat(cover): implement cover section with date formatting (T05)`
   - 태스크를 `tasks`에서 제거하고 `done` 배열로 이동한다.
   - pipeline/backlog.json을 갱신 커밋한다.
   - `git push origin main` (push 실패해도 다음 이터레이션은 계속 진행, 로컬 커밋 유지).
6. 다음 이터레이션 예약. 활발한 작업이 진행 중이었으면 60-120초, 아니면 그대로 계속.

중요:
- 커밋 하나에 여러 태스크를 묶지 말 것 (태스크당 1커밋).
- 테스트/관문을 건너뛰지 말 것. `--no-verify` 금지.
- 기존 테스트를 비활성화해서 관문을 통과시키는 건 실패로 간주.
- 사람이 검토할 수 있게 각 이터레이션 시작/종료에 간단한 진행 상황을 출력할 것.
```

## 실행 방법

```
/loop <위 프롬프트>
```

간격을 지정하지 않았으므로 Claude가 자가 페이싱으로 다음 이터레이션을 예약합니다.

## 중단 조건

- `pipeline/backlog.json`의 `tasks`가 비면 자동 종료.
- 단일 태스크 3회 연속 실패 → `failed`로 이동 후 종료.
- 사용자 수동 중지 (Ctrl+C, 대화창에서 중단 요청).

## 관찰 포인트

- `git log --oneline` — 태스크 단위 커밋 이력
- `pipeline/backlog.json` — 진행 상황(tasks/done/failed)
- `.lighthouseci/` — 태스크별 Lighthouse 리포트
- `playwright-report/` — E2E 실패 시 HTML 리포트
- GitHub Actions → CI 최종 판정
- Vercel Preview URL → 각 커밋별 배포 결과
