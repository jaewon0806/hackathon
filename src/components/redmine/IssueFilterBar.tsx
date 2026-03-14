import { Search, SlidersHorizontal } from 'lucide-react'
import { useRedmineStore } from '@/store/redmineStore'
import type { RedmineIssue } from '@/types/redmine.types'

interface Props {
  issues: RedmineIssue[]
}

export function IssueFilterBar({ issues }: Props) {
  const {
    statusFilter,
    priorityFilter,
    keyword,
    setStatusFilter,
    setPriorityFilter,
    setKeyword,
    applyFilters,
  } = useRedmineStore()

  // 이슈 목록에서 상태/우선순위 옵션 추출
  const statuses = [...new Set(issues.map((i) => i.status.name))]
  const priorities = [...new Set(issues.map((i) => i.priority.name))]

  const toggleStatus = (s: string) =>
    setStatusFilter(statusFilter.includes(s) ? statusFilter.filter((x) => x !== s) : [...statusFilter, s])

  const togglePriority = (p: string) =>
    setPriorityFilter(priorityFilter.includes(p) ? priorityFilter.filter((x) => x !== p) : [...priorityFilter, p])

  // Enter 키로 조회 실행
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') applyFilters()
  }

  return (
    <div className="flex items-center gap-2 flex-wrap sm:flex-row flex-col sm:items-center">
      {/* 상태 필터 */}
      {statuses.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => toggleStatus(s)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                statusFilter.includes(s)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* 우선순위 필터 */}
      {priorities.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {priorities.map((p) => (
            <button
              key={p}
              onClick={() => togglePriority(p)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                priorityFilter.includes(p)
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-orange-400'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* 키워드 검색 */}
      <div className="relative w-full sm:w-auto">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="일감 검색"
          className="pl-8 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow w-full sm:w-44"
        />
      </div>

      {/* 조회 버튼 */}
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
