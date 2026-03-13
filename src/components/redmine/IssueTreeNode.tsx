import { ChevronRight, ChevronDown, ExternalLink } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { useRedmineStore } from '@/store/redmineStore'
import { useSettingsStore } from '@/store/settingsStore'
import type { IssueNode } from '@/types/redmine.types'

interface Props {
  node: IssueNode
  depth?: number
}

function formatDate(dateStr: string | undefined): React.ReactNode {
  if (!dateStr) return null
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isOverdue = date < today
  const formatted = `${date.getMonth() + 1}/${date.getDate()}`
  return (
    <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
      {formatted}
    </span>
  )
}

export function IssueTreeNode({ node, depth = 0 }: Props) {
  const { expandedIssueIds, toggleIssueExpanded } = useRedmineStore()
  const redmineUrl = useSettingsStore((s) => s.redmine.url)
  const isExpanded = expandedIssueIds.includes(node.id)
  const hasChildren = node.children.length > 0

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors group"
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        {/* 펼치기/접기 토글 */}
        <button
          onClick={() => hasChildren && toggleIssueExpanded(node.id)}
          className={`w-4 h-4 flex items-center justify-center shrink-0 ${
            hasChildren
              ? 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              : 'text-transparent cursor-default'
          }`}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <ChevronRight size={14} />
          )}
        </button>

        {/* 이슈 ID */}
        <a
          href={`${redmineUrl}/issues/${node.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline shrink-0"
        >
          #{node.id}
        </a>

        {/* 트래커 */}
        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
          [{node.tracker.name}]
        </span>

        {/* 제목 */}
        <span className="flex-1 text-sm text-gray-800 dark:text-gray-100 truncate">
          {node.subject}
        </span>

        {/* 상태 배지 */}
        <StatusBadge status={node.status.name} />

        {/* 담당자 */}
        {node.assigned_to && (
          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 hidden sm:block">
            {node.assigned_to.name}
          </span>
        )}

        {/* 마감일 */}
        <div className="shrink-0">{formatDate(node.due_date)}</div>

        {/* 완료율 */}
        {node.done_ratio > 0 && (
          <div className="w-16 shrink-0 hidden md:flex items-center gap-1">
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${node.done_ratio}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{node.done_ratio}%</span>
          </div>
        )}

        {/* GitLab 링크 */}
        <a
          href={`${redmineUrl}/issues/${node.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 transition-opacity shrink-0"
        >
          <ExternalLink size={13} />
        </a>
      </div>

      {/* 하위 노드 재귀 렌더링 */}
      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <IssueTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
