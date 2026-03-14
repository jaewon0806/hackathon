import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Settings } from 'lucide-react'
import { ProjectBranchSelector } from '@/components/gitlab/ProjectBranchSelector'
import { CommitFilterBar } from '@/components/gitlab/CommitFilterBar'
import { CommitList } from '@/components/gitlab/CommitList'
import { CommitSkeleton } from '@/components/common/SkeletonLoader'
import { useGitlabCommits } from '@/hooks/useGitlabCommits'
import { useGitlabStore } from '@/store/gitlabStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'

export function GitlabPage() {
  const token = useSettingsStore((s) => s.gitlab.token)
  const {
    selectedProjectId,
    selectedBranch,
    // 적용된 필터 사용 (조회 버튼 클릭 후 반영)
    appliedAuthorFilter,
    appliedDateRange,
    appliedKeyword,
  } = useGitlabStore()

  const filters = useMemo(
    () => ({
      author: appliedAuthorFilter[0],
      since: appliedDateRange.from ? `${appliedDateRange.from}T00:00:00Z` : undefined,
      until: appliedDateRange.to ? `${appliedDateRange.to}T23:59:59Z` : undefined,
      search: appliedKeyword || undefined,
    }),
    [appliedAuthorFilter, appliedDateRange, appliedKeyword]
  )

  useAutoRefresh([['gitlab', 'projects'], ['gitlab', 'commits']])

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGitlabCommits(selectedProjectId, selectedBranch, filters)

  const commits = useMemo(() => data?.pages.flat() ?? [], [data])

  // 현재 조회된 커밋에서 작성자 목록 추출 (중복 제거, 알파벳 정렬)
  const authors = useMemo(() => {
    const names = commits.map((c) => c.author_name).filter(Boolean)
    return [...new Set(names)].sort()
  }, [commits])

  // API 미설정 안내
  if (!token) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
        <AlertCircle size={32} className="opacity-50" />
        <p className="text-sm">GitLab 토큰이 설정되지 않았습니다.</p>
        <Link
          to="/settings"
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
        >
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
        <ProjectBranchSelector />
        {selectedProjectId && <CommitFilterBar authors={authors} />}
      </div>

      {/* 커밋 목록 */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
        {!selectedProjectId ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">프로젝트를 선택하세요.</p>
          </div>
        ) : !selectedBranch ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">브랜치를 선택하세요.</p>
          </div>
        ) : isLoading ? (
          <CommitSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-red-500">
            <AlertCircle size={32} />
            <p className="text-sm">
              {error instanceof Error && error.message === 'GITLAB_UNAUTHORIZED'
                ? 'GitLab 토큰이 유효하지 않습니다. 설정을 확인하세요.'
                : error instanceof Error && error.message === 'GITLAB_FORBIDDEN'
                ? '해당 프로젝트에 접근 권한이 없습니다.'
                : '서버에 연결할 수 없습니다.'}
            </p>
          </div>
        ) : (
          <CommitList
            commits={commits}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={!!hasNextPage}
            fetchNextPage={fetchNextPage}
          />
        )}
      </div>
    </div>
  )
}
