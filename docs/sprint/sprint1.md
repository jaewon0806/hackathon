# Sprint 1 완료 보고서 — 프로젝트 기반 구축

> **브랜치**: `sprint1`
> **목표**: React + TypeScript 프로젝트 초기 설정, 라우팅, 레이아웃, 설정 화면
> **상태**: ✅ 완료
> **완료일**: 2026-03-13
> **PR**: sprint1 → develop

---

## 구현 요약

### 프로젝트 초기화

- Vite + React 18 + TypeScript 프로젝트 초기화
- Tailwind CSS v4, React Router v7, Zustand v5, React Query v5, Axios 설치
- ESLint + TypeScript 설정 (`eslint.config.js`, `tsconfig.*.json`, `vite.config.ts`)

### 레이아웃 컴포넌트

| 컴포넌트 | 위치 | 설명 |
|---------|------|------|
| `Sidebar` | `src/components/common/Sidebar.tsx` | 240px 고정 사이드바, NavLink 4개 (대시보드/GitLab/Redmine/설정), active 스타일 |
| `TopBar` | `src/components/common/TopBar.tsx` | 48px 상단바, 페이지 타이틀 + ThemeToggle |
| `ThemeToggle` | `src/components/common/ThemeToggle.tsx` | 라이트/다크/시스템 3상태 토글 버튼 |
| `Toast` | `src/components/common/Toast.tsx` | 성공/에러 토스트 알림 컴포넌트 |

### 페이지

| 페이지 | 경로 | 상태 |
|-------|------|------|
| `DashboardPage` | `/` | 플레이스홀더 (Sprint 4에서 구현) |
| `GitlabPage` | `/gitlab` | 플레이스홀더 (Sprint 2에서 구현) |
| `RedminePage` | `/redmine` | 플레이스홀더 (Sprint 3에서 구현) |
| `SettingsPage` | `/settings` | 완전 구현 |

### 설정 페이지 기능

- GitLab URL + Personal Access Token 입력 및 연결 테스트
- Redmine URL + API Access Key 입력 및 연결 테스트
- Anthropic API Key + Claude 모델 선택
- 테마 선택 (라이트/다크/시스템 라디오 버튼)
- 자동 새로고침 간격 선택 (수동/5분/15분/30분)
- 저장 버튼 (로컬 스토리지에 persist)

### API 클라이언트

| 파일 | 설명 |
|------|------|
| `src/api/gitlabClient.ts` | axios 인스턴스 + Bearer 토큰 인터셉터, getProjects/getBranches/getCommits/getCurrentUser |
| `src/api/redmineClient.ts` | axios 인스턴스 + X-Redmine-API-Key 인터셉터, getProjects/getVersions/getIssues/getCurrentUser |
| `src/api/claudeClient.ts` | Sprint 4 구현 예정 스텁 |
| `src/api/connectionTest.ts` | GitLab/Redmine 연결 테스트 유틸 (직접 URL 대상 axios 호출) |

### 스토어 (Zustand v5)

| 파일 | 설명 |
|------|------|
| `src/store/settingsStore.ts` | persist 미들웨어 (`dashboard_settings` 키), 테마/새로고침간격/API 설정 |
| `src/store/gitlabStore.ts` | partialize 직렬화, Sprint 2에서 실데이터 연동 |
| `src/store/redmineStore.ts` | partialize 직렬화, Sprint 3에서 실데이터 연동 |

### 훅

| 파일 | 설명 |
|------|------|
| `src/hooks/useTheme.ts` | settingsStore 테마 상태 구독, `document.documentElement.classList` 토글, 시스템 미디어쿼리 리스너 |
| `src/hooks/useToast.ts` | Toast 컨텍스트 소비 훅 |

### 인프라

| 파일 | 설명 |
|------|------|
| `Dockerfile` | 멀티스테이지 빌드 (node:20-alpine builder → nginx:alpine) |
| `nginx.conf` | React SPA (`try_files`) + `/gitlab-api/` 프록시 + `/redmine-api/` 프록시 |
| `docker-compose.yml` | 로컬 개발용 |
| `docker-compose.prod.yml` | 프로덕션용 |
| `.env.example` | 환경변수 예시 파일 |

---

## 완료 기준 검증

| 항목 | 결과 |
|------|------|
| 사이드바 네비게이션 | ✅ NavLink 4개, active 스타일 구현 |
| 설정 화면 GitLab 연결 테스트 | ✅ connectionTest.ts 구현, 성공/실패 Toast 표시 |
| 다크모드 전환 | ✅ useTheme 훅 + ThemeToggle 3상태 |
| `npm run build + lint + typecheck` | ✅ 통과 |

---

## 코드 리뷰 결과

**Critical/High 이슈**: 없음

**Medium 이슈 (추후 개선 참고)**

1. **Anthropic API 키 브라우저 번들 포함 가능성** — `settingsStore`에서 `VITE_ANTHROPIC_API_KEY` 환경변수를 초기값으로 사용. Sprint 4에서 Claude API를 백엔드 프록시를 통해 구현하거나 클라이언트 사이드에서만 사용 시 키 노출 주의 필요.
2. **nginx.conf `proxy_ssl_verify off`** — 내부 서버 대상이지만 프로덕션 환경에서는 인증서 검증 활성화 권장 (Sprint 5 배포 시 검토).

---

## 검증 결과

### 자동 검증

- ⬜ Docker 미실행으로 자동 검증 미수행

### 수동 검증 필요 항목

- ⬜ `docker compose up --build` 로컬 스테이징 빌드 성공 확인
- ⬜ 브라우저에서 사이드바 네비게이션 동작 확인 (/, /gitlab, /redmine, /settings)
- ⬜ 설정 페이지 GitLab 토큰 입력 후 연결 테스트 성공 확인
- ⬜ 설정 페이지 Redmine API 키 입력 후 연결 테스트 성공 확인
- ⬜ 라이트 / 다크 / 시스템 테마 전환 동작 확인
- ⬜ UI 디자인 / 시각적 품질 판단

검증 현황: `docs/deploy.md` 참조

---

## 첨부 파일

스크린샷 및 보고서: `docs/sprint/sprint1/`
