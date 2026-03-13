# Sprint 3 완료 보고서 — Redmine 일감 트리

> **브랜치**: `sprint3`
> **목표**: Redmine API 연동 + 프로젝트/버전 선택 + 트리 뷰 + 필터링
> **상태**: ✅ 완료
> **완료일**: 2026-03-13
> **PR**: sprint3 → develop

---

## 구현 요약

### API 레이어

| 파일 | 설명 |
|------|------|
| `src/api/redmineClient.ts` | axios 인스턴스 + X-Redmine-API-Key 인터셉터. getProjects/getVersions/getIssues/getCurrentUser. 401 → REDMINE_UNAUTHORIZED, 403 → REDMINE_FORBIDDEN, 기타 → REDMINE_NETWORK_ERROR 로 에러 분류 |

### React Query 훅

| 파일 | 설명 |
|------|------|
| `src/hooks/useRedmineProjects.ts` | API 키 설정 여부로 enabled 제어. staleTime 5분 |
| `src/hooks/useRedmineVersions.ts` | 프로젝트 선택 시 enabled. staleTime 5분 |
| `src/hooks/useRedmineIssues.ts` | 전체 페이지네이션 순차 처리 (100건 단위 반복 조회). staleTime 5분 |

### 유틸리티

| 파일 | 설명 |
|------|------|
| `src/utils/issueTreeBuilder.ts` | `buildIssueTree`: 플랫 배열 → 부모-자식 트리 변환 (Map 기반 O(n)). `filterIssueTree`: 재귀 필터링 (자식이 조건 충족 시 부모도 포함) |

### 컴포넌트

| 컴포넌트 | 위치 | 설명 |
|---------|------|------|
| `ProjectVersionSelector` | `src/components/redmine/ProjectVersionSelector.tsx` | 프로젝트/버전 드롭다운. 프로젝트 변경 시 버전 목록 자동 갱신 |
| `VersionProgressBar` | `src/components/redmine/VersionProgressBar.tsx` | 완료 상태 기준 버전 완료율 진행 바 |
| `DueSoonBanner` | `src/components/redmine/DueSoonBanner.tsx` | 기한 초과(빨간색)/마감 3일 이내(주황색) 경고 배너 |
| `IssueFilterBar` | `src/components/redmine/IssueFilterBar.tsx` | 상태/우선순위 토글 칩 + 키워드 검색 입력 |
| `IssueTree` | `src/components/redmine/IssueTree.tsx` | 전체 펼치기/접기 토글 버튼. 빈 상태 UI |
| `IssueTreeNode` | `src/components/redmine/IssueTreeNode.tsx` | 재귀 트리 노드. 이슈 ID/트래커/제목/상태/담당자/마감일/완료율 표시. 마감 초과 시 빨간색 강조 |
| `StatusBadge` | `src/components/redmine/StatusBadge.tsx` | 이슈 상태 배지 |

### 페이지

| 파일 | 설명 |
|------|------|
| `src/pages/RedminePage.tsx` | API 키 미설정 시 안내 화면. 프로젝트 미선택 시 안내. 로딩 스켈레톤. 에러(401/403/네트워크) 구분 메시지. useMemo로 트리 빌드+필터 최적화 |

### 스토어 변경

| 파일 | 추가 필드 |
|------|---------|
| `src/store/redmineStore.ts` | `selectedProjectId`, `selectedVersionId`, `statusFilter`, `priorityFilter`, `keyword`, `expandedIssueIds` 상태 및 setter 추가 |

---

## 완료 기준 검증

| 항목 | 결과 |
|------|------|
| 프로젝트 + 목표 버전 선택 후 일감 트리 표시 | ✅ 구현 완료 |
| 하위 일감 펼치기/접기 동작 | ✅ IssueTreeNode 재귀 + Zustand expandedIssueIds |
| 상태 필터 적용 시 트리 필터링 | ✅ filterIssueTree + useMemo |
| `npm run lint && npm run typecheck && npm run build` | ✅ 통과 |

---

## 코드 리뷰 결과

**Critical/High 이슈**: 없음

**Medium 이슈 (추후 개선 참고)**

1. **`IssueTreeNode` href XSS 방어 미흡** — `redmineUrl`을 href에 직접 삽입 시 `javascript:` 프로토콜 필터링 없음. 사용자가 직접 입력하는 신뢰된 값이므로 현재 위험도는 낮으나, Sprint 5에서 URL 유효성 검사 추가 권장.
2. **`DONE_STATUSES` 상수 중복** — `DueSoonBanner.tsx`와 `VersionProgressBar.tsx`에 동일 배열 중복 정의. `src/constants/redmine.ts`로 추출 권장 (Sprint 5 리팩토링 대상).

---

## 검증 결과

### 자동 검증

- ⬜ Docker 미실행으로 자동 검증 미수행

### 수동 검증 필요 항목

- ⬜ `docker compose up --build` 로컬 스테이징 빌드 성공 확인
- ⬜ Redmine API 키 설정 후 실제 프로젝트 목록 로드 확인
- ⬜ 프로젝트 + 목표 버전 선택 후 일감 트리 표시 확인
- ⬜ 하위 일감 펼치기/접기 동작 확인
- ⬜ 전체 펼치기/전체 접기 토글 동작 확인
- ⬜ 상태/우선순위 필터 + 키워드 검색 조합 동작 확인
- ⬜ 기한 초과/마감 임박 배너 표시 확인
- ⬜ 버전 완료율 진행 바 표시 확인
- ⬜ API 미설정 시 안내 화면 표시 확인
- ⬜ 401/403/네트워크 에러 처리 메시지 확인
- ⬜ UI 디자인 / 시각적 품질 판단

검증 현황: `docs/deploy.md` 참조

---

## 첨부 파일

스크린샷 및 보고서: `docs/sprint/sprint3/`
