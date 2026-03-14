# ROADMAP — 업무 대시보드

> **목표**: GitLab + Redmine + AI 챗봇을 통합한 데모 버전 일정관리 대시보드 완성
> **기술 스택**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand + React Query
> **참조**: [PRD.md](docs/PRD.md) | [feature-spec.md](docs/feature-spec.md) | [architecture.md](docs/architecture.md)

---

## 마일스톤 개요

| 마일스톤 | 목표 | 상태 |
|---------|------|------|
| M1 | 프로젝트 기반 구축 (Sprint 1) | ✅ 완료 |
| M2 | GitLab 커밋 이력 기능 (Sprint 2) | ✅ 완료 |
| M3 | Redmine 일감 트리 (Sprint 3) | ✅ 완료 |
| M4 | AI 챗봇 + 대시보드 홈 (Sprint 4) | ✅ 완료 |
| M5 | UI 다듬기 + 배포 (Sprint 5) | ✅ 완료 |
| M6 | API 키 온보딩 + 조회 버튼 + UI 모던화 (Sprint 6) | ✅ 완료 |

---

## Sprint 1 — 프로젝트 기반 구축

> **목표**: React + TypeScript 프로젝트 초기 설정, 라우팅, 레이아웃, 설정 화면
> **상태**: ✅ 완료 (2026-03-13)
> **브랜치**: `sprint1`

### 작업 목록

- ✅ Vite + React 18 + TypeScript 프로젝트 초기화
- ✅ Tailwind CSS + shadcn/ui 설치 및 설정
- ✅ Zustand + React Query 설치 및 Provider 설정
- ✅ Sidebar + TopBar 공통 레이아웃 컴포넌트 구현
- ✅ 라우터 설정 (react-router-dom): /, /gitlab, /redmine, /settings
- ✅ SCR-004 설정 페이지 구현 (API 토큰 입력 + 로컬 스토리지 저장)
- ✅ GitLab / Redmine 연결 테스트 기능 구현
- ✅ Vite 프록시 설정 (CORS 해결)
- ✅ Docker + Nginx 설정 파일 작성
- ✅ .env.example 파일 작성
- ✅ Toast 알림 컴포넌트 구현
- ✅ 테마 (라이트/다크/시스템) 전환 기능

### 완료 기준

- 로컬에서 npm run dev 실행 후 사이드바 네비게이션이 정상 동작
- 설정 화면에서 GitLab 토큰 입력 후 연결 테스트 성공
- 다크모드 전환 동작 확인

---

## Sprint 2 — GitLab 커밋 이력

> **목표**: GitLab API 연동 + 프로젝트/브랜치 선택 + 커밋 목록 + 필터링
> **상태**: ✅ 완료 (2026-03-13)
> **브랜치**: `sprint2`

### 작업 목록

- ✅ GitLab API 클라이언트 (src/api/gitlabClient.ts) 구현
- ✅ useGitlabProjects, useGitlabBranches, useGitlabCommits 훅 구현
- ✅ ProjectBranchSelector 컴포넌트 (드롭다운 연동)
- ✅ CommitFilterBar 컴포넌트 (작성자/기간/키워드 필터)
- ✅ CommitList + CommitItem 컴포넌트
- ✅ 더 불러오기 (Infinite Scroll)
- ✅ 로딩 스켈레톤 + 빈 상태 UI
- ✅ 마지막 선택 값 로컬 스토리지 저장

### 완료 기준

- 프로젝트 선택 → 브랜치 목록 자동 갱신
- 최근 7일 커밋 목록 정상 표시
- 작성자 필터 선택 시 목록 필터링 동작

---

## Sprint 3 — Redmine 일감 트리

> **목표**: Redmine API 연동 + 프로젝트/버전 선택 + 트리 뷰 + 필터링
> **상태**: ✅ 완료 (2026-03-13)
> **브랜치**: `sprint3`

### 작업 목록

- ✅ Redmine API 클라이언트 (src/api/redmineClient.ts) 구현
- ✅ useRedmineProjects, useRedmineVersions, useRedmineIssues 훅 구현
- ✅ 트리 변환 유틸 (issueTreeBuilder.ts) 구현
- ✅ ProjectVersionSelector 컴포넌트
- ✅ VersionProgressBar 컴포넌트 (전체 완료율)
- ✅ DueSoonBanner 컴포넌트 (3일 이내 마감 경고)
- ✅ IssueFilterBar 컴포넌트 (담당자/상태/우선순위/키워드)
- ✅ IssueTree + IssueTreeNode 컴포넌트 (재귀, 펼치기/접기)
- ✅ 로딩 스켈레톤 + 빈 상태 UI

### 완료 기준

- 프로젝트 + 목표 버전 선택 후 일감 트리 표시
- 하위 일감 펼치기/접기 동작
- 상태 필터 적용 시 트리 필터링

---

## Sprint 4 — AI 챗봇 + 대시보드 홈

> **목표**: Anthropic Claude API 연동 챗봇 + 대시보드 홈 요약 카드
> **상태**: ✅ 완료 (2026-03-13)
> **브랜치**: `sprint4`

### 작업 목록

**챗봇**
- ✅ Anthropic Claude API 클라이언트 (src/api/claudeClient.ts) 구현
- ✅ ChatbotPanel 플로팅 컴포넌트 (우하단 고정, 펼치기/접기)
- ✅ ChatMessage 컴포넌트 (마크다운 렌더링, DOMPurify 적용)
- ✅ SuggestedQuestions 컴포넌트 (추천 질문 칩)
- ✅ 대화 이력 로컬 스토리지 저장 (최대 50건)
- ✅ 새 대화 초기화 버튼

**대시보드 홈**
- ✅ 요약 카드 4종 (담당 일감 / 이번 주 커밋 / 진행 중 / 기한 초과)
- ✅ 최근 활동 피드 (GitLab + Redmine 혼합, 시간순)
- ✅ 로딩 스켈레톤 UI

### 완료 기준

- 챗봇 패널 펼침 → 질문 입력 → Claude 스트리밍 응답 표시
- 현재 로드된 Redmine 일감 데이터 기반으로 챗봇이 답변
- 대시보드 홈 요약 카드 정상 표시

---

## Sprint 5 — UI 다듬기 + 배포

> **목표**: 전체 UI 품질 개선, 성능 최적화, Docker 프로덕션 배포
> **상태**: ✅ 완료 (2026-03-13)
> **브랜치**: `sprint5`

### 작업 목록

**UI/UX 개선**
- ✅ 반응형 레이아웃 (768px 기준 모바일 대응)
- ✅ 자동 새로고침 기능 (useAutoRefresh 훅)
- ✅ 에러 바운더리 (ErrorBoundary) 적용
- ✅ 빈 상태 일러스트 + 안내 문구 통일
- ✅ 접근성: ARIA 레이블, 키보드 네비게이션

**성능**
- ✅ 페이지별 lazy import (코드 스플리팅)
- ✅ 대용량 트리 가상 스크롤 (react-virtual)

**배포**
- ✅ Dockerfile 멀티스테이지 빌드 작성
- ✅ docker-compose.prod.yml 작성
- ✅ GitHub Actions 워크플로 작성 (main push → GHCR 빌드 → 서버 배포)
- ✅ SSL 설정 (Let's Encrypt)
- ✅ 프로덕션 배포 및 실서버 검증

### 완료 기준

- docker compose -f docker-compose.prod.yml up -d 정상 실행
- 브라우저에서 http://{서버IP} 접속 후 전체 기능 동작
- Lighthouse 성능 점수 80점 이상

---

## Sprint 6 — API 키 온보딩 + 조회 버튼 + UI 모던화

> **목표**: 최초 실행 온보딩 경험 개선, 필터링 UX 개선, 전체적인 UI 모던화
> **상태**: ✅ 완료 (2026-03-14)
> **브랜치**: `sprint6`

### 작업 목록

- ✅ API 키 온보딩 모달 (OnboardingModal.tsx) — 3단계 스텝 UI, 연결 테스트, Anthropic 건너뛰기
- ✅ 필터링 "조회" 버튼 추가 — gitlabStore/redmineStore에 applied 상태 추가, CommitFilterBar/IssueFilterBar에 조회 버튼 + Enter 키 지원
- ✅ UI 모던화 — 커스텀 스크롤바, Sidebar 그라데이션, TopBar backdrop-blur, DashboardPage 카드 개선, 반응형 레이아웃

### 완료 기준

- 최초 실행 시 온보딩 모달이 표시되며 3단계 진행 가능
- 필터바에서 Enter 또는 조회 버튼 클릭 시에만 API 호출 발생
- 커스텀 스크롤바, 그라데이션 Sidebar, backdrop-blur TopBar 적용 확인

---

## 버전 히스토리

| 버전 | 내용 | 날짜 |
|------|------|------|
| v0.1 | 프로젝트 최초 설정 및 ROADMAP 작성 | 2026-03-13 |
| v0.6 | Sprint 6 완료 — 온보딩 모달 + 조회 버튼 + UI 모던화 | 2026-03-14 |
