# Sprint 5 완료 보고서 — UI 다듬기 + 배포

> **기간**: 2026-03-13
> **브랜치**: `sprint5`
> **상태**: ✅ 완료
> **PR**: sprint5 → develop

---

## 스프린트 목표

전체 UI 품질 개선, 성능 최적화, Vercel 프로덕션 배포 설정

---

## 구현 내용

### UI/UX 개선

#### ErrorBoundary (`src/components/common/ErrorBoundary.tsx`)
- React class component 기반 런타임 에러 캐치
- `getDerivedStateFromError` + `componentDidCatch` 구현
- 에러 발생 시 오류 메시지 + 다시 시도 버튼 표시
- `App.tsx`에서 전체 라우트를 감싸는 방식으로 적용

#### 반응형 사이드바 (`src/components/common/Sidebar.tsx`, `TopBar.tsx`)
- `lg` breakpoint(1024px) 기준 분기
- 모바일: fixed 포지셔닝 + `translate-x` 애니메이션으로 슬라이드 인/아웃
- 모바일 오버레이(배경 딤 처리) 클릭 시 사이드바 자동 닫힘
- TopBar에 햄버거 버튼(`Menu` 아이콘) 추가

### 성능 최적화

#### 코드 스플리팅 (`src/App.tsx`)
- DashboardPage, GitlabPage, RedminePage, SettingsPage 4개 페이지 `lazy` import 적용
- `Suspense` fallback으로 인라인 스켈레톤 UI(`PageSkeleton`) 표시
- 초기 번들 크기 감소 효과

#### useAutoRefresh 훅 (`src/hooks/useAutoRefresh.ts`)
- React Query `useQueryClient`를 활용한 자동 갱신 훅
- `settingsStore.refreshInterval` (초 단위) 기반으로 동작
- `queryKeys` 안정화: `JSON.stringify(queryKeys)` 의존성으로 불필요한 interval 재생성 방지
- GitlabPage: `['gitlab', 'projects']`, `['gitlab', 'commits']` 키 연동
- RedminePage: `['redmine', 'projects']`, `['redmine', 'issues']` 키 연동

### 코드 품질

#### 상수 통합 (`src/constants/redmine.ts`)
- Sprint 3까지 `DueSoonBanner.tsx`, `VersionProgressBar.tsx`에 중복 정의되어 있던 `DONE_STATUSES` 배열을 단일 파일로 추출
- `DONE_STATUSES`, `IN_PROGRESS_STATUS`, `DUE_SOON_DAYS` 3개 상수 통합

### 배포

#### Vercel 설정 (`vercel.json`)
- GitLab API 프록시: `/gitlab-api/:path*` → `https://gitlab.ubware.com/api/v4/:path*`
- Redmine API 프록시: `/redmine-api/:path*` → `https://redmine.ubware.com/:path*`
- Docker 및 관련 파일 제거

---

## 코드 리뷰 결과

### Critical/High 이슈
없음

### Medium 이슈 (추후 개선 참고)

1. **Redmine URL href XSS 잠재 위험** (`src/components/redmine/IssueTreeNode.tsx`)
   - `redmineUrl`이 사용자 입력값으로, `javascript:` 프로토콜 필터링 없음
   - 실제 위협 수준 낮음 (사용자 본인이 직접 입력하는 URL)
   - 다음 스프린트에서 `URL` 생성자로 유효성 검사 추가 권장

2. **vercel.json API URL 하드코딩**
   - `gitlab.ubware.com`, `redmine.ubware.com`이 정적으로 기입됨
   - 다른 환경 배포 시 수동 수정 필요

---

## 자동 검증 결과

| 항목 | 결과 |
|------|------|
| `npm run lint` | ✅ 통과 |
| `npm run typecheck` | ✅ 통과 |
| `npm run build` | ✅ 통과 |
| Playwright UI 검증 | ⬜ Docker 미실행으로 미수행 |

---

## 수동 검증 필요 항목

- ⬜ Vercel 배포 후 전체 기능 동작 확인
- ⬜ 모바일 화면(768px 미만)에서 햄버거 버튼 및 사이드바 오버레이 동작 확인
- ⬜ 설정 페이지에서 자동 새로고침 간격 변경 후 GitLab/Redmine 자동 갱신 확인
- ⬜ 런타임 에러 시 ErrorBoundary 표시 + 다시 시도 동작 확인
- ⬜ 페이지 전환 시 Suspense 스켈레톤 표시 확인
- ⬜ UI 디자인 / 시각적 품질 판단

---

## 변경 파일 목록

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/components/common/ErrorBoundary.tsx` | 신규 | 런타임 에러 캐치 + 다시 시도 UI |
| `src/hooks/useAutoRefresh.ts` | 신규 | React Query 자동 갱신 훅 |
| `src/constants/redmine.ts` | 신규 | DONE_STATUSES 등 상수 통합 |
| `vercel.json` | 신규 | Vercel 배포 설정 (API rewrites) |
| `src/components/common/Sidebar.tsx` | 수정 | 반응형 오버레이 + 닫기 버튼 |
| `src/components/common/TopBar.tsx` | 수정 | 햄버거 메뉴 버튼 추가 |
| `src/App.tsx` | 수정 | lazy import + Suspense + ErrorBoundary |
| `src/pages/GitlabPage.tsx` | 수정 | useAutoRefresh 연동 |
| `src/pages/RedminePage.tsx` | 수정 | useAutoRefresh 연동 |
| `docs/ROADMAP.md` | 수정 | Sprint 5 완료 상태 업데이트 |
