import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Settings } from 'lucide-react'
import { ProjectVersionSelector } from '@/components/redmine/ProjectVersionSelector'
import { VersionProgressBar } from '@/components/redmine/VersionProgressBar'
import { DueSoonBanner } from '@/components/redmine/DueSoonBanner'
import { IssueFilterBar } from '@/components/redmine/IssueFilterBar'
import { IssueTree } from '@/components/redmine/IssueTree'
import { useRedmineIssues } from '@/hooks/useRedmineIssues'
import { useRedmineStore } from '@/store/redmineStore'
import { useSettingsStore } from '@/store/settingsStore'
import { buildIssueTree, filterIssueTree } from '@/utils/issueTreeBuilder'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'

function IssueSkeleton() {
  return (
    <div className="space-y-2 p-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
      ))}
    </div>
  )
}

export function RedminePage() {
  const apiKey = useSettingsStore((s) => s.redmine.apiKey)
  const {
    selectedProjectId,
    selectedVersionId,
    // 적용된 필터 사용 (조회 버튼 클릭 후 반영)
    appliedStatusFilter,
    appliedPriorityFilter,
    appliedKeyword,
  } = useRedmineStore()

  useAutoRefresh([['redmine', 'projects'], ['redmine', 'issues']])

  const { data: issues = [], isLoading, isError, error } = useRedmineIssues(selectedProjectId, selectedVersionId)

  // 트리 구성 + 적용된 필터 반영
  const filteredTree = useMemo(() => {
    const tree = buildIssueTree(issues)
    if (appliedStatusFilter.length === 0 && appliedPriorityFilter.length === 0 && !appliedKeyword) return tree
    return filterIssueTree(tree, (node) => {
      if (appliedStatusFilter.length > 0 && !appliedStatusFilter.includes(node.status.name)) return false
      if (appliedPriorityFilter.length > 0 && !appliedPriorityFilter.includes(node.priority.name)) return false
      if (appliedKeyword && !node.subject.toLowerCase().includes(appliedKeyword.toLowerCase())) return false
      return true
    })
  }, [issues, appliedStatusFilter, appliedPriorityFilter, appliedKeyword])

  if (!apiKey) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
        <AlertCircle size={32} className="opacity-50" />
        <p className="text-sm">Redmine API 키가 설정되지 않았습니다.</p>
        <Link to="/settings" className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
          <Settings size={14} />
          설정 페이지로 이동
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* 필터 영역 — 카드화 + 그림자 */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 space-y-3 shadow-sm">
        <ProjectVersionSelector />

        {selectedProjectId && issues.length > 0 && (
          <>
            <VersionProgressBar issues={issues} />
            <DueSoonBanner issues={issues} />
            <IssueFilterBar issues={issues} />
          </>
        )}
      </div>

      {/* 일감 트리 */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 p-3">
        {!selectedProjectId ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">프로젝트를 선택하세요.</p>
          </div>
        ) : isLoading ? (
          <IssueSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-red-500">
            <AlertCircle size={32} />
            <p className="text-sm">
              {error instanceof Error && error.message === 'REDMINE_UNAUTHORIZED'
                ? 'Redmine API 키가 유효하지 않습니다. 설정을 확인하세요.'
                : error instanceof Error && error.message === 'REDMINE_FORBIDDEN'
                ? '해당 프로젝트에 접근 권한이 없습니다.'
                : '서버에 연결할 수 없습니다.'}
            </p>
          </div>
        ) : (
          <IssueTree nodes={filteredTree} />
        )}
      </div>
    </div>
  )
}
