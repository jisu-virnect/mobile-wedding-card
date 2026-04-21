# Autonomous Development Loop — Mobile Wedding Card

이 문서는 자율 파이프라인의 **루프 프롬프트**입니다. Claude Code의 `/loop` 자가 페이싱 모드에서
아래 내용을 그대로 입력해 반복 실행합니다.

## 루프 프롬프트 (그대로 사용)

```
모바일 청첩장 프로젝트의 자율 개발 루프를 한 이터레이션 실행한다.

작업 경로: C:\Users\VIRNECT\projects\mobile-wedding-card
원격: origin (jisu-virnect/mobile-wedding-card)

규칙:
1. 시작 전 main 최신화:
   - `git checkout main && git pull --ff-only origin main`

2. pipeline/backlog.json의 `tasks` 배열에서 맨 앞 태스크를 꺼낸다.
   - 비어있으면 "BACKLOG EMPTY. STOPPING."을 출력하고 루프를 종료한다 (ScheduleWakeup 호출하지 않음).

3. 태스크 전용 브랜치 생성:
   - 브랜치명: `task/{ID}-{slug}` (예: `task/T05-cover`)
   - `git checkout -b task/T05-cover`

4. 태스크의 goal과 acceptance 기준에 따라 구현한다.
   - 큰 변경은 general-purpose 서브에이전트에 위임해도 된다.
   - 단위 테스트/E2E 테스트가 필요하면 함께 작성한다.

5. 로컬 관문 실행: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm e2e && pnpm lighthouse`

6. 실패 시 자가 수정, 같은 태스크에서 최대 3번까지 시도.
   - 3번 초과 시: 브랜치는 남겨두되 pipeline/backlog.json의 `failed` 배열로 이동.
     실패 이유 기록 후 루프 종료. 다음 이터레이션 예약하지 않음.

7. 관문 모두 통과 시:
   a. pipeline/backlog.json을 갱신: `tasks`에서 제거, `done`에 이동.
   b. 관련 파일 + backlog.json 스테이징 → Conventional Commits로 커밋.
      예: `feat(cover): implement cover section with date formatting (T05)`
   c. `git push -u origin task/T05-cover`
   d. PR 생성:
      - `gh pr create --base main --head task/T05-cover --title "feat(cover): ... (T05)" --body "<goal 요약 + acceptance 체크리스트>"`
   e. CI(Actions) 통과 대기:
      - `gh pr checks <PR번호> --watch` 로 폴링 (타임아웃 15분).
      - CI 실패 시: 태스크를 failed로 이동, 루프 종료.
   f. CI 통과 시 squash 머지:
      - `gh pr merge <PR번호> --squash --delete-branch`
   g. 로컬 main으로 돌아가 pull:
      - `git checkout main && git pull --ff-only origin main`

8. 다음 이터레이션 예약. 짧은 간격(60-120초)으로 ScheduleWakeup.

중요:
- 커밋 하나에 여러 태스크를 묶지 말 것 (태스크당 1 PR 1커밋 원칙).
- 테스트/관문을 건너뛰지 말 것. `--no-verify`, `--force`, `--admin` 금지.
- 기존 테스트를 비활성화해서 관문을 통과시키는 건 실패로 간주.
- main에 직접 푸시 금지. 모든 변경은 PR 경유.
- 각 이터레이션 시작/종료에 간단한 진행 상황을 출력할 것.
```

## 실행 방법

```
/loop <위 프롬프트>
```

간격을 지정하지 않았으므로 Claude가 자가 페이싱으로 다음 이터레이션을 예약합니다.

## 중단 조건

- `pipeline/backlog.json`의 `tasks`가 비면 자동 종료.
- 단일 태스크 3회 연속 실패 → `failed`로 이동 후 종료.
- PR CI 타임아웃(15분) → 태스크 실패 처리.
- 사용자 수동 중지.

## 관찰 포인트

- `git log --oneline main` — 완료된 태스크(머지된 커밋) 이력
- `gh pr list --state all` — 진행 중/완료된 PR
- `pipeline/backlog.json` — 대기/완료/실패 큐
- `.lighthouseci/` — 로컬 Lighthouse 리포트
- GitHub Actions 페이지 — 각 PR CI 결과
- Vercel 대시보드 — 각 PR 프리뷰 URL
