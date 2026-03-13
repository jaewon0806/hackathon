import { ClipboardList, ChevronsUpDown } from 'lucide-react'
import { IssueTreeNode } from './IssueTreeNode'
import { useRedmineStore } from '@/store/redmineStore'
import type { IssueNode } from '@/types/redmine.types'

interface Props {
  nodes: IssueNode[]
}

function collectAllIds(nodes: IssueNode[]): number[] {
  return nodes.flatMap((n) => [n.id, ...collectAllIds(n.children)])
}

export function IssueTree({ nodes }: Props) {
  const { setExpandedIssueIds, expandedIssueIds } = useRedmineStore()

  const allIds = collectAllIds(nodes)
  const allExpanded = allIds.every((id) => expandedIssueIds.includes(id))

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedIssueIds([])
    } else {
      setExpandedIssueIds(allIds)
    }
  }

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <ClipboardList size={40} className="mb-3 opacity-40" />
        <p className="text-sm">조건에 맞는 일감이 없습니다.</p>
      </div>
    )
  }

  return (
    <div>
      {/* 전체 펼치기/접기 */}
      <div className="flex justify-end px-3 pb-2">
        <button
          onClick={toggleAll}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <ChevronsUpDown size={13} />
          {allExpanded ? '전체 접기' : '전체 펼치기'}
        </button>
      </div>

      <div className="space-y-0.5">
        {nodes.map((node) => (
          <IssueTreeNode key={node.id} node={node} />
        ))}
      </div>
    </div>
  )
}
