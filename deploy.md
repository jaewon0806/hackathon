# 배포 후 수동 작업 가이드

> **목적**: 현재 완료되지 않은 수동 검증/작업 항목만 유지합니다.
> 완료된 기록은 `docs/deploy-history/YYYY-MM-DD.md`로 이동됩니다.

---

### Sprint 7: URL 고정 + 모델 단일화 + 작성자 드롭다운 (2026-03-15)

PR: https://github.com/jaewon0806/hackathon/compare/develop...sprint7
(gh CLI 미설치로 자동 생성 불가 — 아래 URL로 GitHub에서 직접 PR 생성 필요)

- ✅ 자동 검증 완료 항목:
  - `npm run build`: 성공

- ⬜ 수동 검증 필요 항목:
  - GitHub에서 PR 직접 생성: `sprint7` → `develop`
    URL: https://github.com/jaewon0806/hackathon/compare/develop...sprint7
  - `npm run dev` 실행 후 설정 페이지에서 URL 입력 필드 없음 확인
  - 최초 접속 시 온보딩 모달이 토큰/키만 요구하는지 확인 (URL 입력 없음)
  - GitLab 화면에서 커밋 조회 후 작성자 드롭다운에 작성자 목록 자동 추출 확인
  - 작성자 드롭다운 선택 후 "조회" 클릭 시 필터링 동작 확인
  - 대시보드 최근 활동 작성자 드롭다운 필터링 동작 확인 (API 재호출 없이 클라이언트 사이드)
  - `docker compose up --build` (develop 머지 후)

---

## 참고

- 검증 원칙: `docs/dev-process.md` 섹션 5
- 배포 이력: `docs/deploy-history/`
- 롤백 방법: `docs/dev-process.md` 섹션 6.4
