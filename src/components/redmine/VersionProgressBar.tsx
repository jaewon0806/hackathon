import type { RedmineIssue } from '@/types/redmine.types'

interface Props {
  issues: RedmineIssue[]
}

const DONE_STATUSES = ['해결됨', '완료']

export function VersionProgressBar({ issues }: Props) {
  if (issues.length === 0) return null

  const done = issues.filter((i) => DONE_STATUSES.includes(i.status.name)).length
  const pct = Math.round((done / issues.length) * 100)

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400 shrink-0">
        {pct}% ({done}/{issues.length}건)
      </span>
    </div>
  )
}
