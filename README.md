# 업무 대시보드 (Daily Work Dashboard)

[![CI](https://github.com/frogy95/choiji-guide-big/actions/workflows/ci.yml/badge.svg)](https://github.com/frogy95/choiji-guide-big/actions/workflows/ci.yml)

> GitLab 커밋 이력 + Redmine 일감 + Claude AI 챗봇을 통합한 업무 현황 대시보드

매일 출근 후 **오늘 해야 할 일과 팀의 진행 상황**을 한 화면에서 빠르게 파악할 수 있는 SPA입니다.
별도 백엔드 서버 없이 브라우저에서 Vite/Nginx 프록시를 통해 외부 API를 직접 호출합니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 대시보드 홈 | 담당일감·커밋·진행중·기한초과 요약 카드 (클릭 시 상세 패널) + 최근 활동 피드 (기간/작성자 필터) |
| GitLab 커밋 이력 | 프로젝트/브랜치별 커밋 목록, 작성자 드롭다운·기간·키워드 필터, 무한 스크롤 |
| Redmine 일감 트리 | 상위→하위 일감 트리 뷰, 목표 버전별 조회, 담당자/상태/우선순위/키워드 필터, 완료율·마감 임박 배너 |
| AI 챗봇 | 로드된 업무 데이터를 컨텍스트로 Claude에게 자연어 질의, 스트리밍 응답, 대화 이력 유지 |
| 설정 | API 토큰 관리, 연결 테스트, 테마(라이트/다크/시스템)/자동 새로고침 설정 |
| 온보딩 모달 | 최초 실행 시 3단계 API 키 설정 가이드 (GitLab Token → Redmine API Key → Anthropic Key) |

---

## 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| 빌드 도구 | Vite | ^6.2.0 |
| 프레임워크 | React | ^19.0.0 |
| 언어 | TypeScript | ~5.7.2 |
| 스타일 | Tailwind CSS v4 (Vite 플러그인) | ^4.0.9 |
| 상태 관리 (클라이언트) | Zustand | ^5.0.3 |
| 상태 관리 (서버) | TanStack React Query | ^5.67.2 |
| HTTP 클라이언트 | axios | ^1.7.9 |
| 라우터 | react-router-dom | ^7.2.0 |
| AI SDK | @anthropic-ai/sdk | ^0.36.3 |
| 아이콘 | lucide-react | ^0.475.0 |
| 런타임 | Node.js | 20 |

> 별도 백엔드 서버 없음. 브라우저에서 GitLab/Redmine API를 Vite 개발 프록시 / Nginx 리버스 프록시를 통해 직접 호출합니다.

---

## 빠른 시작

```bash
# 1. 저장소 클론
git clone https://github.com/frogy95/choiji-guide-big.git
cd choiji-guide-big

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local 에 GitLab URL/토큰, Redmine URL/API Key, Anthropic API Key 입력

# 3. 의존성 설치 및 개발 서버 실행
npm install
npm run dev
# → http://localhost:5173
```

자세한 설정 방법은 [`docs/setup-guide.md`](docs/setup-guide.md) 참조.

---

## 프로젝트 구조

```
.
├── src/
│   ├── api/                     # API 클라이언트
│   │   ├── gitlabClient.ts      # GitLab API (Bearer 토큰, /gitlab-api 프록시)
│   │   ├── redmineClient.ts     # Redmine API (X-Redmine-API-Key, /redmine-api 프록시)
│   │   ├── claudeClient.ts      # Anthropic SDK (dangerouslyAllowBrowser, 스트리밍)
│   │   └── connectionTest.ts    # 설정 페이지 연결 테스트 함수
│   ├── components/
│   │   ├── common/              # Sidebar, TopBar, Toast, OnboardingModal, ErrorBoundary
│   │   ├── dashboard/           # SummaryDetailPanel (요약 카드 상세 슬라이드인 패널)
│   │   ├── gitlab/              # ProjectBranchSelector, CommitFilterBar, CommitList/Item
│   │   ├── redmine/             # ProjectVersionSelector, IssueFilterBar, IssueTree/Node
│   │   └── chatbot/             # ChatbotPanel, ChatMessage, SuggestedQuestions
│   ├── pages/                   # DashboardPage, GitlabPage, RedminePage, SettingsPage
│   ├── store/                   # Zustand 전역 상태 (settings, gitlab, redmine, chatbot)
│   ├── hooks/                   # 커스텀 훅 (useGitlabCommits, useRedmineIssues, useAutoRefresh 등)
│   ├── utils/                   # issueTreeBuilder, 날짜 포맷 유틸
│   └── types/                   # TypeScript 타입 정의
├── .claude/
│   ├── agents/                  # Claude 전용 에이전트 정의 (sprint-planner, sprint-close 등)
│   └── skills/                  # 커스텀 스킬 (karpathy-guidelines, writing-plans 등)
├── .github/
│   └── workflows/
│       ├── ci.yml               # PR 체크 (ESLint + TypeScript + 빌드 + Docker)
│       └── deploy.yml           # main push → GHCR 이미지 빌드 → SSH 자동 배포
├── docs/
│   ├── PRD.md                   # 제품 요구사항 정의서
│   ├── feature-spec.md          # 화면별 기능 상세 설계
│   ├── architecture.md          # 시스템 아키텍처 (레이어, 데이터 흐름, 상태 전략)
│   ├── setup-guide.md           # 환경 설정 가이드
│   ├── dev-process.md           # 개발 프로세스 Single Source of Truth
│   ├── ci-policy.md             # CI/CD 파이프라인 정책
│   ├── sprint/                  # 스프린트별 계획/완료 문서
│   └── deploy-history/          # 배포 기록 아카이브
├── CLAUDE.md                    # Claude Code 프로젝트 지시 파일 (AI-Native 개발 규칙)
├── ROADMAP.md                   # Sprint 1~8 완료 로드맵
├── deploy.md                    # 현재 미완료 수동 검증 항목
└── .env.example                 # 환경변수 템플릿
```

---

## AI-Native 개발 방식

이 프로젝트는 **Claude Code + 전용 에이전트**를 활용하여 계획→구현→마무리 전 과정을 자동화합니다.

### 전용 에이전트

| 에이전트 | 역할 |
|---------|------|
| `sprint-planner` | ROADMAP.md 분석 → `docs/sprint/sprint{N}.md` 계획 문서 자동 수립 |
| `sprint-close` | ROADMAP 업데이트 → `develop` PR → 코드 리뷰 → 자동 검증 → deploy.md 기록 |
| `hotfix-close` | `main` PR → 경량 검증 → deploy.md 기록 → develop 역머지 안내 |
| `deploy-prod` | `develop → main` PR → 사전 점검 → 배포 후 실서버 검증 |
| `prd-to-roadmap` | PRD 문서 → Sprint 구조의 ROADMAP.md 자동 생성 |
| `code-reviewer` | 구현 완료 단계에서 계획 대비 코드 리뷰 수행 |

### 개발 워크플로우

```
# Sprint (새 기능)
사용자: "다음 스프린트 계획 세워줘"
→ sprint-planner 에이전트 → docs/sprint/sprint{N}.md 생성
→ git checkout -b sprint{N}
→ 구현 작업 (Claude Code + 에이전트)
→ sprint-close 에이전트 → develop PR + 코드 리뷰 + 검증

# Hotfix (긴급 패치)
git checkout main -b hotfix/{설명}
→ 수정 작업
→ hotfix-close 에이전트 → main PR + 타겟 검증

# 프로덕션 배포 (QA 완료 후)
→ deploy-prod 에이전트 → develop → main PR + 실서버 검증
```

상세 규칙: [`CLAUDE.md`](CLAUDE.md), [`docs/dev-process.md`](docs/dev-process.md) 참조.

---

## GitHub Actions

### CI (`ci.yml`) — PR to develop/main 시 자동 실행

| Job | 의존 | 내용 |
|-----|------|------|
| `lint-and-typecheck` | — | ESLint (`--max-warnings 0`) + TypeScript strict 타입 체크 |
| `test` | lint-and-typecheck | Vitest 단위 테스트 45건 (utils, store, api) |
| `build` | lint-and-typecheck, test | Vite 프로덕션 빌드 검증 (더미 환경변수 주입) |
| `docker-build` | — | Dockerfile 빌드 성공 여부 확인 |

### CD (`deploy.yml`) — main push 시 자동 실행

1. Docker 이미지 빌드 (React SPA → Nginx 서빙)
2. GHCR(GitHub Container Registry)에 이미지 push (`latest` + `{commit-sha}` 태그)
3. SSH로 프로덕션 서버 접속 → `docker compose pull && docker compose up -d`

---

## 데모 모드

API 키 없이 샘플 데이터로 전체 기능을 체험할 수 있습니다.

```bash
# 데모 모드로 개발 서버 실행
VITE_DEMO_MODE=true npm run dev
```

데모 모드에서는:
- GitLab/Redmine/Anthropic API를 실제로 호출하지 않습니다
- 미리 준비된 한국어 샘플 데이터가 모든 화면에 자동으로 표시됩니다
- 온보딩 모달이 표시되지 않습니다 (API 키 불필요)
- 챗봇 제외 모든 기능(필터, 조회, 트리 뷰 등)이 정상 동작합니다

---

## 경쟁 도구 비교

| 항목 | 본 대시보드 | Jira | Linear | Asana |
|------|-----------|------|--------|-------|
| GitLab 커밋 조회 | ✅ 내장 | ❌ (플러그인) | ❌ | ❌ |
| Redmine 연동 | ✅ 내장 | ❌ | ❌ | ❌ |
| AI 자연어 질의 | ✅ Claude 챗봇 | ⚠️ 유료 Atlassian AI | ⚠️ Linear AI (영문) | ⚠️ 유료 |
| 설치 인프라 | 브라우저 SPA | SaaS/서버 | SaaS | SaaS |
| 데이터 외부 전송 | ❌ (사내망 유지) | ✅ (클라우드) | ✅ (클라우드) | ✅ (클라우드) |
| 온프레미스 GitLab | ✅ | ⚠️ Data Center 필요 | ❌ | ❌ |
| 커스텀 필터/트리 뷰 | ✅ | ⚠️ 복잡한 JQL | ⚠️ 제한적 | ⚠️ 제한적 |
| 라이선스 비용 | 무료 (오픈소스) | 유료 | 유료 | 유료 |

> 사내망 GitLab + Redmine 환경에서 데이터를 외부로 내보내지 않으면서 AI 어시스턴트를 활용할 수 있는 유일한 통합 솔루션입니다.

---

## 환경변수

`.env.example` 복사 후 `.env.local`에 작성하세요.

| 변수 | 필수 | 설명 |
|------|------|------|
| `VITE_GITLAB_URL` | ✅ | GitLab 인스턴스 URL (예: `https://gitlab.example.com`) |
| `VITE_GITLAB_TOKEN` | ✅ | GitLab Personal Access Token (`read_api` 권한) |
| `VITE_REDMINE_URL` | ✅ | Redmine 인스턴스 URL |
| `VITE_REDMINE_API_KEY` | ✅ | Redmine API Access Key |
| `VITE_ANTHROPIC_API_KEY` | — | Anthropic API Key (챗봇 기능에만 필요) |
| `VITE_CLAUDE_MODEL` | — | Claude 모델 ID (기본: `claude-haiku-4-5`) |

---

## 참고 문서

| 문서 | 내용 |
|------|------|
| [`docs/PRD.md`](docs/PRD.md) | 제품 요구사항 정의서 (문제 정의, 기능 요구사항, 비기능 요구사항) |
| [`docs/architecture.md`](docs/architecture.md) | 시스템 아키텍처, 레이어 구조, 상태 관리 전략, 배포 구조 |
| [`docs/feature-spec.md`](docs/feature-spec.md) | 화면별 기능 상세 설계 |
| [`docs/setup-guide.md`](docs/setup-guide.md) | 로컬 환경 설정 가이드 |
| [`docs/dev-process.md`](docs/dev-process.md) | 개발 프로세스 Single Source of Truth (검증 매트릭스, 코드 리뷰, 배포 절차) |
| [`docs/ci-policy.md`](docs/ci-policy.md) | CI/CD 파이프라인 정책, GitHub Secrets, 롤백 절차 |
| [`ROADMAP.md`](ROADMAP.md) | Sprint 1~8 개발 로드맵 |
