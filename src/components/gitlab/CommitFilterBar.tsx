import { Search } from 'lucide-react'
import { useGitlabStore } from '@/store/gitlabStore'

export function CommitFilterBar() {
  const { authorFilter, dateRange, keyword, setAuthorFilter, setDateRange, setKeyword } = useGitlabStore()

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* 작성자 필터 */}
      <div>
        <input
          type="text"
          value={authorFilter[0] ?? ''}
          onChange={(e) => setAuthorFilter(e.target.value ? [e.target.value] : [])}
          placeholder="작성자"
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
        />
      </div>

      {/* 기간 필터 */}
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-400 text-sm">~</span>
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 키워드 검색 */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="커밋 메시지 검색"
          className="pl-8 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
        />
      </div>
    </div>
  )
}
