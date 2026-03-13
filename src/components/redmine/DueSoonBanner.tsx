import { AlertTriangle } from 'lucide-react'
import type { RedmineIssue } from '@/types/redmine.types'

interface Props {
  issues: RedmineIssue[]
}

const DONE_STATUSES = ['해결됨', '완료', '반려']
const DUE_SOON_DAYS = 3

export function DueSoonBanner({ issues }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueSoon = issues.filter((issue) => {
    if (!issue.due_date) return false
    if (DONE_STATUSES.includes(issue.status.name)) return false
    const due = new Date(issue.due_date)
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= DUE_SOON_DAYS
  })

  const overdue = issues.filter((issue) => {
    if (!issue.due_date) return false
    if (DONE_STATUSES.includes(issue.status.name)) return false
    const due = new Date(issue.due_date)
    return due < today
  })

  if (dueSoon.length === 0 && overdue.length === 0) return null

  return (
    <div className="space-y-2">
      {overdue.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          <AlertTriangle size={15} className="shrink-0" />
          <span>
            <strong>기한 초과 {overdue.length}건:</strong>{' '}
            {overdue.map((i) => `#${i.id}`).join(', ')}
          </span>
        </div>
      )}
      {dueSoon.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg text-sm text-orange-700 dark:text-orange-300">
          <AlertTriangle size={15} className="shrink-0" />
          <span>
            <strong>마감 임박 ({DUE_SOON_DAYS}일 이내) {dueSoon.length}건:</strong>{' '}
            {dueSoon.map((i) => `#${i.id}`).join(', ')}
          </span>
        </div>
      )}
    </div>
  )
}
