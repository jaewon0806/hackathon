# 배포 후 수동 작업 가이드

> **목적**: 현재 완료되지 않은 수동 검증/작업 항목만 유지합니다.
> 완료된 기록은 `docs/deploy-history/YYYY-MM-DD.md`로 이동됩니다.

---

## 현재 미완료 항목 — Sprint 6 (2026-03-14)

### 자동 검증

- ✅ `npm run build` 빌드 성공 확인
- ⬜ Docker 미실행으로 pytest 자동 검증 미수행
- ⬜ Docker 미실행으로 API curl/httpx 검증 미수행
- ⬜ Docker 미실행으로 데모 모드 API 검증 미수행
- ⬜ Docker 미실행으로 Playwright UI 자동 검증 미수행

### 수동 검증 필요 항목

- ⬜ `npm run dev` 실행 후 최초 접속 시 온보딩 모달 표시 확인
  - GitLab/Redmine/Anthropic 3단계 순서 진행 확인
  - 연결 테스트 버튼 동작 확인
  - Anthropic 건너뛰기 후 대시보드 진입 확인
- ⬜ CommitFilterBar 조회 버튼 클릭 및 Enter 키 입력 시에만 API 호출 발생 확인
- ⬜ IssueFilterBar 동일 동작 확인
- ⬜ UI 시각적 품질 확인 (커스텀 스크롤바, Sidebar 그라데이션, TopBar backdrop-blur)
- ⬜ `docker compose up --build` 스테이징 검증 (develop 머지 후)

---

## 참고

- 검증 원칙: `docs/dev-process.md` 섹션 5
- 배포 이력: `docs/deploy-history/`
- 롤백 방법: `docs/dev-process.md` 섹션 6.4
