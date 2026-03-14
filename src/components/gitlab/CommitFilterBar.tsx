import { Search, SlidersHorizontal } from 'lucide-react'
import { useGitlabStore } from '@/store/gitlabStore'

interface CommitFilterBarProps {
  authors?: string[]
}

export function CommitFilterBar({ authors = [] }: CommitFilterBarProps) {
  const { authorFilter, dateRange, keyword, setAuthorFilter, setDateRange, setKeyword, applyFilters } =
    useGitlabStore()

  // Enter 키로 조회 실행
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

      {/* 기간 필터 */}
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

      {/* 키워드 검색 */}
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
