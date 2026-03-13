# 기능 상세 설계서 — 업무 대시보드

> **참조**: [PRD.md](PRD.md)
> **버전**: v0.1
> **작성일**: 2026-03-13

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
    url: string;          // https://gitlab.ubware.com
    token: string;        // Personal Access Token
  };
  redmine: {
    url: string;          // https://redmine.ubware.com
    apiKey: string;       // API Access Key
  };
  anthropic: {
    apiKey: string;       // Anthropic API Key
    model: string;        // claude-haiku-4-5 | claude-sonnet-4-6
  };
  theme: 'light' | 'dark' | 'system';
  refreshInterval: number; // 0=수동, 300=5분, 900=15분, 1800=30분
}

// store/gitlabStore.ts
interface GitlabState {
  selectedProjectId: number | null;
  selectedBranch: string | null;
  authorFilter: string[];   // 선택된 작성자 목록
  dateRange: { from: Date; to: Date };
  keyword: string;
}

// store/redmineStore.ts
interface RedmineState {
  selectedProjectId: number | null;
  selectedVersionId: number | null;
  assigneeFilter: number[];  // 선택된 담당자 ID 목록
  statusFilter: string[];
  priorityFilter: string[];
  keyword: string;
  expandedIssueIds: Set<number>; // 펼쳐진 트리 노드
}
```

---

## 2. SCR-001 대시보드 홈

### 2.1 화면 구성

```
┌──────────────────────────────────────────────────────────────┐
│  오늘의 업무 현황                                              │
├──────────────┬──────────────┬──────────────┬─────────────────┤
│ 📋 담당 일감  │ 💻 이번주 커밋│ 🔄 진행 중    │ ⚠️ 기한 초과     │
│    12건       │    8건        │    5건        │   2건 (빨간색)   │
└──────────────┴──────────────┴──────────────┴─────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  최근 활동                                                     │
├──────────────────────────────────────────────────────────────┤
│  [GL] 2시간 전  홍길동  feat: 로그인 API 추가  (backend/main)  │
│  [RM] 3시간 전  김철수  #1234 코드 리뷰 완료 → 완료            │
│  [GL] 5시간 전  이영희  fix: 버튼 색상 수정    (frontend/dev)  │
│  ...                                                          │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 데이터 로딩 전략

- 페이지 진입 시 GitLab + Redmine API 병렬 호출
- React Query `useQuery`로 5분 캐시 유지
- 로딩 중: 카드 영역 스켈레톤 UI

### 2.3 요약 카드 계산 로직

| 카드 | 계산 방법 |
|------|----------|
| 담당 일감 | Redmine: `assigned_to_id=나` + `status!=완료` |
| 이번 주 커밋 | GitLab: `author_email=나` + `since=7일 전` |
| 진행 중 일감 | Redmine: `assigned_to_id=나` + `status=진행 중` |
| 기한 초과 | Redmine: `assigned_to_id=나` + `due_date<오늘` + `status!=완료` |

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

### 3.3 컴포넌트 트리

```
GitlabPage
├── ProjectBranchSelector       // 프로젝트/브랜치 선택 드롭다운
├── CommitFilterBar              // 필터 도구 모음
│   ├── AuthorMultiSelect
│   ├── DateRangePicker
│   └── KeywordSearchInput
├── CommitList                   // 커밋 목록
│   └── CommitItem (반복)
│       ├── CommitHash           // 클릭 시 GitLab 링크
│       ├── CommitMessage
│       ├── AuthorAvatar
│       └── CommitMeta           // 시각, 파일 수
└── LoadMoreButton
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

### 4.5 컴포넌트 트리

```
RedminePage
├── ProjectVersionSelector       // 프로젝트/버전 선택
├── VersionProgressBar           // 버전 전체 완료율
├── DueSoonBanner                // 마감 임박 경고
├── IssueFilterBar               // 필터 도구 모음
│   ├── AssigneeMultiSelect
│   ├── StatusMultiSelect
│   ├── PriorityMultiSelect
│   └── KeywordSearchInput
└── IssueTree                    // 트리 뷰
    └── IssueTreeNode (재귀)
        ├── ExpandToggle
        ├── IssueId              // 클릭 시 Redmine 링크
        ├── IssueTitle
        ├── StatusBadge
        ├── AssigneeAvatar
        ├── DueDate              // 기한 초과 시 빨간색
        └── ProgressBar
```

---

## 5. SCR-004 설정

### 5.1 화면 구성

```
┌──────────────────────────────────────────────────────────────┐
│  설정                                                          │
├──────────────────────────────────────────────────────────────┤
│  [API 연결]                                                    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ GitLab URL          [https://gitlab.ubware.com     ] │    │
│  │ GitLab Access Token [●●●●●●●●●●●●●●●●●         👁] │    │
│  │                              [연결 테스트 ✓]          │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │ Redmine URL         [https://redmine.ubware.com    ] │    │
│  │ Redmine API Key     [●●●●●●●●●●●●●●●●●         👁] │    │
│  │                              [연결 테스트 ✓]          │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │ Anthropic API Key   [●●●●●●●●●●●●●●●●●         👁] │    │
│  │ Claude 모델         [claude-haiku-4-5          ▼   ] │    │
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

### 5.2 연결 테스트 로직

```typescript
// GitLab 연결 테스트
async function testGitlabConnection(url: string, token: string) {
  const response = await axios.get(`${url}/api/v4/user`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 5000,
  });
  return { success: true, username: response.data.username };
}

// Redmine 연결 테스트
async function testRedmineConnection(url: string, apiKey: string) {
  const response = await axios.get(`${url}/users/current.json`, {
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

## 6. SCR-005 챗봇 패널

### 6.1 화면 구성

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

### 6.2 컨텍스트 프롬프트 구성

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

### 6.3 스트리밍 응답 처리

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

## 7. API 프록시 설정 (CORS 해결)

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

## 8. 에러 핸들링 공통 원칙

1. **API 에러**: React Query의 `onError` 콜백에서 Toast 알림 표시
2. **설정 미완료**: 토큰 미설정 상태에서 API 호출 차단 + "설정 필요" 안내 배너
3. **네트워크 오프라인**: `navigator.onLine` 감지 후 오프라인 배너 표시
4. **빈 결과**: 각 화면별 EmptyState 컴포넌트 표시 (일러스트 + 안내 문구)

---

## 9. 추후 개발 고려사항 (v2)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 사용자 인증 | JWT 기반 로그인 | 높음 |
| 알림 기능 | 마감 임박 브라우저 알림 | 중간 |
| 일감 상태 변경 | Redmine PUT API 활용 | 중간 |
| 팀 대시보드 | 팀원 전체 현황 공유 뷰 | 낮음 |
| 모바일 앱 | React Native 전환 | 낮음 |
