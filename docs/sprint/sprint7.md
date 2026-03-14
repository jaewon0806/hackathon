# Sprint 7 — URL 고정 + 모델 단일화 + 작성자 드롭다운 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** GitLab/Redmine URL을 환경변수 기반으로 고정하고, Claude 모델을 haiku-4-5 단일로 단순화하며, 대시보드와 GitLab 화면에 작성자 드롭다운 필터를 추가한다.

**Architecture:** 설정 페이지에서 URL 입력 필드를 제거해 읽기 전용으로 전환하고, 모델 select를 단일 옵션으로 축소한다. GitlabPage에서 커밋 목록의 `author_name`을 추출해 CommitFilterBar에 내려주면, FilterBar는 text input 대신 select로 교체한다. DashboardPage는 자체 recentActivity 데이터에서 작성자 목록을 도출해 클라이언트 사이드 필터링을 수행한다. 모든 변경은 기존 Zustand 스토어 구조를 그대로 유지한다.

**Tech Stack:** React 18 + TypeScript, Zustand (gitlabStore 기존 authorFilter 재활용), Tailwind CSS v4

---

## 브랜치 준비

Sprint 7은 `hotfix/date-display` (현재 브랜치) 기반으로 `sprint7` 브랜치를 생성한다.
`hotfix/date-display`는 `sprint6` 기반이므로 Sprint 6 변경사항이 모두 포함된다.

```bash
git checkout -b sprint7
```

---

## Task 1: SettingsPage — GitLab URL / Redmine URL 입력 필드 제거

**Files:**
- Modify: `src/pages/SettingsPage.tsx`

### 목표

설정 페이지에서 GitLab URL, Redmine URL 입력 필드를 제거한다.
URL은 환경변수(`VITE_GITLAB_URL`, `VITE_REDMINE_URL`)로만 설정하며, 설정 페이지에서는 변경 불가 상태가 된다.
토큰/API 키 입력 필드와 연결 테스트 버튼은 그대로 유지한다.

### 변경 범위

1. `useState` 초기화: `gitlabUrl`, `redmineUrl` 로컬 상태 제거
2. `handleTestGitlab`: `gitlabUrl` 변수 대신 `store.gitlab.url` 직접 참조
3. `handleTestRedmine`: `redmineUrl` 변수 대신 `store.redmine.url` 직접 참조
4. `handleSave`: `url` 필드를 setGitlab/setRedmine에서 제거 (토큰/apiKey만 저장)
5. JSX: GitLab URL `<div>` 블록 제거, Redmine URL `<div>` 블록 제거
6. 연결 테스트 버튼의 `disabled` 조건: `!gitlabUrl` 조건을 `!store.gitlab.url`로 교체

### 변경 후 SettingsPage 동작 확인 포인트

- GitLab 섹션: Personal Access Token 입력 + 연결 테스트 버튼만 표시
- Redmine 섹션: API Access Key 입력 + 연결 테스트 버튼만 표시
- 연결 테스트 클릭 시 store에 저장된 URL 사용 (환경변수에서 초기화된 값)

### Step 1: 변경 전 스냅샷 확인

`src/pages/SettingsPage.tsx` 63~68행(로컬 상태 선언)과 JSX 119~134행(GitLab URL 블록), 140~155행(Redmine URL 블록) 확인.

### Step 2: 로컬 상태 및 핸들러 수정

```typescript
// 제거 대상 (63, 65행)
const [gitlabUrl, setGitlabUrl] = useState(store.gitlab.url)
const [redmineUrl, setRedmineUrl] = useState(store.redmine.url)

// handleTestGitlab: gitlabUrl → store.gitlab.url
const handleTestGitlab = async () => {
  setTestingGitlab(true)
  const result = await testGitlabConnection(store.gitlab.url, gitlabToken)
  setTestingGitlab(false)
  if (result.success) {
    showToast(`GitLab 연결 성공 (${result.username})`, 'success')
  } else {
    showToast(result.error || 'GitLab 연결 실패', 'error')
  }
}

// handleTestRedmine: redmineUrl → store.redmine.url
const handleTestRedmine = async () => {
  setTestingRedmine(true)
  const result = await testRedmineConnection(store.redmine.url, redmineKey)
  setTestingRedmine(false)
  if (result.success) {
    showToast(`Redmine 연결 성공 (${result.username})`, 'success')
  } else {
    showToast(result.error || 'Redmine 연결 실패', 'error')
  }
}

// handleSave: url 필드 제거
const handleSave = () => {
  store.setGitlab({ token: gitlabToken })
  store.setRedmine({ apiKey: redmineKey })
  store.setAnthropic({ apiKey: anthropicKey, model: claudeModel })
  store.setTheme(theme)
  store.setRefreshInterval(refreshInterval)
  showToast('설정이 저장되었습니다.', 'success')
}
```

### Step 3: JSX에서 URL 입력 블록 제거

GitLab 섹션에서 아래 블록 전체 제거:
```tsx
<div>
  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">GitLab URL</label>
  <TextInput value={gitlabUrl} onChange={setGitlabUrl} placeholder="https://gitlab.example.com" />
</div>
```

연결 테스트 버튼의 disabled 조건 수정:
```tsx
// 변경 전
disabled={testingGitlab || !gitlabUrl || !gitlabToken}
// 변경 후
disabled={testingGitlab || !store.gitlab.url || !gitlabToken}
```

Redmine 섹션에서 아래 블록 전체 제거:
```tsx
<div>
  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Redmine URL</label>
  <TextInput value={redmineUrl} onChange={setRedmineUrl} placeholder="https://redmine.example.com" />
</div>
```

연결 테스트 버튼의 disabled 조건 수정:
```tsx
// 변경 전
disabled={testingRedmine || !redmineUrl || !redmineKey}
// 변경 후
disabled={testingRedmine || !store.redmine.url || !redmineKey}
```

### Step 4: 빌드 확인

```bash
npm run build
```

Expected: 오류 없이 빌드 성공

### Step 5: Commit

```bash
git add src/pages/SettingsPage.tsx
git commit -m "feat: 설정 페이지에서 GitLab/Redmine URL 입력 필드 제거 (환경변수 고정)"
```

---

## Task 2: SettingsPage — Claude 모델 옵션 단일화 (haiku-4-5만 제공)

**Files:**
- Modify: `src/pages/SettingsPage.tsx`

### 목표

Claude 모델 선택 `<select>`에서 sonnet 옵션을 제거하고 haiku-4-5 단일 옵션만 남긴다.
사용자가 선택할 필요가 없으므로 select를 읽기 전용 텍스트로 교체하거나, 단일 옵션 select를 유지한다.
여기서는 select를 완전히 제거하고 고정 텍스트 표시로 교체해 UI를 단순화한다.

### 변경 범위

1. `useState` 초기화: `claudeModel` 로컬 상태 제거 (고정값이므로 불필요)
2. `handleSave`: `model` 필드를 하드코딩된 `'claude-haiku-4-5'`로 고정
3. JSX: 모델 select 블록을 고정 텍스트 표시로 교체

### Step 1: claudeModel 상태 및 select 제거

```typescript
// 제거 대상 (68행)
const [claudeModel, setClaudeModel] = useState(store.anthropic.model)

// handleSave: model 고정
const handleSave = () => {
  store.setGitlab({ token: gitlabToken })
  store.setRedmine({ apiKey: redmineKey })
  store.setAnthropic({ apiKey: anthropicKey, model: 'claude-haiku-4-5' })
  store.setTheme(theme)
  store.setRefreshInterval(refreshInterval)
  showToast('설정이 저장되었습니다.', 'success')
}
```

### Step 2: JSX 모델 select → 고정 텍스트

```tsx
// 변경 전 (165~175행)
<div>
  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Claude 모델</label>
  <select
    value={claudeModel}
    onChange={(e) => setClaudeModel(e.target.value)}
    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="claude-haiku-4-5">claude-haiku-4-5 (빠름/저렴)</option>
    <option value="claude-sonnet-4-6">claude-sonnet-4-6 (정확/상세)</option>
  </select>
</div>

// 변경 후
<div>
  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Claude 모델</label>
  <p className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm">
    claude-haiku-4-5 (빠름/저렴)
  </p>
</div>
```

### Step 3: 빌드 확인

```bash
npm run build
```

Expected: 오류 없이 빌드 성공

### Step 4: Commit

```bash
git add src/pages/SettingsPage.tsx
git commit -m "feat: Claude 모델 옵션을 haiku-4-5 단일로 단순화"
```

---

## Task 3: GitlabPage — 커밋 작성자 목록 추출 및 CommitFilterBar에 전달

**Files:**
- Modify: `src/pages/GitlabPage.tsx`
- Modify: `src/components/gitlab/CommitFilterBar.tsx`

### 목표

GitlabPage에서 현재 로드된 커밋 목록의 `author_name`을 중복 제거 후 정렬하여 `CommitFilterBar`에 props로 전달한다. CommitFilterBar는 이 목록을 받아 text input 대신 select 드롭다운을 렌더링한다.

### 핵심 설계 결정

- 작성자 목록은 현재 조회된 커밋에서 동적으로 추출 (별도 API 호출 없음, 클라이언트 사이드)
- `CommitFilterBar` props 추가: `authors?: string[]`
- `authorFilter`는 기존 `gitlabStore`의 `authorFilter: string[]` 그대로 사용
- 드롭다운 선택값은 단일 선택 (select의 value = `authorFilter[0] ?? ''`)
- 빈 옵션(`''`) 선택 시 = 전체 작성자 (필터 없음)

### Step 1: GitlabPage.tsx — authors 추출 및 CommitFilterBar props 전달

`src/pages/GitlabPage.tsx`의 `commits` useMemo 아래에 추가:

```typescript
// 커밋 작성자 목록 추출 (중복 제거, 알파벳 정렬)
const authors = useMemo(() => {
  const names = commits.map((c) => c.author_name).filter(Boolean)
  return [...new Set(names)].sort()
}, [commits])
```

JSX에서 `CommitFilterBar` 호출 부분 수정:

```tsx
// 변경 전
{selectedProjectId && <CommitFilterBar />}

// 변경 후
{selectedProjectId && <CommitFilterBar authors={authors} />}
```

### Step 2: CommitFilterBar.tsx — props 타입 추가 및 text input → select 교체

```typescript
interface CommitFilterBarProps {
  authors?: string[]
}

export function CommitFilterBar({ authors = [] }: CommitFilterBarProps) {
  const { authorFilter, dateRange, keyword, setAuthorFilter, setDateRange, setKeyword, applyFilters } =
    useGitlabStore()

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') applyFilters()
  }

  return (
    <div className="flex items-center gap-2 flex-wrap sm:flex-row flex-col sm:items-center">
      {/* 작성자 필터 — 드롭다운 */}
      <select
        value={authorFilter[0] ?? ''}
        onChange={(e) => setAuthorFilter(e.target.value ? [e.target.value] : [])}
        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow w-full sm:w-40"
      >
        <option value="">전체 작성자</option>
        {authors.map((author) => (
          <option key={author} value={author}>
            {author}
          </option>
        ))}
      </select>

      {/* 기간 필터 (기존 유지) */}
      <div className="flex items-center gap-1.5 w-full sm:w-auto">
        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          onKeyDown={handleKeyDown}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow flex-1 sm:flex-none"
        />
        <span className="text-gray-400 text-sm">~</span>
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          onKeyDown={handleKeyDown}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow flex-1 sm:flex-none"
        />
      </div>

      {/* 키워드 검색 (기존 유지) */}
      <div className="relative w-full sm:w-auto">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="커밋 메시지 검색"
          className="pl-8 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow w-full sm:w-48"
        />
      </div>

      {/* 조회 버튼 (기존 유지) */}
      <button
        onClick={applyFilters}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors w-full sm:w-auto justify-center"
      >
        <SlidersHorizontal size={14} />
        조회
      </button>
    </div>
  )
}
```

### Step 3: 빌드 확인

```bash
npm run build
```

Expected: TypeScript 타입 오류 없이 빌드 성공

### Step 4: 동작 확인 포인트

- GitLab 페이지에서 프로젝트 + 브랜치 선택 후 커밋 조회
- 작성자 드롭다운에 커밋 작성자 목록이 표시됨
- 작성자 선택 후 "조회" 클릭 시 해당 작성자 커밋만 표시
- "전체 작성자" 선택 시 필터 해제

### Step 5: Commit

```bash
git add src/pages/GitlabPage.tsx src/components/gitlab/CommitFilterBar.tsx
git commit -m "feat: GitLab 화면 작성자 필터를 text input에서 드롭다운으로 교체"
```

---

## Task 4: DashboardPage — 작성자 드롭다운 + 클라이언트 사이드 필터

**Files:**
- Modify: `src/pages/DashboardPage.tsx`

### 목표

대시보드 "최근 활동" 섹션 상단에 작성자 선택 드롭다운을 추가한다.
선택한 작성자의 활동만 표시하도록 `recentActivity`를 클라이언트 사이드에서 필터링한다.
API 재호출 없이 이미 로드된 데이터에서 필터링만 수행한다 (임시 구현).

### 핵심 설계 결정

- 드롭다운 상태: `useState<string>('')` — 로컬 상태로 관리 (store 불필요)
- 작성자 목록: `recentActivity` 배열에서 추출 (커밋의 `author_name`, 이슈의 `assigned_to?.name ?? author.name`)
- 빈 문자열 선택 = 전체 표시
- 필터링은 `recentActivity` useMemo 이후 별도 useMemo에서 처리

### Step 1: 로컬 상태 및 작성자 목록 추출 추가

`DashboardPage` 함수 내부, 기존 `recentActivity` useMemo 아래에 추가:

```typescript
// 작성자 드롭다운 상태
const [selectedAuthor, setSelectedAuthor] = useState('')

// 작성자 목록 추출 (recentActivity에서)
const activityAuthors = useMemo(() => {
  const names = recentActivity.map((a) => a.author).filter(Boolean)
  return [...new Set(names)].sort()
}, [recentActivity])

// 작성자 필터 적용된 활동 목록
const filteredActivity = useMemo(() => {
  if (!selectedAuthor) return recentActivity
  return recentActivity.filter((a) => a.author === selectedAuthor)
}, [recentActivity, selectedAuthor])
```

`useState` 임포트 확인: `DashboardPage.tsx` 상단에 `import { useMemo } from 'react'`가 있으므로 `useState`를 추가해야 한다.

```typescript
// 변경 전
import { useMemo } from 'react'
// 변경 후
import { useMemo, useState } from 'react'
```

### Step 2: JSX — 최근 활동 헤더에 드롭다운 추가

```tsx
// 변경 전
<div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">최근 활동</h3>
</div>

// 변경 후
<div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">최근 활동</h3>
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
```

### Step 3: JSX — recentActivity → filteredActivity로 교체

```tsx
// 변경 전
{recentActivity.length === 0 ? (
  ...
) : (
  <ul className="divide-y divide-gray-50 dark:divide-gray-700">
    {recentActivity.map((activity) => (
```

```tsx
// 변경 후
{filteredActivity.length === 0 ? (
  ...
) : (
  <ul className="divide-y divide-gray-50 dark:divide-gray-700">
    {filteredActivity.map((activity) => (
```

빈 상태 조건: `issuesLoading || commitsLoading` 분기는 그대로 유지.

### Step 4: 빌드 확인

```bash
npm run build
```

Expected: 오류 없이 빌드 성공

### Step 5: 동작 확인 포인트

- 대시보드에서 프로젝트가 선택된 상태일 때 "최근 활동" 헤더 우측에 드롭다운 표시
- 드롭다운에 활동 참여 작성자 목록 표시
- 작성자 선택 시 해당 작성자의 활동만 목록에 표시 (API 재호출 없음)
- "전체 작성자" 선택 시 전체 목록 복원
- 데이터가 없거나 로딩 중인 경우 드롭다운 미표시 (`activityAuthors.length > 0` 조건)

### Step 6: Commit

```bash
git add src/pages/DashboardPage.tsx
git commit -m "feat: 대시보드 최근 활동에 작성자 드롭다운 필터 추가 (클라이언트 사이드)"
```

---

## Task 5: OnboardingModal — GitLab/Redmine URL 입력 필드 제거 동기화

**Files:**
- Read: `src/components/common/OnboardingModal.tsx`

### 목표

OnboardingModal에도 GitLab URL, Redmine URL 입력 필드가 존재할 경우, SettingsPage와 동일하게 제거한다.
URL은 환경변수로 고정되므로 온보딩 모달에서도 URL 입력을 받지 않는다.
`App.tsx`의 `needsOnboarding` 조건도 URL 항목을 제거해야 할 수 있다.

### Step 1: OnboardingModal.tsx 파일 확인

`src/components/common/OnboardingModal.tsx`를 읽어 URL 입력 필드 존재 여부 확인.

### Step 2: URL 입력 필드 제거 (존재하는 경우)

OnboardingModal의 GitLab 단계에서 URL 입력 필드 제거.
Redmine 단계에서 URL 입력 필드 제거.
연결 테스트는 `store.gitlab.url` / `store.redmine.url` (환경변수 기반 초기값) 사용.

### Step 3: App.tsx needsOnboarding 조건 확인 및 수정

`src/App.tsx`에서 `needsOnboarding` 조건을 확인.
현재 MEMORY 기록: GitLab URL + Token + Redmine URL + apiKey 4개 모두 채워져야 모달 닫힘.
URL이 환경변수에서 항상 채워지므로 조건에서 `gitlab.url`, `redmine.url` 제거 필요.
수정 후: GitLab Token + Redmine apiKey + (선택) Anthropic apiKey 확인으로 축소.

### Step 4: 빌드 확인

```bash
npm run build
```

### Step 5: Commit

```bash
git add src/components/common/OnboardingModal.tsx src/App.tsx
git commit -m "feat: 온보딩 모달에서 GitLab/Redmine URL 입력 필드 제거 (환경변수 고정)"
```

---

## 완료 기준 (Definition of Done)

- ✅ 설정 페이지에서 GitLab URL, Redmine URL 입력 필드가 표시되지 않음
- ✅ Claude 모델 선택 드롭다운이 제거되고 haiku-4-5 고정 텍스트로 표시됨
- ✅ GitLab 화면의 작성자 필터가 text input 대신 드롭다운으로 표시됨
- ✅ 드롭다운에 현재 커밋 목록의 작성자가 자동으로 채워짐
- ✅ 대시보드 최근 활동 헤더에 작성자 드롭다운이 표시됨
- ✅ 작성자 선택 시 API 재호출 없이 클라이언트 사이드 필터링 동작
- ✅ `npm run build` 오류 없이 성공
- ✅ 기존 연결 테스트, 조회 버튼, 온보딩 모달 기능 정상 동작 유지

---

## 예상 변경 파일 목록

| 파일 | 변경 유형 | 주요 내용 |
|------|----------|----------|
| `src/pages/SettingsPage.tsx` | 수정 | URL 입력 필드 제거, 모델 select → 고정 텍스트 |
| `src/pages/GitlabPage.tsx` | 수정 | authors useMemo 추가, CommitFilterBar에 props 전달 |
| `src/components/gitlab/CommitFilterBar.tsx` | 수정 | authors props 추가, text input → select 드롭다운 |
| `src/pages/DashboardPage.tsx` | 수정 | 작성자 드롭다운 상태 + filteredActivity useMemo 추가 |
| `src/components/common/OnboardingModal.tsx` | 수정 (조건부) | URL 입력 필드 제거 |
| `src/App.tsx` | 수정 (조건부) | needsOnboarding 조건에서 URL 제거 |

---

## 의존성 및 리스크

| 항목 | 내용 | 대응 |
|------|------|------|
| 환경변수 미설정 | `VITE_GITLAB_URL`이 비어 있으면 연결 테스트 버튼이 비활성화됨 | 정상 동작. `.env.example`에 필수 변수 명시 확인 |
| 커밋 미조회 상태 | 프로젝트/브랜치 미선택 시 작성자 드롭다운 빈 목록 | `authors.length === 0` 시 드롭다운 미표시 또는 disabled 처리 |
| 무한 스크롤과 작성자 목록 | 더 불러오기 전 커밋에서만 작성자 추출 | 현재 로드된 커밋에서만 추출하는 임시 구현으로 명시. 향후 전체 커밋 작성자 API 연동 검토 |

---

## 주의사항 (기존 패턴 준수)

- **appliedFilter 패턴 유지**: 드롭다운 선택 즉시 `setAuthorFilter` 호출 (드래프트 상태 업데이트). 실제 API 호출은 "조회" 버튼 클릭 또는 Enter 시 `applyFilters()` 호출 시점에만 발생.
- **Tailwind CSS v4**: `cn()` 유틸이나 shadcn 컴포넌트 사용하지 않고 className 직접 작성.
- **한국어 주석**: 새로 추가하는 주석은 모두 한국어로 작성.
