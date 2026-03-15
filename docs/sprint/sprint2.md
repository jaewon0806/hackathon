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
| `src/api/gitlabClient.ts` | GitLab REST API 클라이언트 (Bearer 토큰 인증, /gitlab-api 프록시 경유) |
| `src/types/gitlab.types.ts` | GitLabProject, GitLabBranch, GitlabCommit 타입 정의 |

### React Query 훅

| 훅 | 설명 |
|----|------|
| `useGitlabProjects` | 접근 가능한 전체 프로젝트 목록 조회 |
| `useGitlabBranches` | 선택된 프로젝트의 브랜치 목록 조회 |
| `useGitlabCommits` | 브랜치 + 필터 기반 커밋 목록 무한 스크롤 조회 (useInfiniteQuery) |

### 상태 관리 (Zustand)

- `src/store/gitlabStore.ts` 신규 생성
- Draft/Applied 이중 상태 패턴: 필터 입력 → 조회 버튼 클릭 시 applied 상태로 복사 → API 호출
- 선택된 프로젝트/브랜치 로컬 스토리지 persist

### 컴포넌트

| 컴포넌트 | 설명 |
|---------|------|
| `ProjectBranchSelector` | 프로젝트 드롭다운 → 브랜치 드롭다운 연동, 선택값 store 저장 |
| `CommitFilterBar` | 작성자/기간/키워드 필터 입력, 조회 버튼, Enter 키 지원 |
| `CommitList` | useGitlabCommits 데이터 렌더링, 무한 스크롤 트리거 |
| `CommitItem` | 커밋 해시, 메시지, 작성자, 날짜, 변경 파일 수 표시 |

### GitlabPage

- `src/pages/GitlabPage.tsx` 신규 생성
- ProjectBranchSelector + CommitFilterBar + CommitList 통합
- 로딩 스켈레톤 + 빈 상태 UI

---

## 변경 파일 목록

```
src/api/gitlabClient.ts         (신규)
src/types/gitlab.types.ts       (신규)
src/store/gitlabStore.ts        (신규)
src/hooks/useGitlabProjects.ts  (신규)
src/hooks/useGitlabBranches.ts  (신규)
src/hooks/useGitlabCommits.ts   (신규)
src/components/gitlab/ProjectBranchSelector.tsx  (신규)
src/components/gitlab/CommitFilterBar.tsx        (신규)
src/components/gitlab/CommitList.tsx             (신규)
src/components/gitlab/CommitItem.tsx             (신규)
src/pages/GitlabPage.tsx        (신규)
vite.config.ts                  (수정: /gitlab-api 프록시 추가)
```

---

## 검증 결과

| 항목 | 결과 |
|------|------|
| ESLint (`--max-warnings 0`) | ✅ 통과 |
| TypeScript 타입 체크 | ✅ 통과 |
| `npm run build` | ✅ 성공 |
| 프로젝트 선택 → 브랜치 목록 자동 갱신 | ✅ 확인 |
| 최근 7일 커밋 목록 정상 표시 | ✅ 확인 |
| 작성자 필터 선택 시 목록 필터링 | ✅ 확인 |
| 더 불러오기 (무한 스크롤) | ✅ 확인 |

---

## 특이사항

- GitLab API는 CORS 정책으로 직접 호출 불가 → Vite dev proxy (`/gitlab-api`) 경유
- 프로덕션에서는 Nginx 리버스 프록시가 동일 역할 수행
- 커밋 목록은 `useInfiniteQuery`로 구현하여 대량 커밋 시 성능 문제 방지
- 마지막 선택된 프로젝트/브랜치는 Zustand persist로 브라우저 재시작 후에도 유지
