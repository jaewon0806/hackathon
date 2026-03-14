# Sprint 8 — 대시보드 카드 상세 모달 + 최근 활동 링크 + 기간 필터 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 대시보드 요약 카드 클릭 시 상세 내역 모달을 표시하고, 최근 활동 각 항목에 원본 링크를 추가하며, 최근 활동 기간 필터 드롭다운을 구현한다.

**Architecture:** `SummaryDetailPanel` 신규 컴포넌트(슬라이드인 패널)를 생성하여 카드 클릭 시 표시한다. `SummaryCard`에 `onClick` props를 추가하고, DashboardPage에서 어떤 카드가 열렸는지 `activeCard` 상태로 관리한다. `recentActivity` 각 항목에 `url` 필드를 추가하고(커밋: `web_url`, 이슈: `${redmineUrl}/issues/${id}`), 기간 필터는 `activityPeriod` useState로 로컬 관리하며 useMemo에서 기간 필터 적용 후 작성자 필터를 적용한다.

**Tech Stack:** React 18 + TypeScript, Zustand (settingsStore — redmine.url), Tailwind CSS v4, lucide-react

---

## 브랜치 준비

Sprint 8은 `sprint7` 브랜치 기반으로 `sprint8` 신규 브랜치를 생성한다.

```bash
git checkout sprint7
git checkout -b sprint8
```

---

## Task 1: SummaryDetailPanel 컴포넌트 신규 생성

**Files:**
- Create: `src/components/dashboard/SummaryDetailPanel.tsx`

### 목표

요약 카드 클릭 시 우측에서 슬라이드인되는 상세 패널 컴포넌트를 생성한다.
패널은 4종 카드(담당일감/이번주커밋/진행중/기한초과)의 데이터를 받아 각각 다른 목록을 렌더링한다.

### 핵심 설계 결정

- 패널 타입: `type CardType = 'totalIssues' | 'weeklyCommits' | 'inProgress' | 'overdue'`
- 패널은 오버레이(배경 반투명) + 우측 고정 패널 조합
- 바깥 클릭(오버레이 클릭) 또는 X 버튼으로 닫힘
- 이슈 항목 필드: 제목, 상태 배지, 우선순위, 마감일
- 커밋 항목 필드: short_id, 제목, 작성자, 날짜

### Step 1: 컴포넌트 파일 생성

`src/components/dashboard/` 디렉토리 생성 후 `SummaryDetailPanel.tsx` 작성:

```tsx
import { X } from 'lucide-react'

// 패널에서 표시할 카드 타입
export type CardType = 'totalIssues' | 'weeklyCommits' | 'inProgress' | 'overdue'

// 이슈 요약 데이터 (DashboardPage에서 가공하여 전달)
export interface IssueSummaryItem {
  id: number
  title: string
  status: string
  priority: string
  dueDate?: string
}

// 커밋 요약 데이터
export interface CommitSummaryItem {
  shortId: string
  title: string
  author: string
  date: string
}

interface SummaryDetailPanelProps {
  cardType: CardType | null
  issues: IssueSummaryItem[]
  commits: CommitSummaryItem[]
  onClose: () => void
}

// 카드 타입별 패널 제목 매핑
const PANEL_TITLE: Record<CardType, string> = {
  totalIssues: '담당 일감 (미완료)',
  weeklyCommits: '이번 주 커밋',
  inProgress: '진행 중 일감',
  overdue: '기한 초과 일감',
}

// 우선순위별 색상 클래스
const PRIORITY_COLOR: Record<string, string> = {
  긴급: 'text-red-600 dark:text-red-400',
  높음: 'text-orange-500 dark:text-orange-400',
  보통: 'text-blue-600 dark:text-blue-400',
  낮음: 'text-gray-400 dark:text-gray-500',
}

export function SummaryDetailPanel({
  cardType,
  issues,
  commits,
  onClose,
}: SummaryDetailPanelProps) {
  // cardType이 null이면 렌더링하지 않음
  if (!cardType) return null

  const isIssuePanel = cardType !== 'weeklyCommits'

  return (
    <>
      {/* 반투명 오버레이 — 클릭 시 닫힘 */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 슬라이드인 패널 */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col">
        {/* 패널 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            {PANEL_TITLE[cardType]}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        {/* 패널 본문 — 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {isIssuePanel ? (
            issues.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">표시할 일감이 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {issues.map((issue) => (
                  <li
                    key={issue.id}
                    className="p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  >
                    {/* 제목 */}
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-2 leading-snug">
                      {issue.title}
                    </p>
                    {/* 메타 정보 행 */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* 상태 배지 */}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                        {issue.status}
                      </span>
                      {/* 우선순위 */}
                      <span className={`text-xs font-medium ${PRIORITY_COLOR[issue.priority] ?? 'text-gray-500'}`}>
                        {issue.priority}
                      </span>
                      {/* 마감일 */}
                      {issue.dueDate && (
                        <span className="text-xs text-gray-400 ml-auto">
                          마감: {issue.dueDate}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            // 커밋 목록
            commits.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">표시할 커밋이 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {commits.map((commit) => (
                  <li
                    key={commit.shortId}
                    className="p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  >
                    {/* short_id + 제목 */}
                    <p className="text-sm text-gray-800 dark:text-gray-100 mb-1.5 leading-snug">
                      <span className="font-mono text-xs text-purple-600 dark:text-purple-400 mr-1.5">
                        {commit.shortId}
                      </span>
                      {commit.title}
                    </p>
                    {/* 작성자 + 날짜 */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{commit.author}</span>
                      <span className="text-xs text-gray-400">{commit.date}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>
    </>
  )
}
```

### Step 2: 빌드 확인

```bash
npm run build
```

Expected: 오류 없이 빌드 성공

### Step 3: Commit

```bash
git add src/components/dashboard/SummaryDetailPanel.tsx
git commit -m "feat: 대시보드 카드 상세 슬라이드인 패널 컴포넌트 신규 생성"
```

---

## Task 2: DashboardPage — recentActivity에 url 필드 추가

**Files:**
- Modify: `src/pages/DashboardPage.tsx`

### 목표

`recentActivity` 각 항목에 `url` 필드를 추가한다.
- 커밋: GitLab API 응답의 `web_url` 필드 사용
- 이슈: `${redmineUrl}/issues/${id}` 조합

### 핵심 설계 결정

- `redmineUrl`은 `useSettingsStore`의 `redmine.url`에서 가져옴 (이미 환경변수 기반으로 초기화됨)
- `web_url`이 없는 커밋은 `url: undefined`로 처리 (링크 미표시)
- `recentActivity` 타입: 기존 인라인 객체 구조에 `url?: string` 추가

### Step 1: settingsStore에서 redmineUrl 구독

DashboardPage 상단 imports/state 영역에서 `redmineUrl` 추가 구독:

```typescript
// 기존 코드 (66~68행)
const glToken = useSettingsStore((s) => s.gitlab.token)
const rmApiKey = useSettingsStore((s) => s.redmine.apiKey)

// redmineUrl 추가
const redmineUrl = useSettingsStore((s) => s.redmine.url)
```

### Step 2: recentActivity useMemo — url 필드 추가

```typescript
// 기존 커밋 매핑 (100~107행)
...commits.slice(0, 10).map((c) => ({
  type: 'commit' as const,
  id: c.id,
  title: c.title,
  author: c.author_name,
  date: c.authored_date,
  ref: c.short_id,
})),

// 변경 후 — url 필드 추가
...commits.slice(0, 10).map((c) => ({
  type: 'commit' as const,
  id: c.id,
  title: c.title,
  author: c.author_name,
  date: c.authored_date,
  ref: c.short_id,
  url: c.web_url as string | undefined,
})),

// 기존 이슈 매핑 (109~120행)
...issues
  .slice()
  .sort((a, b) => new Date(b.updated_on).getTime() - new Date(a.updated_on).getTime())
  .slice(0, 10)
  .map((i) => ({
    type: 'issue' as const,
    id: String(i.id),
    title: i.subject,
    author: i.assigned_to?.name ?? i.author.name,
    date: i.updated_on,
    ref: `#${i.id}`,
  })),

// 변경 후 — url 필드 추가
...issues
  .slice()
  .sort((a, b) => new Date(b.updated_on).getTime() - new Date(a.updated_on).getTime())
  .slice(0, 10)
  .map((i) => ({
    type: 'issue' as const,
    id: String(i.id),
    title: i.subject,
    author: i.assigned_to?.name ?? i.author.name,
    date: i.updated_on,
    ref: `#${i.id}`,
    url: redmineUrl ? `${redmineUrl}/issues/${i.id}` : undefined,
  })),
```

### Step 3: recentActivity useMemo의 의존성 배열에 redmineUrl 추가

```typescript
// 변경 전
  }, [commits, issues])

// 변경 후
  }, [commits, issues, redmineUrl])
```

### Step 4: JSX — 최근 활동 항목에 링크 적용

기존 `<li>` 내부의 제목 span을 조건부 `<a>` 태그로 교체:

```tsx
// 기존 (229~232행)
<span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
  <span className="font-mono text-xs text-gray-400 mr-1.5">{activity.ref}</span>
  {activity.title}
</span>

// 변경 후 — url이 있으면 링크, 없으면 span 그대로
{activity.url ? (
  <a
    href={activity.url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
  >
    <span className="font-mono text-xs text-gray-400 mr-1.5">{activity.ref}</span>
    {activity.title}
  </a>
) : (
  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
    <span className="font-mono text-xs text-gray-400 mr-1.5">{activity.ref}</span>
    {activity.title}
  </span>
)}
```

### Step 5: 빌드 확인

```bash
npm run build
```

Expected: TypeScript 타입 오류 없이 빌드 성공

### Step 6: Commit

```bash
git add src/pages/DashboardPage.tsx
git commit -m "feat: 대시보드 최근 활동 항목에 GitLab/Redmine 링크 추가 (새 탭 열기)"
```

---

## Task 3: DashboardPage — 최근 활동 기간 필터 드롭다운 추가

**Files:**
- Modify: `src/pages/DashboardPage.tsx`

### 목표

최근 활동 섹션 헤더에 기간 선택 드롭다운을 추가한다.
기본값 1주일, 옵션: 1일/3일/1주일/2주일/1개월/전체.
`recentActivity` useMemo에서 기간 필터를 적용하고 이후 작성자 필터가 추가로 적용되도록 한다.

### 핵심 설계 결정

- 기간 상태: `useState<number | null>` — null = 전체, 숫자 = 일수 (days)
- 기간 옵션: `{ label: '1일', days: 1 } | { label: '전체', days: null }` 형태의 상수 배열
- 기간 필터는 `recentActivity` useMemo 내부에서 적용 (date 기준)
- 기존 `recentActivity.slice(0, 15)` 제한과 함께 동작

### Step 1: 기간 옵션 상수 및 상태 추가

`DashboardPage` 함수 위에 상수 선언:

```typescript
// 최근 활동 기간 필터 옵션 (days: null = 전체)
const PERIOD_OPTIONS: { label: string; days: number | null }[] = [
  { label: '1일', days: 1 },
  { label: '3일', days: 3 },
  { label: '1주일', days: 7 },
  { label: '2주일', days: 14 },
  { label: '1개월', days: 30 },
  { label: '전체', days: null },
]
```

`DashboardPage` 함수 내부, 기존 `selectedAuthor` useState 근처에 추가:

```typescript
// 최근 활동 기간 필터 상태 (기본: 7일)
const [activityPeriodDays, setActivityPeriodDays] = useState<number | null>(7)
```

### Step 2: recentActivity useMemo — 기간 필터 적용

기존 `recentActivity` useMemo 내 `.sort().slice(0, 15)` 직전에 기간 필터 추가:

```typescript
const recentActivity = useMemo(() => {
  // 기간 기준 날짜 계산 (null이면 필터 없음)
  const cutoff = activityPeriodDays !== null
    ? new Date(Date.now() - activityPeriodDays * 24 * 60 * 60 * 1000)
    : null

  const activities = [
    ...commits.slice(0, 10).map((c) => ({
      type: 'commit' as const,
      id: c.id,
      title: c.title,
      author: c.author_name,
      date: c.authored_date,
      ref: c.short_id,
      url: c.web_url as string | undefined,
    })),
    ...issues
      .slice()
      .sort((a, b) => new Date(b.updated_on).getTime() - new Date(a.updated_on).getTime())
      .slice(0, 10)
      .map((i) => ({
        type: 'issue' as const,
        id: String(i.id),
        title: i.subject,
        author: i.assigned_to?.name ?? i.author.name,
        date: i.updated_on,
        ref: `#${i.id}`,
        url: redmineUrl ? `${redmineUrl}/issues/${i.id}` : undefined,
      })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    // 기간 필터 적용 (cutoff 이후 항목만)
    .filter((a) => !cutoff || new Date(a.date) >= cutoff)
    .slice(0, 15)

  return activities
}, [commits, issues, redmineUrl, activityPeriodDays])
```

### Step 3: JSX — 헤더에 기간 드롭다운 추가

최근 활동 헤더(`h3` + 작성자 드롭다운)에 기간 드롭다운 추가:

```tsx
// 변경 전 헤더
<div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">최근 활동</h3>
  {activityAuthors.length > 0 && (
    <select ...작성자 드롭다운... />
  )}
</div>

// 변경 후 — 기간 드롭다운 + 작성자 드롭다운 나란히
<div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">최근 활동</h3>
  <div className="flex items-center gap-2">
    {/* 기간 필터 드롭다운 */}
    <select
      value={activityPeriodDays ?? 'all'}
      onChange={(e) => {
        const val = e.target.value
        setActivityPeriodDays(val === 'all' ? null : Number(val))
      }}
      className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {PERIOD_OPTIONS.map((opt) => (
        <option key={opt.label} value={opt.days ?? 'all'}>
          {opt.label}
        </option>
      ))}
    </select>
    {/* 작성자 드롭다운 (기존 유지) */}
    {activityAuthors.length > 0 && (
      <select
        value={selectedAuthor}
        onChange={(e) => setSelectedAuthor(e.target.value)}
        className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">전체 작성자</option>
        {activityAuthors.map((author) => (
          <option key={author} value={author}>
            {author}
          </option>
        ))}
      </select>
    )}
  </div>
</div>
```

### Step 4: 빌드 확인

```bash
npm run build
```

Expected: 오류 없이 빌드 성공

### Step 5: Commit

```bash
git add src/pages/DashboardPage.tsx
git commit -m "feat: 대시보드 최근 활동 기간 필터 드롭다운 추가 (기본 1주일)"
```

---

## Task 4: DashboardPage — 요약 카드 클릭 시 SummaryDetailPanel 연결

**Files:**
- Modify: `src/pages/DashboardPage.tsx`
- Modify: `src/components/dashboard/SummaryDetailPanel.tsx` (필요 시 타입 보정)

### 목표

4개 요약 카드(담당일감/이번주커밋/진행중/기한초과)에 클릭 핸들러를 연결하여 SummaryDetailPanel을 표시한다.
각 카드가 열어야 할 상세 데이터(이슈 목록, 커밋 목록)를 DashboardPage에서 가공하여 패널에 전달한다.

### 핵심 설계 결정

- `activeCard` 상태: `useState<CardType | null>(null)` — null = 패널 닫힘
- 카드별 상세 데이터는 useMemo로 파생:
  - `totalIssues` → `DONE_STATUSES`에 포함되지 않는 이슈 전체
  - `weeklyCommits` → 현재 로드된 커밋 전체
  - `inProgress` → `status.name === IN_PROGRESS_STATUS` 이슈
  - `overdue` → 마감일이 오늘 이전이고 DONE_STATUSES 미포함 이슈
- `SummaryCard`에 `onClick?: () => void` props 추가

### Step 1: SummaryCard — onClick props 추가

`DashboardPage.tsx` 상단의 `SummaryCardProps` 인터페이스에 `onClick` 추가:

```typescript
interface SummaryCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: number | string
  color: 'blue' | 'purple' | 'yellow' | 'red'
  isLoading?: boolean
  onClick?: () => void  // 추가
}
```

`SummaryCard` 함수 시그니처에 `onClick` 추가 후 `div`에 적용:

```tsx
function SummaryCard({ icon: Icon, label, value, color, isLoading, onClick }: SummaryCardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* 기존 내부 JSX 그대로 유지 */}
```

### Step 2: 패널 상태 및 상세 데이터 useMemo 추가

`DashboardPage` 함수 내부 `stats` useMemo 아래에 추가:

```typescript
// 패널 열림 상태
const [activeCard, setActiveCard] = useState<CardType | null>(null)

// 카드 타입 import — SummaryDetailPanel에서 가져옴
// import { SummaryDetailPanel, type CardType, ... } from '@/components/dashboard/SummaryDetailPanel'

// 담당일감 상세: 미완료 이슈 전체
const totalIssueItems = useMemo<IssueSummaryItem[]>(() => {
  return issues
    .filter((i) => !DONE_STATUSES.includes(i.status.name))
    .map((i) => ({
      id: i.id,
      title: i.subject,
      status: i.status.name,
      priority: i.priority.name,
      dueDate: i.due_date ?? undefined,
    }))
}, [issues])

// 진행중 상세
const inProgressItems = useMemo<IssueSummaryItem[]>(() => {
  return issues
    .filter((i) => i.status.name === IN_PROGRESS_STATUS)
    .map((i) => ({
      id: i.id,
      title: i.subject,
      status: i.status.name,
      priority: i.priority.name,
      dueDate: i.due_date ?? undefined,
    }))
}, [issues])

// 기한초과 상세
const overdueItems = useMemo<IssueSummaryItem[]>(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return issues
    .filter((i) => {
      if (!i.due_date || DONE_STATUSES.includes(i.status.name)) return false
      return new Date(i.due_date) < today
    })
    .map((i) => ({
      id: i.id,
      title: i.subject,
      status: i.status.name,
      priority: i.priority.name,
      dueDate: i.due_date ?? undefined,
    }))
}, [issues])

// 이번주커밋 상세
const weeklyCommitItems = useMemo<CommitSummaryItem[]>(() => {
  return commits.map((c) => ({
    shortId: c.short_id,
    title: c.title,
    author: c.author_name,
    date: new Date(c.authored_date).toLocaleDateString('ko-KR'),
  }))
}, [commits])
```

### Step 3: SummaryCard에 onClick 연결

각 `SummaryCard` JSX에 `onClick` props 추가:

```tsx
<SummaryCard
  icon={ClipboardList}
  label="담당 일감"
  value={stats.totalIssues}
  color="blue"
  isLoading={issuesLoading}
  onClick={() => setActiveCard('totalIssues')}
/>
<SummaryCard
  icon={GitCommitHorizontal}
  label="이번 주 커밋"
  value={stats.weeklyCommits}
  color="purple"
  isLoading={commitsLoading}
  onClick={() => setActiveCard('weeklyCommits')}
/>
<SummaryCard
  icon={PlayCircle}
  label="진행 중"
  value={stats.inProgress}
  color="yellow"
  isLoading={issuesLoading}
  onClick={() => setActiveCard('inProgress')}
/>
<SummaryCard
  icon={AlertTriangle}
  label="기한 초과"
  value={stats.overdue}
  color="red"
  isLoading={issuesLoading}
  onClick={() => setActiveCard('overdue')}
/>
```

### Step 4: SummaryDetailPanel JSX 추가

JSX 최하단(닫는 `</div>` 직전)에 패널 렌더링 추가:

```tsx
{/* 카드 상세 슬라이드인 패널 */}
<SummaryDetailPanel
  cardType={activeCard}
  issues={
    activeCard === 'totalIssues'
      ? totalIssueItems
      : activeCard === 'inProgress'
      ? inProgressItems
      : overdueItems
  }
  commits={weeklyCommitItems}
  onClose={() => setActiveCard(null)}
/>
```

### Step 5: import 정리

`DashboardPage.tsx` 상단에 추가:

```typescript
import { SummaryDetailPanel, type CardType, type IssueSummaryItem, type CommitSummaryItem } from '@/components/dashboard/SummaryDetailPanel'
```

### Step 6: 빌드 확인

```bash
npm run build
```

Expected: 오류 없이 빌드 성공

### Step 7: 동작 확인 포인트

- 담당 일감 카드 클릭 → 우측 패널에 미완료 이슈 목록 표시 (제목/상태/우선순위/마감일)
- 이번 주 커밋 카드 클릭 → 우측 패널에 커밋 목록 표시 (short_id/제목/작성자/날짜)
- 진행 중 카드 클릭 → 진행 중 상태 이슈만 표시
- 기한 초과 카드 클릭 → 기한 초과 이슈만 표시
- 패널 외부(오버레이) 클릭 또는 X 버튼 클릭 시 패널 닫힘
- 커서: 카드 위에서 pointer로 변경됨

### Step 8: Commit

```bash
git add src/pages/DashboardPage.tsx src/components/dashboard/SummaryDetailPanel.tsx
git commit -m "feat: 대시보드 요약 카드 클릭 시 상세 슬라이드인 패널 연결"
```

---

## 완료 기준 (Definition of Done)

- ⬜ 담당 일감 카드 클릭 시 미완료 이슈 목록 패널 표시 (제목, 상태, 우선순위, 마감일)
- ⬜ 이번 주 커밋 카드 클릭 시 커밋 목록 패널 표시 (short_id, 제목, 작성자, 날짜)
- ⬜ 진행 중 카드 클릭 시 진행 중 이슈만 패널 표시
- ⬜ 기한 초과 카드 클릭 시 기한 초과 이슈만 패널 표시
- ⬜ 패널 오버레이 클릭 또는 X 버튼으로 패널 닫힘
- ⬜ 최근 활동 커밋 항목에 GitLab `web_url` 링크 표시 (새 탭)
- ⬜ 최근 활동 이슈 항목에 `${redmineUrl}/issues/${id}` 링크 표시 (새 탭)
- ⬜ 최근 활동 헤더에 기간 드롭다운 표시 (기본값: 1주일)
- ⬜ 기간 선택 변경 시 활동 목록 즉시 클라이언트 사이드 필터링
- ⬜ 기간 드롭다운 + 작성자 드롭다운이 나란히 표시되며 두 필터 복합 적용
- ⬜ `npm run build` 오류 없이 성공
- ⬜ 기존 기능(온보딩, 조회 버튼, GitLab/Redmine 페이지) 정상 동작 유지

---

## 예상 변경 파일 목록

| 파일 | 변경 유형 | 주요 내용 |
|------|----------|----------|
| `src/components/dashboard/SummaryDetailPanel.tsx` | 신규 생성 | 슬라이드인 패널 컴포넌트 |
| `src/pages/DashboardPage.tsx` | 수정 | url 필드 추가, 기간 필터, 카드 onClick, 패널 연결 |

---

## 의존성 및 리스크

| 항목 | 내용 | 대응 |
|------|------|------|
| `web_url` 필드 미존재 | GitLab API 버전에 따라 `web_url` 응답에 포함되지 않을 수 있음 | `url: c.web_url as string \| undefined`로 타입 처리, 없으면 링크 미표시 |
| Redmine URL 미설정 | 환경변수 미설정 시 `redmineUrl`이 빈 문자열 → URL 조합 결과가 `/issues/123` 형태 | `redmineUrl ? ...` 조건부 처리로 빈 문자열이면 url 필드를 undefined로 설정 |
| 이슈 데이터 없음 | 프로젝트 미선택 상태에서 카드 클릭 시 패널에 빈 목록 표시 | "표시할 일감이 없습니다." 빈 상태 메시지 이미 구현됨 |
| 패널 z-index 충돌 | ChatbotPanel(플로팅)과 z-index 겹침 가능성 | 패널 z-50, 오버레이 z-40 할당. ChatbotPanel z-index 확인 후 조정 필요 시 수정 |

---

## 주의사항 (기존 패턴 준수)

- **Tailwind CSS v4**: `cn()` 유틸이나 shadcn 컴포넌트 사용하지 않고 className 직접 작성.
- **한국어 주석**: 새로 추가하는 주석은 모두 한국어로 작성.
- **스토어 직접 수정 금지**: DashboardPage의 기간/작성자 필터는 store가 아닌 useState 로컬 상태 유지.
- **기존 appliedFilter 패턴 비적용**: 기간/작성자 필터는 클라이언트 사이드 필터링이므로 조회 버튼 불필요.
