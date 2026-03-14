# 배포 후 수동 작업 가이드

> **목적**: 현재 완료되지 않은 수동 검증/작업 항목만 유지합니다.
> 완료된 기록은 `docs/deploy-history/YYYY-MM-DD.md`로 이동됩니다.

---

### Sprint 8: 대시보드 카드 상세 패널 + 최근 활동 링크 + 기간 필터 (2026-03-15)

PR: https://github.com/jaewon0806/hackathon/compare/develop...sprint8
(gh CLI 미설치로 자동 생성 불가 — 아래 URL로 GitHub에서 직접 PR 생성 필요)

- ✅ 자동 검증 완료 항목:
  - `npm run build`: 성공
- ⬜ Docker 미실행으로 pytest/API/Playwright 자동 검증 미수행

- ⬜ 수동 검증 필요 항목:
  - GitHub에서 PR 직접 생성: `sprint8` → `develop`
    URL: https://github.com/jaewon0806/hackathon/compare/develop...sprint8
  - `npm run dev` 실행 후 담당일감 카드 클릭 → 미완료 이슈 목록 패널 표시 확인
  - 이번주커밋 카드 클릭 → 커밋 목록 패널 표시 확인
  - 진행중/기한초과 카드 클릭 → 해당 이슈 목록 패널 표시 확인
  - 패널 오버레이 클릭 및 X 버튼으로 닫힘 확인
  - 최근 활동 항목에 ExternalLink 아이콘 표시 및 새 탭 열기 확인
  - 기간 드롭다운 변경 시 활동 목록 즉시 필터링 확인
  - 기간 + 작성자 드롭다운 복합 필터 확인
  - `docker compose up --build` (develop 머지 후)

---

## 참고

- 검증 원칙: `docs/dev-process.md` 섹션 5
- 배포 이력: `docs/deploy-history/`
- 롤백 방법: `docs/dev-process.md` 섹션 6.4
