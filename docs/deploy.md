# 배포 후 수동 작업 가이드

> **목적**: 현재 완료되지 않은 수동 검증/작업 항목만 유지합니다.
> 완료된 기록은 `docs/deploy-history/YYYY-MM-DD.md`로 이동됩니다.

---

## 현재 미완료 항목

### Sprint 2 — GitLab 커밋 이력 (2026-03-13)

**자동 검증**

- ⬜ Docker 미실행으로 자동 검증 미수행 (pytest, API curl, Playwright)

**수동 검증 필요**

- ⬜ 브라우저에서 GitLab 페이지(/gitlab) 접속 후 프로젝트 목록 표시 확인
- ⬜ 프로젝트 선택 시 브랜치 목록 자동 갱신 확인 (기본 브랜치 자동 선택 포함)
- ⬜ 커밋 목록 정상 표시 및 Intersection Observer 무한 스크롤 동작 확인
- ⬜ 작성자/기간/키워드 필터 적용 시 목록 필터링 동작 확인
- ⬜ 토큰 미설정 시 안내 메시지 표시 확인
- ⬜ 401/403/네트워크 에러 메시지 분기 표시 확인
- ⬜ UI 디자인 / 시각적 품질 판단

---

## 참고

- 검증 원칙: `docs/dev-process.md` 섹션 5
- 배포 이력: `docs/deploy-history/`
- 롤백 방법: `docs/dev-process.md` 섹션 6.4
