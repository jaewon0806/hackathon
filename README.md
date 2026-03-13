# 업무 대시보드 (Daily Work Dashboard)

> GitLab 커밋 이력 + Redmine 일감 + AI 챗봇을 통합한 업무 현황 대시보드

매일 출근 후 오늘 해야 할 일과 팀의 진행 상황을 **한 화면**에서 빠르게 파악할 수 있는 SPA입니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 대시보드 홈 | 담당 일감·커밋·기한 초과 요약 카드 + 최근 활동 피드 |
| GitLab 커밋 이력 | 프로젝트/브랜치별 최근 1주일 커밋 목록, 작성자/기간/키워드 필터 |
| Redmine 일감 트리 | 상위→하위 일감 트리 뷰, 목표 버전별 조회, 담당자/상태/우선순위 필터 |
| AI 챗봇 | 로드된 업무 데이터를 기반으로 Claude에게 자연어 질의 |
| 설정 | API 토큰 관리, 연결 테스트, 테마/자동새로고침 설정 |

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | React 18 + TypeScript (Vite) |
| 상태 관리 | Zustand + React Query |
| 스타일 | Tailwind CSS + shadcn/ui |
| AI | Anthropic Claude API |
| 배포 | Docker + Nginx (정적 SPA + API 프록시) |

> 별도 백엔드 서버 없음. 브라우저에서 GitLab/Redmine API를 Nginx 프록시를 통해 직접 호출합니다.

---

## 빠른 시작

```bash
# 1. 저장소 클론
git clone https://github.com/frogy95/choiji-guide-big.git
cd choiji-guide-big

# 2. 환경변수 설정
cp .env.example .env
# .env 파일에 GitLab 토큰, Redmine API Key, Anthropic API Key 입력

# 3. 개발 서버 실행
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
│   ├── api/                # API 클라이언트 (GitLab / Redmine / Claude)
│   ├── components/         # UI 컴포넌트
│   │   ├── common/         # Sidebar, TopBar, Toast, SkeletonLoader
│   │   ├── gitlab/         # CommitList, CommitItem, CommitFilterBar
│   │   ├── redmine/        # IssueTree, IssueTreeNode, StatusBadge
│   │   └── chatbot/        # ChatbotPanel, ChatMessage
│   ├── pages/              # DashboardPage, GitlabPage, RedminePage, SettingsPage
│   ├── store/              # Zustand 전역 상태
│   ├── hooks/              # 커스텀 React 훅
│   ├── utils/              # 트리 변환, 날짜 포맷 등
│   └── types/              # TypeScript 타입 정의
├── .claude/
│   ├── agents/             # Claude 에이전트 정의
│   └── skills/             # 커스텀 스킬
├── .github/
│   └── workflows/
│       ├── ci.yml          # PR 체크 (lint + TypeScript + 빌드)
│       └── deploy.yml      # main 머지 시 프로덕션 자동 배포
├── docs/
│   ├── PRD.md              # 제품 요구사항
│   ├── feature-spec.md     # 기능 상세 설계
│   ├── architecture.md     # 시스템 아키텍처
│   ├── setup-guide.md      # 환경 설정 가이드
│   ├── dev-process.md      # 개발 프로세스 (Single Source of Truth)
│   ├── ci-policy.md        # CI/CD 정책
│   ├── sprint/             # 스프린트 계획/완료 문서
│   └── deploy-history/     # 배포 기록 아카이브
├── CLAUDE.md               # Claude Code 프로젝트 지시
├── ROADMAP.md              # 스프린트 로드맵
├── deploy.md               # 현재 미완료 수동 검증 항목
└── .env.example            # 환경변수 템플릿
```

---

## Claude 에이전트

이 프로젝트는 Claude Code와 함께 사용하도록 5개의 전용 에이전트를 포함합니다.

### sprint-planner
ROADMAP.md를 분석하여 실행 가능한 스프린트 계획(`docs/sprint/sprint{N}.md`)을 자동 수립합니다.

```
사용자: "다음 스프린트에서 GitLab 커밋 기능 구현하고 싶어"
→ docs/sprint/sprint2.md 계획 문서 자동 생성
```

### sprint-close
스프린트 마무리 작업 전체를 자동화합니다 (ROADMAP 업데이트 → `develop` PR → 코드 리뷰 → 검증 → deploy.md).

```
사용자: "sprint 2 구현 끝났어. 마무리 작업 해줘"
→ PR 생성부터 검증까지 자동 처리
```

### hotfix-close
경량 마무리. ROADMAP 업데이트 없이 `main`으로 직접 PR 생성 + 타겟 검증.

### deploy-prod
`develop` → `main` PR 생성, 사전 점검, 배포 후 실서버 검증.

### prd-to-roadmap
PRD 문서를 분석해 Sprint 구조의 ROADMAP.md를 자동 생성합니다.

---

## 개발 워크플로우

### Sprint 흐름

```
sprint-planner → docs/sprint/sprint{N}.md 생성
git checkout -b sprint{N}
구현 작업...
sprint-close → develop PR + 검증
QA 통과 후 deploy-prod → main 배포
```

### Hotfix 흐름

```
git checkout -b hotfix/{설명}  (main 기반)
긴급 수정...
hotfix-close → main PR + 타겟 검증 + develop 역머지 안내
```

자세한 내용은 [`docs/dev-process.md`](docs/dev-process.md) 참조.

---

## GitHub Actions

### CI (`ci.yml`)
PR이 `develop` / `main`으로 올라오면 자동 실행:
- ESLint + TypeScript 타입 체크
- Vite 프로덕션 빌드 검증
- Docker 이미지 빌드 테스트

### CD (`deploy.yml`)
`main`에 push되면 자동 실행:
- Docker 이미지 빌드 (React 빌드 → Nginx 서빙) → GHCR push
- SSH로 프로덕션 서버 배포

---

## 환경변수 (`.env.example` 참조)

| 변수 | 설명 |
|------|------|
| `VITE_GITLAB_URL` | GitLab 인스턴스 URL |
| `VITE_GITLAB_TOKEN` | GitLab Personal Access Token (read_api) |
| `VITE_REDMINE_URL` | Redmine 인스턴스 URL |
| `VITE_REDMINE_API_KEY` | Redmine API Access Key |
| `VITE_ANTHROPIC_API_KEY` | Anthropic API Key |
| `VITE_CLAUDE_MODEL` | Claude 모델 ID |

---

## 참고 문서

| 문서 | 내용 |
|------|------|
| [`docs/PRD.md`](docs/PRD.md) | 제품 요구사항 정의서 |
| [`docs/feature-spec.md`](docs/feature-spec.md) | 화면별 기능 상세 설계 |
| [`docs/architecture.md`](docs/architecture.md) | 시스템 아키텍처 및 디렉토리 구조 |
| [`docs/setup-guide.md`](docs/setup-guide.md) | 로컬 환경 설정 가이드 |
| [`ROADMAP.md`](ROADMAP.md) | Sprint별 개발 로드맵 |
