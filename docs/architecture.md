# 시스템 아키텍처 — 업무 대시보드

> **버전**: v1.1 (Sprint 8 반영)
> **최초 작성**: 2026-03-13 | **최종 수정**: 2026-03-15
> **참조**: [PRD.md](PRD.md), [feature-spec.md](feature-spec.md)

---

## 1. 전체 구조 개요

**프론트엔드 단독 SPA** 구조입니다. 별도 백엔드 서버 없이 브라우저에서 직접 외부 API를 호출합니다.
CORS 이슈는 개발 환경에서 Vite 프록시로, 프로덕션 환경에서 Nginx 리버스 프록시로 해결합니다.

```
┌────────────────────────────────────────────────────────────────────┐
│                          사용자 브라우저                              │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              React 19 SPA (Vite 6 + TypeScript 5.7)          │  │
│  │                                                              │  │
│  │  Pages: Dashboard | GitLab | Redmine | Settings              │  │
│  │  ──────────────────────────────────────────                  │  │
│  │  Store: settings | gitlab | redmine | chatbot  (Zustand)     │  │
│  │  ──────────────────────────────────────────                  │  │
│  │  Hooks: useGitlabCommits | useRedmineIssues | ...            │  │
│  │         (TanStack React Query — 서버 상태 캐싱)               │  │
│  │  ──────────────────────────────────────────                  │  │
│  │  API Layer: gitlabClient | redmineClient | claudeClient      │  │
│  └───────────────┬──────────────┬────────────────┬─────────────┘  │
│                  │ /gitlab-api  │ /redmine-api   │ 직접 HTTPS     │
└──────────────────┼──────────────┼────────────────┼────────────────┘
       [Vite Proxy / Nginx Reverse Proxy]           │
                   │              │                 │
     ┌─────────────▼──┐  ┌────────▼──────┐  ┌──────▼──────────────┐
     │  GitLab API    │  │  Redmine API  │  │  Anthropic Claude   │
     │  (사내 서버)    │  │  (사내 서버)  │  │  (외부 SaaS)        │
     └────────────────┘  └───────────────┘  └─────────────────────┘
```

---

## 2. 디렉토리 구조

```
src/
├── api/                          # API 클라이언트 레이어
│   ├── gitlabClient.ts           # GitLab REST API (Bearer 토큰, /gitlab-api 프록시 경유)
│   ├── redmineClient.ts          # Redmine REST API (X-Redmine-API-Key, /redmine-api 프록시 경유)
│   ├── claudeClient.ts           # Anthropic SDK (dangerouslyAllowBrowser, 스트리밍)
│   └── connectionTest.ts         # 설정 페이지 연결 테스트 (프록시 경유)
│
├── components/
│   ├── common/
│   │   ├── Sidebar.tsx           # 그라데이션 사이드바, 모바일 오버레이 지원
│   │   ├── TopBar.tsx            # backdrop-blur, 햄버거 메뉴, 자동새로고침 표시
│   │   ├── Toast.tsx             # 전역 토스트 알림
│   │   ├── toastContext.ts       # Toast 컨텍스트 정의
│   │   ├── OnboardingModal.tsx   # 3단계 API 키 설정 온보딩 (토큰/키만 입력, URL은 환경변수 고정)
│   │   ├── ThemeToggle.tsx       # 라이트/다크/시스템 전환
│   │   ├── SkeletonLoader.tsx    # 로딩 스켈레톤 컴포넌트
│   │   └── ErrorBoundary.tsx     # 전역 에러 경계
│   ├── dashboard/
│   │   └── SummaryDetailPanel.tsx # 요약 카드 클릭 시 우측 슬라이드인 상세 패널 (Sprint 8)
│   ├── gitlab/
│   │   ├── ProjectBranchSelector.tsx # 프로젝트/브랜치 드롭다운 연동
│   │   ├── CommitFilterBar.tsx       # 작성자(드롭다운) + 기간 + 키워드 + 조회 버튼
│   │   ├── CommitList.tsx            # 무한 스크롤 커밋 목록
│   │   └── CommitItem.tsx            # 커밋 단일 항목 (날짜: "M/D (N시간 전)" 형식)
│   ├── redmine/
│   │   ├── ProjectVersionSelector.tsx # 프로젝트/버전 선택 + 조회 버튼
│   │   ├── IssueFilterBar.tsx         # 담당자/상태/우선순위/키워드 + 조회 버튼
│   │   ├── IssueTree.tsx              # 재귀 트리 최상위 컴포넌트
│   │   ├── IssueTreeNode.tsx          # 일감 트리 노드 (펼치기/접기, 수정일 표시)
│   │   ├── StatusBadge.tsx            # 일감 상태 배지 (색상 매핑)
│   │   ├── VersionProgressBar.tsx     # 목표 버전 완료율 프로그레스 바
│   │   └── DueSoonBanner.tsx          # 3일 이내 마감 경고 배너
│   └── chatbot/
│       ├── ChatbotPanel.tsx           # 우하단 고정 플로팅 패널, 스트리밍 응답
│       ├── ChatMessage.tsx            # 마크다운 렌더링
│       └── SuggestedQuestions.tsx     # 추천 질문 칩
│
├── pages/
│   ├── DashboardPage.tsx         # 요약 카드 + 최근 활동 피드 (기간/작성자 필터, 상세 패널)
│   ├── GitlabPage.tsx            # 커밋 조회 (appliedFilter 패턴, 작성자 useMemo 추출)
│   ├── RedminePage.tsx           # 일감 트리 (appliedProjectId/VersionId 기반 조회)
│   └── SettingsPage.tsx          # 토큰 관리, 연결 테스트, 테마/새로고침
│
├── store/                        # Zustand 전역 상태
│   ├── settingsStore.ts          # URL/토큰(환경변수 초기값), 테마, 새로고침 주기 (persist: dashboard_settings)
│   ├── gitlabStore.ts            # 프로젝트/브랜치 선택, 드래프트/applied 필터 이중 상태 (persist: gitlab_last_selection)
│   ├── redmineStore.ts           # 프로젝트/버전 선택, 드래프트/applied 필터 이중 상태 (persist: redmine_last_selection)
│   └── chatbotStore.ts           # 패널 open/close, 스트리밍 상태, 메시지 이력 (persist: chatbot_history)
│
├── hooks/
│   ├── useGitlabProjects.ts      # useQuery, enabled: !!token, staleTime 5분
│   ├── useGitlabBranches.ts      # useQuery, enabled: !!projectId
│   ├── useGitlabCommits.ts       # useInfiniteQuery, 50건/page, 다음 페이지 = 50건 여부
│   ├── useRedmineProjects.ts     # useQuery, enabled: !!apiKey
│   ├── useRedmineVersions.ts     # useQuery, enabled: !!projectId
│   ├── useRedmineIssues.ts       # useQuery, while 루프 전체 수집, staleTime 5분
│   ├── useAutoRefresh.ts         # refreshInterval 기반 React Query invalidateQueries 타이머
│   ├── useTheme.ts               # dark 클래스 토글, system 시 matchMedia 감시
│   └── useToast.ts               # ToastContext 소비 훅
│
├── utils/
│   ├── issueTreeBuilder.ts       # RedmineIssue[] → IssueNode[] 트리 변환 (parent.id 기반)
│   └── redmine.ts                # Redmine 관련 유틸 함수
│
├── types/
│   ├── gitlab.types.ts           # GitlabProject, GitlabBranch, GitlabCommit, CommitFilters
│   ├── redmine.types.ts          # RedmineProject, RedmineIssue, IssueNode, IssueFilters
│   ├── chatbot.types.ts          # ChatMessage, ChatRole
│   └── settings.types.ts        # SettingsState, ThemeMode, GitlabSettings, RedmineSettings
│
├── constants/
│   └── redmine.ts                # DONE_STATUSES, IN_PROGRESS_STATUS 등 상수
│
├── App.tsx                       # 라우터 설정, AppLayout, needsOnboarding 조건 (토큰/키만 확인)
├── main.tsx                      # QueryClient, ToastProvider, BrowserRouter 진입점
└── index.css                     # Tailwind CSS v4 설정 (@import "tailwindcss")
```

---

## 3. 데이터 흐름

### 3.1 전체 흐름

```
사용자 액션 (드롭다운 선택, 버튼 클릭)
    │
    ├─→ Zustand Store 드래프트 상태 업데이트 (즉시)
    │
    └─→ [조회 버튼 클릭 시만] → Store applied 상태 업데이트
                                        │
                                React Query queryKey 변경 감지
                                        │
                                API 클라이언트 레이어 호출
                                  (axios, /gitlab-api 또는 /redmine-api 프록시)
                                        │
                                캐시 업데이트 → UI 리렌더링
```

### 3.2 필터 이중 상태 패턴 (Sprint 6 도입)

**GitLab/Redmine 모두** 드래프트 상태와 applied 상태를 분리합니다.

```typescript
// gitlabStore 예시
{
  // 드래프트 (입력 중, API 호출 안 함)
  authorFilter: ['홍길동'],
  dateRange: { from: '2026-03-01', to: '' },
  keyword: 'fix',

  // applied (조회 버튼 클릭 시 복사됨 → React Query queryKey에 사용)
  appliedAuthorFilter: [],
  appliedDateRange: { from: '', to: '' },
  appliedKeyword: '',
}
```

- **장점**: 조회 버튼 클릭 전까지 API 재호출이 발생하지 않아 불필요한 요청 방지
- **패턴**: `applyFilters()` 또는 `applyProject()` 액션이 드래프트 → applied 복사 수행

### 3.3 상태 관리 전략

| 상태 유형 | 관리 도구 | 저장 위치 | 특징 |
|----------|----------|----------|------|
| 서버 데이터 (API 응답) | React Query | 인메모리 캐시 | staleTime 5분, 조회 버튼 시만 invalidate |
| UI 드래프트 필터 | Zustand (in-memory) | — | 입력 즉시 반영, API 호출 없음 |
| UI applied 필터 | Zustand (in-memory) | — | 조회 버튼 클릭 시만 업데이트 |
| 프로젝트/브랜치 선택 | Zustand + persist | localStorage | 재방문 시 마지막 선택 복원 |
| API 설정 (URL, 토큰) | Zustand + persist | localStorage | 환경변수로 초기값, 사용자 오버라이드 가능 |
| 챗봇 대화 이력 | Zustand + persist | localStorage | 최대 50건, 세션 간 유지 |
| 테마 | Zustand + persist | localStorage | system 시 matchMedia로 실시간 감지 |

---

## 4. API 클라이언트 설계

### 4.1 axios 인스턴스 패턴

모든 API 클라이언트는 동일한 패턴을 따릅니다:

```typescript
// 예시: redmineClient.ts
const redmineAxios = axios.create({
  baseURL: '/redmine-api',   // Vite 프록시 경로 → Nginx에서도 동일 경로
  timeout: 10000,
})

// 요청 인터셉터: 스토어에서 최신 토큰 자동 주입
redmineAxios.interceptors.request.use((config) => {
  const apiKey = useSettingsStore.getState().redmine.apiKey
  if (apiKey) config.headers['X-Redmine-API-Key'] = apiKey
  return config
})

// 응답 인터셉터: 에러 표준화 (컴포넌트에서 error.message로 분기 처리)
redmineAxios.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    if (status === 401) throw new Error('REDMINE_UNAUTHORIZED')
    if (status === 403) throw new Error('REDMINE_FORBIDDEN')
    throw new Error('REDMINE_NETWORK_ERROR')
  }
)
```

### 4.2 React Query 훅 패턴

```typescript
// 무한 스크롤 (GitLab 커밋)
export function useGitlabCommits(projectId, branch, filters) {
  return useInfiniteQuery({
    queryKey: ['gitlab', 'commits', projectId, branch, filters],
    queryFn: ({ pageParam = 1 }) =>
      gitlabClient.getCommits(projectId, branch, { ...filters, page: pageParam, per_page: 50 }),
    getNextPageParam: (lastPage) => lastPage.length === 50 ? ... : undefined,
    enabled: !!projectId && !!branch,
    staleTime: 5 * 60 * 1000,
  })
}

// 전체 수집 (Redmine 이슈 - 페이지네이션 순차 처리)
export function useRedmineIssues(projectId, versionId) {
  return useQuery({
    queryKey: ['redmine', 'issues', projectId, versionId],
    queryFn: async () => {
      const all = []
      let offset = 0
      while (true) {
        const res = await redmineClient.getIssues({ projectId, versionId, offset, limit: 100 })
        all.push(...res.issues)
        if (all.length >= res.total_count) break
        offset += 100
      }
      return all
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  })
}
```

### 4.3 Claude AI 스트리밍

```typescript
// claudeClient.ts — dangerouslyAllowBrowser 모드로 브라우저에서 직접 호출
const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

// 시스템 프롬프트에 현재 업무 데이터 주입 (Redmine 50건 + GitLab 30건)
const stream = await client.messages.stream({
  model: settingsStore.anthropic.model,  // claude-haiku-4-5 고정
  system: buildSystemPrompt(issues, commits),
  messages: conversationHistory,
})
// stream.on('text') → chatbotStore 스트리밍 업데이트
```

---

## 5. 프록시 레이어

### 5.1 개발 환경 (Vite Dev Server)

```typescript
// vite.config.ts
server: {
  proxy: {
    '/gitlab-api': {
      target: env.VITE_GITLAB_URL,
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/gitlab-api/, '/api/v4'),
      secure: false,
    },
    '/redmine-api': {
      target: env.VITE_REDMINE_URL,
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/redmine-api/, ''),
      secure: false,
    },
  },
}
```

### 5.2 프로덕션 환경 (Nginx)

```nginx
server {
    listen 80;

    # React SPA — HTML5 history API 지원
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # GitLab API 프록시 (/api/v4/ 경로 재작성)
    location /gitlab-api/ {
        proxy_pass https://gitlab.example.com/api/v4/;
        proxy_set_header Host gitlab.example.com;
        proxy_ssl_server_name on;
        proxy_set_header Authorization $http_authorization;
    }

    # Redmine API 프록시
    location /redmine-api/ {
        proxy_pass https://redmine.example.com/;
        proxy_set_header Host redmine.example.com;
        proxy_ssl_server_name on;
        proxy_set_header X-Redmine-API-Key $http_x_redmine_api_key;
    }
}
```

---

## 6. 배포 구조

### 6.1 Docker 이미지 빌드 (Multi-stage)

```dockerfile
# Stage 1: 빌드
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build          # dist/ 생성

# Stage 2: 서빙
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### 6.2 프로덕션 서버 구성

```
프로덕션 서버 (AWS Lightsail)
└── Docker Compose
    └── nginx 컨테이너 (포트 80/443)
        ├── 정적 파일 서빙 (빌드된 React SPA)
        └── 리버스 프록시 (/gitlab-api, /redmine-api)
```

### 6.3 환경변수 흐름

```
개발: .env.local → Vite → import.meta.env.VITE_*
CI:  GitHub Actions env → 더미값 (빌드 검증만)
배포: GitHub Secrets → docker build --build-arg → Nginx 컨테이너
```

---

## 7. 보안 고려사항

| 항목 | 현황 | 대응 |
|------|------|------|
| API 토큰 저장 | localStorage 평문 저장 | 데모 버전 허용. v2에서 암호화 또는 HttpOnly 쿠키 검토 |
| CORS 우회 | Nginx 프록시로 해결 | 특정 도메인만 proxy_pass 허용 |
| XSS (챗봇 렌더링) | React 기본 이스케이프 | dangerouslySetInnerHTML 미사용, 추후 DOMPurify 적용 검토 |
| Anthropic 키 노출 | 브라우저 직접 호출 (dangerouslyAllowBrowser) | 데모 버전 허용. v2에서 BFF 패턴 검토 |
| 콘솔 로그 | 개발 시 axios 요청 로그 노출 가능 | 프로덕션 빌드에서 Vite 코드 트리 쉐이킹으로 최소화 |

---

## 8. 성능 최적화

| 항목 | 전략 | 현황 |
|------|------|------|
| 초기 로드 | Vite 코드 스플리팅 (페이지별 `lazy()`) | ✅ 구현됨 |
| API 중복 호출 방지 | React Query `staleTime: 5분` | ✅ 구현됨 |
| 조회 버튼 패턴 | 드래프트/applied 이중 상태 | ✅ 구현됨 (Sprint 6~7) |
| 자동 새로고침 | `useAutoRefresh` (설정 가능) | ✅ 구현됨 |
| 번들 크기 | Tailwind CSS v4 PurgeCSS | ✅ 자동 적용 |
| 가상 스크롤 | 일감 100건 초과 시 필요 | ⬜ 미구현 (v2 검토) |

---

## 9. 개발 환경 요구사항

| 도구 | 버전 | 용도 |
|------|------|------|
| Node.js | 20+ | 빌드 및 개발 서버 |
| npm | 10+ | 패키지 관리 |
| Docker | 24+ | 로컬 스테이징 및 프로덕션 배포 |
| Git | 2.40+ | 소스 관리 |
