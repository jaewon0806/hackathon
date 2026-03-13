import type { RedmineIssue, IssueNode } from '@/types/redmine.types'

export function buildIssueTree(issues: RedmineIssue[]): IssueNode[] {
  const map = new Map<number, IssueNode>()
  const roots: IssueNode[] = []

  // 1단계: 모든 노드를 맵에 등록
  issues.forEach((issue) => {
    map.set(issue.id, { ...issue, children: [] })
  })

  // 2단계: 부모-자식 연결
  issues.forEach((issue) => {
    const node = map.get(issue.id)!
    if (issue.parent?.id && map.has(issue.parent.id)) {
      map.get(issue.parent.id)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

export function filterIssueTree(
  nodes: IssueNode[],
  predicate: (issue: IssueNode) => boolean
): IssueNode[] {
  const result: IssueNode[] = []
  for (const node of nodes) {
    const filteredChildren = filterIssueTree(node.children, predicate)
    if (predicate(node) || filteredChildren.length > 0) {
      result.push({ ...node, children: filteredChildren })
    }
  }
  return result
}
