import { X, ExternalLink } from 'lucide-react'
import type { RedmineIssue } from '@/types/redmine.types'
import type { GitlabCommit } from '@/types/gitlab.types'
import { DONE_STATUSES, IN_PROGRESS_STATUS } from '@/constants/redmine'

export type CardType = 'issues' | 'commits' | 'inProgress' | 'overdue'

interface SummaryDetailPanelProps {
  type: CardType
  issues: RedmineIssue[]
  commits: GitlabCommit[]
  redmineUrl: string
  gitlabUrl: string
  onClose: () => void
}

const PANEL_LABELS: Record<CardType, string> = {
  issues: '담당 일감',
  commits: '이번 주 커밋',
  inProgress: '진행 중 일감',
  overdue: '기한 초과 일감',
}

// 우선순위 색상 매핑
const PRIORITY_COLOR: Record<string, string> = {
  긴급: 'text-red-600 dark:text-red-400',
  높음: 'text-orange-500 dark:text-orange-400',
  보통: 'text-gray-500 dark:text-gray-400',
  낮음: 'text-gray-400 dark:text-gray-500',
}

function formatShortDate(dateStr: string | undefined): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function SummaryDetailPanel({
  type,
  issues,
  commits,
  redmineUrl,
  gitlabUrl,
  onClose,
}: SummaryDetailPanelProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 카드 타입에 따라 표시할 데이터 필터링
  const filteredIssues = (() => {
    if (type === 'issues') return issues.filter((i) => !DONE_STATUSES.includes(i.status.name))
    if (type === 'inProgress') return issues.filter((i) => i.status.name === IN_PROGRESS_STATUS)
    if (type === 'overdue')
      return issues.filter((i) => {
        if (!i.due_date || DONE_STATUSES.includes(i.status.name)) return false
        return new Date(i.due_date) < today
      })
    return []
  })()

  const isCommitType = type === 'commits'

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 슬라이드인 패널 */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            {PANEL_LABELS[type]}
            <span className="ml-2 text-sm font-normal text-gray-400">
              {isCommitType ? commits.length : filteredIssues.length}건
            </span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto">
          {isCommitType ? (
            /* 커밋 목록 */
            commits.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-sm text-gray-400">
                커밋이 없습니다.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {commits.map((c) => (
                  <li key={c.id} className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-100 truncate">{c.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <code className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{c.short_id}</code>
                          <span>{c.author_name}</span>
                          <span>{formatShortDate(c.authored_date)}</span>
                        </div>
                      </div>
                      <a
                        href={c.web_url || `${gitlabUrl}/-/commit/${c.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            /* 이슈 목록 */
            filteredIssues.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-sm text-gray-400">
                해당 일감이 없습니다.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredIssues.map((i) => (
                  <li key={i.id} className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-100 truncate">{i.subject}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="text-gray-400 font-mono">#{i.id}</span>
                          <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {i.status.name}
                          </span>
                          <span className={PRIORITY_COLOR[i.priority.name] ?? 'text-gray-400'}>
                            {i.priority.name}
                          </span>
                          {i.due_date && (
                            <span className={new Date(i.due_date) < today ? 'text-red-500 font-medium' : 'text-gray-400'}>
                              마감 {formatShortDate(i.due_date)}
                            </span>
                          )}
                        </div>
                      </div>
                      <a
                        href={`${redmineUrl}/issues/${i.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
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
