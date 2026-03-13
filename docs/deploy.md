# 배포 후 수동 작업 가이드

> **목적**: 현재 완료되지 않은 수동 검증/작업 항목만 유지합니다.
> 완료된 기록은 `docs/deploy-history/YYYY-MM-DD.md`로 이동됩니다.

---

## 현재 미완료 항목

### Sprint 5 — UI 다듬기 + Vercel 배포 (2026-03-13)

**자동 검증**

- ✅ `npm run lint` 통과
- ✅ `npm run typecheck` 통과
- ✅ `npm run build` 통과
- ⬜ Docker 미실행으로 Playwright UI 자동 검증 미수행

**수동 검증 필요**

- ⬜ Vercel 배포 후 전체 기능 동작 확인 (vercel.json 리라이트 설정 포함)
- ⬜ 모바일 화면(768px 미만)에서 햄버거 버튼 표시 및 사이드바 오버레이 동작 확인
- ⬜ 모바일 사이드바 열기 → 메뉴 클릭 → 자동 닫힘 동작 확인
- ⬜ 설정 페이지에서 자동 새로고침 간격 변경 후 GitLab 페이지에서 자동 갱신 확인
- ⬜ 설정 페이지에서 자동 새로고침 간격 변경 후 Redmine 페이지에서 자동 갱신 확인
- ⬜ 런타임 에러 발생 시 ErrorBoundary 오류 화면 표시 + 다시 시도 버튼 동작 확인
- ⬜ 페이지 전환 시 Suspense fallback(로딩 스켈레톤) 표시 확인
- ⬜ UI 디자인 / 시각적 품질 판단

---

## 참고

- 검증 원칙: `docs/dev-process.md` 섹션 5
- 배포 이력: `docs/deploy-history/`
- 롤백 방법: `docs/dev-process.md` 섹션 6.4
