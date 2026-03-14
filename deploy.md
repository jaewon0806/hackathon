# 배포 후 수동 작업 가이드

> **목적**: 현재 완료되지 않은 수동 검증/작업 항목만 유지합니다.
> 완료된 기록은 `docs/deploy-history/YYYY-MM-DD.md`로 이동됩니다.

---

### Hotfix: 날짜 표시 형식을 M/D (N시간 전) 형식으로 개선 (2026-03-15)

PR: https://github.com/jaewon0806/hackathon/compare/develop...hotfix/date-display
(gh CLI 미설치로 자동 생성 불가 — 아래 URL로 GitHub에서 직접 PR 생성 필요)

- ✅ 자동 검증 완료 항목:
  - `npm run build`: 성공

- ⬜ 수동 검증 필요 항목:
  - GitHub에서 PR 직접 생성: `hotfix/date-display` → `develop`
  - `npm run dev` 실행 후 대시보드 최근 활동 날짜 형식 확인 ("M/D (N시간 전)" 형식)
  - GitLab 커밋 목록에서 날짜 형식 동일 확인
  - Redmine 이슈 트리에서 수정일 표시 확인 (sm 브레이크포인트 이상)
  - `docker compose up --build` (코드 반영)

---

## 참고

- 검증 원칙: `docs/dev-process.md` 섹션 5
- 배포 이력: `docs/deploy-history/`
- 롤백 방법: `docs/dev-process.md` 섹션 6.4
