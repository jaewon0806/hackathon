# 배포 후 수동 작업 가이드

> **목적**: 현재 완료되지 않은 수동 검증/작업 항목만 유지합니다.
> 완료된 기록은 `docs/deploy-history/YYYY-MM-DD.md`로 이동됩니다.

---

### Sprint 8 — Vitest 테스트 인프라 + 데모 모드 + CI 강화 (2026-03-15)

PR: https://github.com/jaewon0806/hackathon/compare/develop...sprint8
(gh CLI 미설치로 자동 생성 불가 — 아래 URL로 GitHub에서 직접 PR 생성 필요)

- ✅ 자동 검증 완료 항목:
  - `npm test`: 45/45 통과
  - `npm run build`: 성공
- ⬜ Docker 미실행으로 Docker 이미지 빌드 자동 검증 미수행

- ⬜ 수동 검증 필요 항목:
  - GitHub에서 PR 직접 생성: `sprint8` → `develop`
    URL: https://github.com/jaewon0806/hackathon/compare/develop...sprint8
  - `VITE_DEMO_MODE=true npm run dev` 후 온보딩 모달에 "데모로 시작" 버튼 표시 확인
  - 데모 시작 후 샘플 GitLab/Redmine 데이터로 대시보드 정상 표시 확인
  - CI 파이프라인 확인: lint → test → build 의존 체인 정상 동작 확인
  - `docker compose up --build` (develop 머지 후)

---

## 참고

- 검증 원칙: `docs/dev-process.md` 섹션 5
- 배포 이력: `docs/deploy-history/`
- 롤백 방법: `docs/dev-process.md` 섹션 6.4
