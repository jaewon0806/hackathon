# 기능 상세 설계서 — 업무 대시보드

> **참조**: [PRD.md](PRD.md)
> **버전**: v0.2 (Sprint 8 기준)
> **최초 작성**: 2026-03-13
> **최종 업데이트**: 2026-03-15

---

## 1. 앱 공통 구조

### 1.1 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│  [사이드바]  │           [메인 콘텐츠 영역]              │
│              │                                           │
│  🏠 홈       │  ┌─────────────────────────────────────┐  │
│  📁 GitLab   │  │  페이지별 콘텐츠                     │  │
│  📋 Redmine  │  │                                     │  │
│  ⚙️ 설정     │  └─────────────────────────────────────┘  │
│              │                                           │
└─────────────────────────────────────────────────────────┘
                                      ┌──────────────┐
                                      │ 💬 챗봇 패널  │ ← 우하단 플로팅
                                      └──────────────┘
```

### 1.2 공통 컴포넌트

| 컴포넌트 | 위치 | 역할 |
|---------|------|------|
| `Sidebar` | 좌측 고정 | 네비게이션 메뉴 |
| `TopBar` | 상단 | 페이지 제목 + 새로고침 버튼 + 마지막 업데이트 시각 |
| `ChatbotPanel` | 우하단 플로팅 | AI 챗봇 패널 (전 페이지 공통) |
| `Toast` | 우상단 | 에러/성공 알림 |
| `SkeletonLoader` | 콘텐츠 영역 | 로딩 중 UI |
| `ErrorBoundary` | 페이지 래퍼 | 런타임 에러 대응 |

### 1.3 전역 상태 (Zustand)

```typescript
// store/settingsStore.ts
interface SettingsState {
  gitlab: {
    url: string;          // https://gitlab.ubware.com (하드코딩, UI 노출 없음)
    token: string;        // Personal Access Token (사용자 입력)
  };
  redmine: {
    url: string;          // https://redmine.ubware.com (하드코딩, UI 노출 없음)
    apiKey: string;       // API Access Key (사용자 입력)
  };
  anthropic: {
    apiKey: string;       // Anthropic API Key (사용자 입력)
    model: string;        // claude-haiku-4-5 고정
  };
  theme: 'light' | 'dark' | 'system';
  refreshInterval: number; // 0=수동, 300=5분, 900=15분, 1800=30분
}

// store/gitlabStore.ts — Draft/Applied 이중 상태 패턴
// draft: 사용자 입력 중, applied: 조회 버튼 클릭 후 API 호출에 사용
interface GitlabState {
  selectedProjectId: number | null;   // draft
  selectedBranch: string | null;       // draft
  authorFilter: string;                // draft (단일 작성자 선택)
  dateRange: { from: string; to: string };  // draft
  keyword: string;                     // draft

  appliedProjectId: number | null;    // applied — useGitlabCommits에서 참조
  appliedBranch: string | null;        // applied
  appliedAuthorFilter: string;         // applied
  appliedDateRange: { from: string; to: string };  // applied
  appliedKeyword: string;              // applied

  applyFilters(): void; // draft → applied 복사 (조회 버튼 클릭 시)
}

// store/redmineStore.ts — Draft/Applied 이중 상태 패턴
interface RedmineState {
  selectedProjectId: number | null;   // draft
  selectedVersionId: number | null;   // draft
  statusFilter: string[];              // draft
  priorityFilter: string[];           // draft
  keyword: string;                    // draft

  appliedProjectId: number | null;    // applied — useRedmineIssues에서 참조
  appliedVersionId: number | null;    // applied
  appliedStatusFilter: string[];      // applied
  appliedPriorityFilter: string[];    // applied
  appliedKeyword: string;             // applied

  applyProject(): void; // draft → applied 복사 (조회 버튼 클릭 시)
}
```

> **Draft/Applied 패턴**: 사용자가 필터를 변경해도 즉시 API 호출하지 않고, "조회" 버튼 클릭 시 draft → applied 복사 후 React Query queryKey 변경으로 API 호출을 트리거합니다. 불필요한 API 호출을 방지합니다.

---

## 2. SCR-001 대시보드 홈

### 2.1 화면 구성

```
┌──────────────────────────────────────────────────────────────┐
│  오늘의 업무 현황                                              │
├──────────────┬──────────────┬──────────────┬─────────────────┤
│ 📋 담당 일감  │ 💻 이번주 커밋│ 🔄 진행 중    │ ⚠️ 기한 초과     │
│    12건       │    8건        │    5건        │   2건 (빨간색)   │
│  (클릭 시 →) │  (클릭 시 →) │  (클릭 시 →) │  (클릭 시 →)    │
└──────────────┴──────────────┴──────────────┴─────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  최근 활동             [1주일 ▼] [전체 작성자 ▼]              │
├──────────────────────────────────────────────────────────────┤
│  [GL] 2시간 전  홍길동  feat: 로그인 API 추가     [↗]         │
│  [RM] 3시간 전  김철수  #1234 코드 리뷰 완료      [↗]         │
│  [GL] 5시간 전  이영희  fix: 버튼 색상 수정       [↗]         │
│  ...                                                          │
└──────────────────────────────────────────────────────────────┘

           ┌──────────────────────────────────────┐
           │  [오버레이]  ┌──── 담당 일감 (12건) ──┤
           │             │  #1202 API 구현        │
           │             │  ...                   │
           │             │  [↗ Redmine 링크]      │
           └─────────────┴────────────────────────┘
                                  ↑ 카드 클릭 시 슬라이드인 패널
```

### 2.2 데이터 로딩 전략

- GitLab/Redmine 프로젝트 선택 후 React Query로 데이터 로드 (applied 상태 기준)
- `useRedmineIssues`, `useGitlabCommits` 훅이 React Query queryKey를 applied 값으로 참조
- 로딩 중: 카드 영역 스켈레톤 UI

### 2.3 요약 카드 계산 로직

| 카드 | 계산 방법 |
|------|----------|
| 담당 일감 | 로드된 이슈 중 `DONE_STATUSES`에 미포함인 항목 수 |
| 이번 주 커밋 | 로드된 커밋 전체 수 (GitLab 날짜 필터 적용 결과) |
| 진행 중 일감 | 로드된 이슈 중 `status.name === IN_PROGRESS_STATUS` 수 |
| 기한 초과 | 로드된 이슈 중 `due_date < today` + 미완료 항목 수 |

### 2.4 요약 카드 상세 패널 (SummaryDetailPanel)

- 카드 클릭 시 우측에서 슬라이드인 패널 표시 (`z-50`)
- 오버레이 클릭 또는 X 버튼으로 닫기
- 패널 내용: 해당 카드 필터 기준의 이슈/커밋 목록 + 각 항목 외부 링크 (`ExternalLink`)
- 커밋 패널: 전체 로드된 커밋 목록 표시
- 이슈 패널: 카드 타입별 필터링된 이슈 목록 (우선순위 색상 배지 포함)

### 2.5 최근 활동 피드

- 커밋 최근 10건 + 이슈 최근 10건 혼합, 날짜 역순 정렬, 최대 20건 표시
- 기간 드롭다운: `1일 / 3일 / 1주일(기본) / 2주일 / 1개월 / 전체`
- 작성자 드롭다운: 활동 데이터에서 추출한 작성자 목록 (임시 클라이언트 사이드 필터)
- 각 항목 우측: `ExternalLink` 아이콘 → GitLab 커밋 URL 또는 Redmine 이슈 URL (새 탭)
- 날짜 표시: `M/D (N시간 전)` 형식 (예: `3/14 (2시간 전)`)

---

## 3. SCR-002 GitLab 커밋 이력

### 3.1 화면 구성

```
┌──────────────────────────────────────────────────────────────┐
│  프로젝트: [드롭다운 ▼]   브랜치: [드롭다운 ▼]               │
├──────────────────────────────────────────────────────────────┤
│  필터: [작성자 ▼] [기간 ▼] [키워드 검색 🔍]                  │
├──────────────────────────────────────────────────────────────┤
│  ● abc1234  feat: 로그인 API 추가                              │
│    홍길동 · 2시간 전 · 파일 3개 변경                           │
│  ────────────────────────────────────────────────────────    │
│  ● def5678  fix: 버튼 색상 수정                                │
│    이영희 · 5시간 전 · 파일 1개 변경                           │
│  ...                                                          │
├──────────────────────────────────────────────────────────────┤
│  [더 불러오기]                                                 │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 API 호출 명세

```
// 프로젝트 목록
GET /api/v4/projects?membership=true&per_page=100
Authorization: Bearer {GITLAB_TOKEN}

// 브랜치 목록
GET /api/v4/projects/{id}/repository/branches?per_page=100

// 커밋 목록
GET /api/v4/projects/{id}/repository/commits
  ?ref_name={branch}
  &since={7일전 ISO8601}
  &until={오늘 ISO8601}
  &per_page=50
  &page={page}
```

### 3.3 조회 버튼 패턴

GitLab 페이지는 Draft/Applied 패턴을 사용합니다.

1. 프로젝트/브랜치 드롭다운 선택 → draft 상태 업데이트 (즉시 API 호출 없음)
2. 필터(작성자/날짜/키워드) 변경 → draft 상태 업데이트
3. **"조회" 버튼 클릭** → `applyFilters()` 호출 → applied 상태 업데이트 → React Query queryKey 변경 → API 호출

### 3.4 컴포넌트 트리

```
GitlabPage
├── ProjectBranchSelector       // 프로젝트/브랜치 선택 + 조회 버튼
├── CommitFilterBar              // 필터 도구 모음
│   ├── AuthorSelect             // 단일 선택 드롭다운 (로드된 커밋에서 작성자 추출)
│   ├── DateRangePicker          // 날짜 범위 (from/to)
│   └── KeywordSearchInput       // 커밋 메시지 키워드 검색
├── CommitList                   // 커밋 목록 (무한 스크롤)
│   └── CommitItem (반복)
│       ├── CommitHash (font-mono) // 클릭 시 GitLab 링크
│       ├── CommitMessage
│       ├── AuthorName
│       └── CommitDate           // M/D (N시간 전) 형식
└── InfiniteScrollTrigger        // Intersection Observer 기반
```

### 3.4 에러 처리

| 에러 상황 | 처리 방법 |
|----------|----------|
| 401 Unauthorized | "GitLab 토큰이 유효하지 않습니다. 설정을 확인하세요." 토스트 + 설정 페이지 이동 버튼 |
| 403 Forbidden | "해당 프로젝트에 접근 권한이 없습니다." 토스트 |
| 네트워크 에러 | "서버에 연결할 수 없습니다. 잠시 후 재시도하세요." 토스트 + 재시도 버튼 |
| 빈 결과 | "선택한 기간에 커밋이 없습니다." 빈 상태 UI |

---

## 4. SCR-003 Redmine 일감 목록

### 4.1 화면 구성

```
┌──────────────────────────────────────────────────────────────┐
│  프로젝트: [드롭다운 ▼]   목표 버전: [드롭다운 ▼]             │
├──────────────────────────────────────────────────────────────┤
│  필터: [담당자 ▼] [상태 ▼] [우선순위 ▼] [키워드 🔍]          │
│  완료율: ████████░░░░  65% (13/20건)                          │
├──────────────────────────────────────────────────────────────┤
│  ⚠️ 마감 임박 (3일 이내): #1201, #1205, #1210                 │
├──────────────────────────────────────────────────────────────┤
│  ▼ #1200 [Epic] 로그인 기능 구현                 🔵 진행 중    │
│     담당: 홍길동  마감: 03/15  ████░░  60%                     │
│    ▼ #1201 [Story] UI 설계                      ✅ 완료        │
│    ▼ #1202 [Task] API 엔드포인트 구현            🔵 진행 중    │
│       담당: 김철수  마감: 03/14  ██░░░░  30%                   │
│    ▶ #1203 [Task] 프론트엔드 연동                ⬜ 신규        │
│  ▶ #1210 [Epic] 대시보드 개발                    ⬜ 신규        │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 API 호출 명세

```
// 프로젝트 목록
GET /projects.json?limit=100
X-Redmine-API-Key: {REDMINE_API_KEY}

// 목표 버전 목록
GET /projects/{id}/versions.json

// 일감 목록 (트리 구성용 전체 조회)
GET /issues.json
  ?project_id={id}
  &fixed_version_id={version_id}
  &status_id=*              // 모든 상태
  &limit=100
  &offset={offset}
```

### 4.3 트리 구성 알고리즘

```typescript
// 평탄한 일감 배열 → 트리 구조 변환
function buildIssueTree(issues: Issue[]): IssueNode[] {
  const map = new Map<number, IssueNode>();
  const roots: IssueNode[] = [];

  // 1단계: 모든 노드 맵 생성
  issues.forEach(issue => {
    map.set(issue.id, { ...issue, children: [] });
  });

  // 2단계: 부모-자식 연결
  issues.forEach(issue => {
    const node = map.get(issue.id)!;
    if (issue.parent?.id && map.has(issue.parent.id)) {
      map.get(issue.parent.id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}
```

### 4.4 상태 배지 색상 정의

| 상태 | 색상 | 아이콘 |
|------|------|--------|
| 신규 | 회색 (gray-400) | ⬜ |
| 진행 중 | 파랑 (blue-500) | 🔵 |
| 해결됨 | 초록 (green-500) | ✅ |
| 완료 | 진한 초록 (green-700) | ✅ |
| 반려 | 빨강 (red-500) | ❌ |
| 피드백 | 주황 (orange-500) | 🟠 |

### 4.5 조회 버튼 패턴

Redmine 페이지도 Draft/Applied 패턴을 사용합니다.

1. 프로젝트/버전 드롭다운 선택 → draft 상태 업데이트 (즉시 API 호출 없음)
2. 필터(상태/우선순위/키워드) 변경 → draft 상태 업데이트
3. **"조회" 버튼 클릭** → `applyProject()` 호출 → applied 상태 업데이트 → React Query queryKey 변경 → API 호출

프로젝트를 선택하지 않으면 "프로젝트를 선택하고 조회 버튼을 눌러주세요." 안내 표시.

### 4.6 컴포넌트 트리

```
RedminePage
├── ProjectVersionSelector       // 프로젝트/버전 선택 + 조회 버튼
├── VersionProgressBar           // 버전 전체 완료율 (applied 이후 표시)
├── DueSoonBanner                // 마감 임박 경고 (applied 이후 표시)
├── IssueFilterBar               // 필터 도구 모음 (applied 이후 표시)
│   ├── StatusMultiSelect
│   ├── PriorityMultiSelect
│   └── KeywordSearchInput
└── IssueTree                    // 트리 뷰 (applied 이후 표시)
    └── IssueTreeNode (재귀)
        ├── ExpandToggle
        ├── IssueId (font-mono)  // 클릭 시 Redmine 링크
        ├── IssueTitle
        ├── StatusBadge
        ├── AssigneeName
        ├── DueDate              // 기한 초과 시 빨간색
        ├── UpdatedDate          // 수정일 (M/D 형식, sm 이상에서 표시)
        └── ProgressBar (done_ratio)
```

---

## 5. SCR-004 설정

### 5.1 화면 구성 (Sprint 7 기준)

```
┌──────────────────────────────────────────────────────────────┐
│  설정                                                          │
├──────────────────────────────────────────────────────────────┤
│  [API 연결]                                                    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ GitLab Access Token [●●●●●●●●●●●●●●●●●         👁] │    │
│  │                              [연결 테스트 ✓]          │    │
│  │  ✓ connected as 홍길동                               │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │ Redmine API Key     [●●●●●●●●●●●●●●●●●         👁] │    │
│  │                              [연결 테스트 ✓]          │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │ Anthropic API Key   [●●●●●●●●●●●●●●●●●         👁] │    │
│  │ Claude 모델         claude-haiku-4-5 (빠름/저렴)     │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  [화면 설정]                                                   │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ 테마              ○ 라이트  ○ 다크  ● 시스템          │    │
│  │ 자동 새로고침     [15분              ▼]               │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                [저장]          │
└──────────────────────────────────────────────────────────────┘
```

> **URL 필드 없음**: GitLab/Redmine URL은 환경변수 또는 코드에 하드코딩됩니다. 사용자는 토큰/API 키만 입력합니다.
> **모델 선택 없음**: Claude 모델은 `claude-haiku-4-5`로 고정입니다.

### 5.2 연결 테스트 로직

CORS 정책으로 브라우저에서 외부 API를 직접 호출할 수 없으므로, Vite 프록시 경로를 사용합니다.

```typescript
// GitLab 연결 테스트 — Vite 프록시 경유 (/gitlab-api → /api/v4)
async function testGitlabConnection(_url: string, token: string) {
  const response = await axios.get('/gitlab-api/user', {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 5000,
  });
  return { success: true, username: response.data.username };
}

// Redmine 연결 테스트 — Vite 프록시 경유 (/redmine-api → Redmine root)
async function testRedmineConnection(_url: string, apiKey: string) {
  const response = await axios.get('/redmine-api/users/current.json', {
    headers: { 'X-Redmine-API-Key': apiKey },
    timeout: 5000,
  });
  return { success: true, username: response.data.user.login };
}
```

### 5.3 로컬 스토리지 키

| 키 | 저장 내용 |
|----|----------|
| `dashboard_settings` | API 토큰 + 화면 설정 전체 |
| `gitlab_last_selection` | 마지막 선택 프로젝트/브랜치 |
| `redmine_last_selection` | 마지막 선택 프로젝트/버전 |
| `chatbot_history` | 챗봇 대화 이력 (최대 50건) |

---

## 6. SCR-005 온보딩 모달

### 6.1 표시 조건

앱 최초 진입 시 (`gitlabToken` 또는 `redmineApiKey` 미설정 상태) 전체화면 모달 표시.

### 6.2 화면 구성 (3단계 스텝)

```
┌──────────────────────────────────────────────────────────────┐
│  업무 대시보드 시작하기                        ● ○ ○ (1/3)  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  🔑 GitLab Access Token                                       │
│  [●●●●●●●●●●●●●●●●●●●●●●●          👁]                     │
│  [연결 테스트 ✓]                                              │
│                                                               │
│                                     [다음 →]                  │
└──────────────────────────────────────────────────────────────┘
```

| 단계 | 내용 | 필수 여부 |
|------|------|----------|
| 1단계 | GitLab Personal Access Token 입력 | 필수 (비어있으면 다음 불가) |
| 2단계 | Redmine API Access Key 입력 | 필수 |
| 3단계 | Anthropic API Key 입력 | 선택 (챗봇 기능 선택적 사용) |

### 6.3 완료 처리

- 3단계 완료 후 "시작하기" 클릭 → 설정 저장 → 모달 닫기 → 대시보드 홈 표시

---

## 7. SCR-006 챗봇 패널

### 7.1 화면 구성

```
┌──────────────────────────────────┐
│  💬 AI 어시스턴트           [✕]  │  ← 헤더
├──────────────────────────────────┤
│  자주 쓰는 질문:                  │
│  [담당 일감?] [마감 임박?] [커밋?]│  ← 추천 질문 칩
├──────────────────────────────────┤
│                                  │
│  안녕하세요! 현재 로드된 업무     │  ← AI 메시지 (좌측)
│  데이터를 기반으로 질문에         │
│  답변드립니다.                    │
│                                  │
│              담당 일감 알려줘  ▶  │  ← 사용자 메시지 (우측)
│                                  │
│  현재 담당하신 일감은 총 12건     │  ← AI 응답
│  입니다:                         │
│  - #1202 API 구현 (진행 중)      │
│  - #1205 테스트 작성 (신규)      │
│  ...                             │
│                                  │
├──────────────────────────────────┤
│  [새 대화]                        │
├──────────────────────────────────┤
│  메시지 입력...            [전송] │  ← 입력창
└──────────────────────────────────┘
```

### 7.2 컨텍스트 프롬프트 구성

```typescript
function buildSystemPrompt(
  issues: Issue[],
  commits: Commit[],
  today: string
): string {
  const issuesSummary = issues
    .slice(0, 50) // 토큰 절약: 최대 50건만 포함
    .map(i => `- #${i.id} [${i.status}] ${i.subject} (담당: ${i.assignee?.name}, 마감: ${i.due_date})`)
    .join('\n');

  const commitsSummary = commits
    .slice(0, 30)
    .map(c => `- ${c.short_id} ${c.title} by ${c.author_name} (${c.committed_date})`)
    .join('\n');

  return `
오늘 날짜: ${today}
당신은 개발팀의 업무 어시스턴트입니다. 아래 업무 데이터를 참고하여 한국어로 간결하게 답변하세요.

## Redmine 일감 목록 (${issues.length}건)
${issuesSummary}

## GitLab 최근 커밋 (${commits.length}건)
${commitsSummary}

사용자 질문에 위 데이터만 기반하여 답변하세요. 데이터에 없는 내용은 "현재 로드된 데이터에 없습니다"라고 답변하세요.
  `.trim();
}
```

### 7.3 스트리밍 응답 처리

```typescript
// Claude API 스트리밍 사용
const stream = await anthropic.messages.stream({
  model: settings.anthropic.model,
  max_tokens: 1024,
  system: systemPrompt,
  messages: conversationHistory,
});

// 실시간 텍스트 표시
for await (const chunk of stream) {
  if (chunk.type === 'content_block_delta') {
    appendToLastMessage(chunk.delta.text);
  }
}
```

---

## 8. API 프록시 설정 (CORS 해결)

개발 환경에서 GitLab/Redmine의 CORS 정책으로 직접 호출이 차단될 수 있으므로 Vite 프록시를 사용한다.

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/gitlab-api': {
        target: 'https://gitlab.ubware.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gitlab-api/, '/api/v4'),
      },
      '/redmine-api': {
        target: 'https://redmine.ubware.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/redmine-api/, ''),
      },
    },
  },
});
```

프로덕션 빌드 시 Nginx 리버스 프록시로 동일하게 처리한다. (`docs/setup-guide.md` 섹션 6 참조)

---

## 9. 에러 핸들링 공통 원칙

1. **API 에러**: React Query의 `onError` 콜백에서 Toast 알림 표시
2. **설정 미완료**: 토큰 미설정 상태에서 API 호출 차단 + "설정 필요" 안내 배너
3. **네트워크 오프라인**: `navigator.onLine` 감지 후 오프라인 배너 표시
4. **빈 결과**: 각 화면별 EmptyState 컴포넌트 표시 (일러스트 + 안내 문구)

---

## 10. 추후 개발 고려사항 (v2)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 사용자 인증 | JWT 기반 로그인 | 높음 |
| 알림 기능 | 마감 임박 브라우저 알림 | 중간 |
| 일감 상태 변경 | Redmine PUT API 활용 | 중간 |
| 팀 대시보드 | 팀원 전체 현황 공유 뷰 | 낮음 |
| 모바일 앱 | React Native 전환 | 낮음 |
