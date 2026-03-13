# 시스템 아키텍처 — 업무 대시보드

> **버전**: v0.1
> **작성일**: 2026-03-13
> **참조**: [PRD.md](PRD.md), [feature-spec.md](feature-spec.md)

---

## 1. 전체 구조 개요

데모 버전은 **프론트엔드 단독 SPA** 구조로, 별도 백엔드 서버 없이 브라우저에서 직접 외부 API를 호출한다.
CORS 이슈는 Vite 개발 프록시 / Nginx 리버스 프록시로 해결한다.

```
┌──────────────────────────────────────────────────────────────────┐
│                        사용자 브라우저                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                React SPA (Vite + TypeScript)              │   │
│  │                                                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │   │
│  │  │ Dashboard│  │ GitLab   │  │ Redmine  │  │Settings │ │   │
│  │  │  Page    │  │  Page    │  │  Page    │  │  Page   │ │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────────┘ │   │
│  │       │              │              │                     │   │
│  │  ┌────▼──────────────▼──────────────▼─────────────────┐ │   │
│  │  │              API 클라이언트 레이어                    │ │   │
│  │  │   gitlabClient   │  redmineClient  │  claudeClient  │ │   │
│  │  └────┬─────────────┴────────┬────────┴───────┬────────┘ │   │
│  │       │                      │                │           │   │
│  └───────┼──────────────────────┼────────────────┼───────────┘   │
│          │  (프록시 경유)         │  (프록시 경유)  │ (직접 호출)  │
└──────────┼──────────────────────┼────────────────┼───────────────┘
           │                      │                │
┌──────────▼──────┐  ┌────────────▼──────┐  ┌──────▼──────────────┐
│  GitLab API     │  │  Redmine API       │  │  Anthropic API      │
│  (ubware 사내)  │  │  (ubware 사내)     │  │  (Claude)           │
└─────────────────┘  └───────────────────┘  └─────────────────────┘
```

---

## 2. 프론트엔드 아키텍처

### 2.1 디렉토리 구조

```
src/
├── api/                    # API 클라이언트 레이어
│   ├── gitlabClient.ts     # GitLab API 함수 모음
│   ├── redmineClient.ts    # Redmine API 함수 모음
│   └── claudeClient.ts     # Anthropic Claude API 연동
│
├── components/             # 재사용 가능한 UI 컴포넌트
│   ├── common/             # 공통 컴포넌트
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── Toast.tsx
│   │   ├── SkeletonLoader.tsx
│   │   └── EmptyState.tsx
│   ├── gitlab/             # GitLab 관련 컴포넌트
│   │   ├── ProjectBranchSelector.tsx
│   │   ├── CommitFilterBar.tsx
│   │   ├── CommitList.tsx
│   │   └── CommitItem.tsx
│   ├── redmine/            # Redmine 관련 컴포넌트
│   │   ├── ProjectVersionSelector.tsx
│   │   ├── IssueFilterBar.tsx
│   │   ├── IssueTree.tsx
│   │   ├── IssueTreeNode.tsx
│   │   └── StatusBadge.tsx
│   └── chatbot/            # 챗봇 관련 컴포넌트
│       ├── ChatbotPanel.tsx
│       ├── ChatMessage.tsx
│       └── SuggestedQuestions.tsx
│
├── pages/                  # 페이지 컴포넌트
│   ├── DashboardPage.tsx
│   ├── GitlabPage.tsx
│   ├── RedminePage.tsx
│   └── SettingsPage.tsx
│
├── store/                  # Zustand 전역 상태
│   ├── settingsStore.ts    # API 설정, 테마, 새로고침 간격
│   ├── gitlabStore.ts      # GitLab 필터/선택 상태
│   └── redmineStore.ts     # Redmine 필터/선택/트리 상태
│
├── hooks/                  # 커스텀 React 훅
│   ├── useGitlabProjects.ts
│   ├── useGitlabCommits.ts
│   ├── useRedmineProjects.ts
│   ├── useRedmineIssues.ts
│   └── useAutoRefresh.ts
│
├── utils/                  # 유틸리티 함수
│   ├── issueTreeBuilder.ts # 평탄 배열 → 트리 변환
│   ├── dateUtils.ts        # 날짜 포맷, 상대 시간
│   └── storageUtils.ts     # 로컬 스토리지 헬퍼
│
├── types/                  # TypeScript 타입 정의
│   ├── gitlab.types.ts
│   ├── redmine.types.ts
│   └── chatbot.types.ts
│
├── App.tsx                 # 라우터 + 레이아웃
├── main.tsx                # 진입점
└── index.css               # Tailwind CSS 설정
```

### 2.2 데이터 흐름

```
사용자 액션
    │
    ▼
페이지 컴포넌트 (상태 변경)
    │
    ├─→ Zustand Store (필터/선택 상태 업데이트)
    │
    └─→ React Query (서버 상태 관리)
            │
            ▼
       API 클라이언트 레이어
            │
            ▼
       외부 API 호출 (GitLab / Redmine / Claude)
            │
            ▼
       캐시 업데이트 → UI 리렌더링
```

### 2.3 상태 관리 전략

| 상태 유형 | 관리 도구 | 저장 위치 |
|----------|----------|----------|
| 서버 데이터 (API 응답) | React Query | 인메모리 캐시 |
| UI 필터/선택 상태 | Zustand | 인메모리 (새로고침 시 로컬 스토리지 복원) |
| API 설정 (토큰 등) | Zustand + 로컬 스토리지 | 영구 저장 |
| 챗봇 대화 이력 | 로컬 스토리지 | 영구 저장 (최대 50건) |

---

## 3. API 클라이언트 설계

### 3.1 공통 Axios 인스턴스

```typescript
// api/gitlabClient.ts
import axios from 'axios';
import { useSettingsStore } from '../store/settingsStore';

const gitlabAxios = axios.create({
  baseURL: '/gitlab-api',  // Vite 프록시 경로
  timeout: 10000,
});

// 요청 인터셉터: 토큰 자동 주입
gitlabAxios.interceptors.request.use((config) => {
  const token = useSettingsStore.getState().gitlab.token;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 에러 표준화
gitlabAxios.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    if (status === 401) throw new Error('GITLAB_UNAUTHORIZED');
    if (status === 403) throw new Error('GITLAB_FORBIDDEN');
    throw new Error('GITLAB_NETWORK_ERROR');
  }
);
```

### 3.2 React Query 훅 패턴

```typescript
// hooks/useGitlabCommits.ts
export function useGitlabCommits(projectId: number, branch: string, filters: CommitFilters) {
  return useInfiniteQuery({
    queryKey: ['gitlab', 'commits', projectId, branch, filters],
    queryFn: ({ pageParam = 1 }) =>
      gitlabClient.getCommits(projectId, branch, { ...filters, page: pageParam }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 50 ? pages.length + 1 : undefined,
    staleTime: 5 * 60 * 1000,   // 5분 캐시
    enabled: !!projectId && !!branch,
  });
}
```

---

## 4. 배포 구조

### 4.1 로컬 개발 환경

```
개발자 PC
├── Vite Dev Server (localhost:5173)
│   └── 프록시: /gitlab-api → https://gitlab.ubware.com/api/v4
│           /redmine-api → https://redmine.ubware.com
└── 브라우저
```

### 4.2 프로덕션 환경 (Docker + Nginx)

```
프로덕션 서버
└── Docker Compose
    └── nginx 컨테이너
        ├── 정적 파일 서빙 (빌드된 React SPA)
        └── 리버스 프록시
            ├── /gitlab-api/* → https://gitlab.ubware.com/api/v4/*
            └── /redmine-api/* → https://redmine.ubware.com/*
```

```nginx
# nginx.conf
server {
    listen 80;

    # React SPA
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # GitLab API 프록시
    location /gitlab-api/ {
        proxy_pass https://gitlab.ubware.com/api/v4/;
        proxy_set_header Host gitlab.ubware.com;
        proxy_ssl_server_name on;
    }

    # Redmine API 프록시
    location /redmine-api/ {
        proxy_pass https://redmine.ubware.com/;
        proxy_set_header Host redmine.ubware.com;
        proxy_ssl_server_name on;
    }
}
```

### 4.3 Docker 구성

```yaml
# docker-compose.yml (로컬 개발)
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./src:/app/src  # 핫 리로드용 볼륨 마운트

# docker-compose.prod.yml (프로덕션)
services:
  nginx:
    image: ghcr.io/{GITHUB_ORG}/{PROJECT}-frontend:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/nginx/ssl  # SSL 인증서
```

---

## 5. 보안 고려사항

| 항목 | 위험 | 대응 방법 |
|------|------|----------|
| API 토큰 노출 | 로컬 스토리지 평문 저장 | 데모 버전 허용, v2에서 암호화 예정 |
| CORS 우회 | Nginx 프록시 설정 오류 | 특정 도메인만 프록시 허용 |
| XSS | 챗봇 마크다운 렌더링 | DOMPurify로 HTML 새니타이징 |
| 토큰 로그 노출 | 콘솔/네트워크 탭 | 프로덕션 빌드에서 콘솔 로그 비활성화 |

---

## 6. 성능 최적화 계획

| 항목 | 전략 |
|------|------|
| 초기 로드 | Vite 코드 스플리팅 (페이지별 lazy import) |
| 대용량 트리 | `react-virtual` 가상 스크롤 (일감 100건 초과 시) |
| API 중복 호출 | React Query staleTime 5분 설정 |
| 이미지 | 아바타는 GitLab/Redmine 제공 URL 사용 (외부 CDN) |
| 번들 크기 | shadcn/ui 트리 쉐이킹, Tailwind PurgeCSS |
