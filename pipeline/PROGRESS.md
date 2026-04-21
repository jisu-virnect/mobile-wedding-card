# Autonomous Pipeline Progress Log

자율 개발 루프가 각 이터레이션 결과를 이 테이블에 기록합니다.

| ID  | Title | Issue | Branch | PR | CI | Merged At (UTC) | Status |
|-----|-------|-------|--------|----|----|-----------------|--------|
| -   | Pipeline bootstrap: progress log + issue linkage | —    | task/infra-progress-tracking | — | — | — | in_progress |

## 범례

- **Status**: `in_progress` · `merged` · `failed`
- **CI**: `pass` · `fail` · `timeout` · `skipped(local-only)`
- 실패한 이터레이션은 `pipeline/backlog.json`의 `failed` 배열로 이동하고 이 표에도 사유 링크 포함
