# Sprint 2 완료 보고서 — GitLab 커밋 이력

> **브랜치**: `sprint2`
> **목표**: GitLab API 연동 + 프로젝트/브랜치 선택 + 커밋 목록 + 필터링
> **상태**: ✅ 완료
> **완료일**: 2026-03-13
> **PR**: sprint2 → develop

---

## 구현 요약

### API 레이어

| 파일 | 설명 |
|------|------|
| `src/api/gitlabClient.ts` | axios 인스턴스 + Bearer 토큰 인터셉터. 401 → `GITLAB_UNAUTHORIZED`, 403 → `GITLAB_FORBIDDEN`, 기타 → `GITLAB_NETWORK_ERROR`로 구조화된 에러 throw |
| `src/types/gitlab.types.ts` | `GitlabProject`, `GitlabBranch`, `GitlabCommit`, `GitlabUser`, `CommitFilters` 타입 정의 |

### React Query 훅

| 파일 | 설명 |
|------|------|
| `src/hooks/useGitlabProjects.ts` | `useQuery` — 토큰 없을 시 `enabled: false`, `staleTime: 5분` |
| `src/hooks/useGitlabBranches.ts` | `useQuery` — projectId 없을 시 `enabled: false`, `staleTime: 5분` |
| `src/hooks/useGitlabCommits.ts` | `useInfiniteQuery` — 페이지당 50건, 마지막 페이지 50건 미만 시 nextPage 없음 처리 |

### 컴포넌트

| 컴포넌트 | 위치 | 설명 |
|---------|------|------|
| `ProjectBranchSelector` | `src/components/gitlab/` | 프로젝트/브랜치 드롭다운. 브랜치 목록 로드 후 main/master 우선으로 기본 브랜치 자동 선택 |
| `CommitFilterBar` | `src/components/gitlab/` | 작성자(텍스트), 기간(date from~to), 키워드(검색) 필터. Zustand gitlabStore 연동 |
| `CommitItem` | `src/components/gitlab/` | 커밋 해시(code), 메시지, Gravatar 아바타, 상대 시간, +additions/-deletions, GitLab 외부 링크 |
| `CommitList` | `src/components/gitlab/` | Intersection Observer 무한 스크롤. 빈 상태 UI 포함 |
| `CommitSkeleton` | `src/components/common/SkeletonLoader.tsx` | 8개 펄스 아이템 스켈레톤. `CardSkeleton`도 함께 구현 (Sprint 4 대시보드 예비) |

### 스토어 및 상태

| 파일 | 설명 |
|------|------|
| `src/store/gitlabStore.ts` | `selectedProjectId`, `selectedBranch` → `gitlab_last_selection` 키로 로컬 스토리지 persist. 필터(`authorFilter`, `dateRange`, `keyword`)는 메모리 only |

### 페이지

| 파일 | 설명 |
|------|------|
| `src/pages/GitlabPage.tsx` | 토큰 미설정 → 설정 페이지 안내. 프로젝트/브랜치 미선택 → 선택 안내. 로딩 → `CommitSkeleton`. 에러 → 코드별 한국어 메시지. 정상 → `CommitList` |

---

## 완료 기준 검증

| 항목 | 결과 |
|------|------|
| 프로젝트 선택 → 브랜치 목록 자동 갱신 | ✅ `useGitlabBranches(projectId)` projectId 의존 쿼리 |
| 기본 브랜치 자동 선택 | ✅ main/master 우선, 없으면 첫 번째 브랜치 |
| 최근 7일 커밋 목록 정상 표시 | ✅ `gitlabStore` 기본 dateRange 오늘 기준 -7일 |
| 작성자 필터 선택 시 목록 필터링 | ✅ `CommitFilterBar` → `gitlabStore` → `useGitlabCommits` queryKey 연동 |
| `npm run lint && typecheck && build` | ✅ 모두 통과 |

---

## 코드 리뷰 결과

**Critical/High 이슈**: 없음

**Medium 이슈 (추후 개선 참고)**

1. **`commit.web_url` XSS 가능성** — `CommitItem.tsx`에서 GitLab 서버로부터 받은 `web_url`을 anchor href에 직접 사용. GitLab self-hosted 서버를 신뢰하는 환경에서는 실질적 위험이 낮으나, Sprint 5에서 URL 검증 유틸(`/^https?:\/\//` 패턴 검사) 추가 권장.
2. **`formatRelativeTime` 음수 처리 미흡** — 미래 날짜 커밋 시(클록 스큐 등) 음수 분을 그대로 표시. 예: "-3분 전". 0 이하이면 "방금 전"으로 클램핑 처리 권장.

---

## 검증 결과

### 자동 검증

- ⬜ Docker 미실행으로 자동 검증 미수행

### 수동 검증 필요 항목

- ⬜ 브라우저에서 GitLab 페이지(/gitlab) 접속 후 프로젝트 목록 표시 확인
- ⬜ 프로젝트 선택 시 브랜치 목록 자동 갱신 확인 (기본 브랜치 자동 선택 포함)
- ⬜ 커밋 목록 정상 표시 및 Intersection Observer 무한 스크롤 동작 확인
- ⬜ 작성자/기간/키워드 필터 적용 시 목록 필터링 동작 확인
- ⬜ 토큰 미설정 시 안내 메시지 표시 확인
- ⬜ 401/403/네트워크 에러 메시지 분기 표시 확인
- ⬜ UI 디자인 / 시각적 품질 판단

검증 현황: `docs/deploy.md` 참조

---

## 첨부 파일

스크린샷 및 보고서: `docs/sprint/sprint2/`
