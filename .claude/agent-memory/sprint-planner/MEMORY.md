# Sprint Planner 메모리

이 파일은 sprint-planner 에이전트의 영구 메모리입니다.
프로젝트 진행 상황, 기술 스택, 패턴 등을 기록합니다.

---

## 스프린트 현황

| 스프린트 | 목표 | 상태 | 완료일 |
|---------|------|------|------|
| Sprint 1 | 프로젝트 기반 구축 (React + Vite + 레이아웃 + 설정 페이지) | ✅ 완료 | 2026-03-13 |
| Sprint 2 | GitLab 커밋 이력 | ✅ 완료 | 2026-03-13 |
| Sprint 3 | Redmine 일감 트리 | ✅ 완료 | 2026-03-13 |
| Sprint 4 | AI 챗봇 + 대시보드 홈 | ✅ 완료 | 2026-03-13 |
| Sprint 5 | UI 다듬기 + 배포 | ✅ 완료 | 2026-03-13 |
| Sprint 6 | API 키 온보딩 + 조회 버튼 + UI 모던화 | ✅ 완료 | 2026-03-14 |
| Sprint 7 | URL 고정 + 모델 단일화 + 작성자 드롭다운 | ✅ 완료 | 2026-03-15 |
| Sprint 8 | Vitest 테스트 인프라 + 데모 모드 + CI 강화 + 문서 경쟁분석 | ✅ 완료 | 2026-03-15 |

**다음 사용 가능한 스프린트 번호**: Sprint 9

---

## 기술 스택 (Sprint 1 확정)

- **프레임워크**: React 18 + TypeScript + Vite
- **스타일**: Tailwind CSS v4 (shadcn/ui 미사용, 커스텀 컴포넌트)
- **라우팅**: React Router v7
- **상태관리**: Zustand v5 (persist 미들웨어)
- **서버 상태**: React Query v5
- **HTTP**: Axios
- **인프라**: Vercel 배포 (vercel.json rewrites로 GitLab/Redmine API 프록시) — Sprint 5에서 Docker 제거

---

## 핵심 주의사항

- **Tailwind CSS v4**: shadcn/ui와 호환성 문제로 커스텀 컴포넌트 방식 채택. Sprint 2 이후에도 동일 패턴 유지.
- **API 프록시 경로**: `/gitlab-api/` → GitLab API v4, `/redmine-api/` → Redmine API. Vite 개발 서버에도 동일 프록시 경로 설정 필요.
- **Anthropic API Key**: `claudeClient.ts`에서 `dangerouslyAllowBrowser: true`로 브라우저 직접 호출 방식 채택. API 키가 settingsStore(localStorage)에서 런타임 로드되므로 번들 노출은 없으나, 네트워크 탭에서 요청이 노출됨. Sprint 5에서 백엔드 프록시 경유 방식 재검토 권장.
- **nginx.conf**: `proxy_ssl_verify off` 설정 — Sprint 5 프로덕션 배포 시 인증서 검증 활성화 검토.
- **DONE_STATUSES 중복**: `DueSoonBanner.tsx`와 `VersionProgressBar.tsx`에 `DONE_STATUSES` 배열 중복 정의. Sprint 5에서 `src/constants/redmine.ts`로 추출 권장.
- **Redmine URL href XSS**: `IssueTreeNode`에서 `redmineUrl` href 사용 시 `javascript:` 프로토콜 필터링 없음. Sprint 5 코드 리뷰에서 Medium으로 기록. 다음 스프린트에서 URL 유효성 검사 추가 권장.
- **Vercel rewrites 하드코딩**: `vercel.json`에 GitLab(`gitlab.ubware.com`), Redmine(`redmine.ubware.com`) URL이 하드코딩됨. 다른 환경에서 재배포 시 수정 필요.
- **인프라 변경**: Sprint 5에서 Docker/Nginx → Vercel로 전환. `docker compose up --build` 스테이징 검증 절차는 더 이상 해당 없음.
- **appliedFilter 패턴**: Sprint 6에서 gitlabStore/redmineStore에 draft/applied 이중 상태 구조 도입. 드래프트는 입력 즉시 반영, applied는 조회 버튼 클릭 시 복사. 새 필터 기능 추가 시 동일 패턴 준수 필요.
- **OnboardingModal 표시 조건**: `App.tsx`에서 `needsOnboarding` 변수로 GitLab URL + Token + Redmine URL + apiKey 4개 모두 채워져야 모달이 닫힘. 새 필수 API 키 추가 시 조건 업데이트 필요.
- **Sprint 7 설계 결정**: GitLab/Redmine URL이 환경변수 기반으로 고정됨에 따라 SettingsPage, OnboardingModal 두 곳 모두에서 URL 입력 필드 제거 필요. App.tsx의 needsOnboarding 조건도 URL 항목 제거 필요.
- **GitLab 작성자 드롭다운**: CommitFilterBar는 `authors?: string[]` props를 받아 드롭다운 렌더링. 작성자 목록은 GitlabPage에서 현재 커밋 `author_name` 기반으로 추출 (클라이언트 사이드, API 추가 호출 없음).
- **Dashboard 작성자 필터**: useState 로컬 상태로 관리 (store 미사용). recentActivity에서 작성자 목록 추출, filteredActivity useMemo로 클라이언트 사이드 필터링. 임시 구현으로 명시.
- **Sprint 8 신규 컴포넌트**: `src/components/dashboard/SummaryDetailPanel.tsx` — 카드 상세 슬라이드인 패널. `CardType`, `IssueSummaryItem`, `CommitSummaryItem` 타입 export.
- **Dashboard 기간 필터**: `activityPeriodDays` useState(기본 7)로 로컬 관리. recentActivity useMemo 내 cutoff 계산 후 filter 적용. 기간 필터 후 작성자 필터 순으로 적용.
- **recentActivity url 필드**: Sprint 8에서 추가. 커밋 = `c.web_url`, 이슈 = `redmineUrl ? \`${redmineUrl}/issues/${id}\` : undefined`. url 없으면 링크 미표시 (span fallback).
- **z-index 레이어**: SummaryDetailPanel 오버레이 z-40, 패널 z-50. ChatbotPanel z-index와 충돌 여부 확인 필요.
- **Vitest 테스트 인프라 (Sprint 8)**: `vitest.config.ts` + `src/test/setup.ts` 설정 완료. 45건 단위 테스트. `tsconfig.app.json`에서 테스트 파일 exclude 처리 (빌드 타겟 오염 방지). `npm test` = `vitest run` (watch 모드 아님).
- **데모 모드 (Sprint 8)**: `VITE_DEMO_MODE=true` 환경변수로 활성화. 6개 훅 모두 mock 분기 처리. App.tsx의 needsOnboarding 조건에서 isDemoMode 체크 추가. 새 훅 추가 시 isDemoMode 분기 동일하게 적용 필요.
- **CI 파이프라인 (Sprint 8)**: `.github/workflows/ci.yml`에 test 잡 추가. lint-and-typecheck → test → build 의존 체인. test 잡에 VITE_* 환경변수 더미값 필요 (GitHub Actions secrets 또는 하드코딩).
