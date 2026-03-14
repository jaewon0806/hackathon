import { describe, it, expect } from 'vitest'
import { buildIssueTree, filterIssueTree } from './issueTreeBuilder'
import type { RedmineIssue, IssueNode } from '@/types/redmine.types'

// 테스트용 최소 이슈 픽스처
function makeIssue(id: number, parentId?: number): RedmineIssue {
  return {
    id,
    project: { id: 1, name: 'Test' },
    tracker: { id: 1, name: 'Task' },
    status: { id: 1, name: '진행 중' },
    priority: { id: 2, name: '보통' },
    author: { id: 1, name: '홍길동' },
    subject: `이슈 #${id}`,
    done_ratio: 0,
    created_on: '2026-03-01T00:00:00Z',
    updated_on: '2026-03-15T00:00:00Z',
    ...(parentId !== undefined ? { parent: { id: parentId } } : {}),
  }
}

// ──────────────────────────────────────────
// buildIssueTree
// ──────────────────────────────────────────
describe('buildIssueTree', () => {
  it('빈 배열 입력 시 빈 배열 반환', () => {
    expect(buildIssueTree([])).toEqual([])
  })

  it('parent 없는 이슈 3개 → 루트 3개', () => {
    const issues = [makeIssue(1), makeIssue(2), makeIssue(3)]
    const tree = buildIssueTree(issues)
    expect(tree).toHaveLength(3)
    tree.forEach((node) => expect(node.children).toHaveLength(0))
  })

  it('2단계 계층: 부모 1개 + 자식 2개', () => {
    const issues = [makeIssue(1), makeIssue(2, 1), makeIssue(3, 1)]
    const tree = buildIssueTree(issues)
    expect(tree).toHaveLength(1)
    expect(tree[0].id).toBe(1)
    expect(tree[0].children).toHaveLength(2)
    expect(tree[0].children.map((c) => c.id)).toEqual([2, 3])
  })

  it('3단계 중첩 계층', () => {
    const issues = [makeIssue(1), makeIssue(2, 1), makeIssue(3, 2)]
    const tree = buildIssueTree(issues)
    expect(tree).toHaveLength(1)
    expect(tree[0].children[0].id).toBe(2)
    expect(tree[0].children[0].children[0].id).toBe(3)
  })

  it('map에 없는 parentId 참조 → 고아 이슈는 루트로 처리', () => {
    const issues = [makeIssue(2, 999)]  // 999는 존재하지 않음
    const tree = buildIssueTree(issues)
    expect(tree).toHaveLength(1)
    expect(tree[0].id).toBe(2)
  })

  it('children 배열이 항상 초기화됨 (원본 이슈 객체 오염 없음)', () => {
    const issues = [makeIssue(1), makeIssue(2, 1)]
    buildIssueTree(issues)
    // 원본 이슈 객체에 children 프로퍼티가 없어야 함
    expect((issues[0] as IssueNode).children).toBeUndefined()
  })

  it('입력 순서와 무관하게 트리 구성', () => {
    // 자식이 부모보다 먼저 나오는 경우
    const issues = [makeIssue(2, 1), makeIssue(1)]
    const tree = buildIssueTree(issues)
    expect(tree).toHaveLength(1)
    expect(tree[0].id).toBe(1)
    expect(tree[0].children[0].id).toBe(2)
  })
})

// ──────────────────────────────────────────
// filterIssueTree
// ──────────────────────────────────────────
describe('filterIssueTree', () => {
  function buildTree(issues: RedmineIssue[]): IssueNode[] {
    return buildIssueTree(issues)
  }

  it('빈 배열 입력 → 빈 배열', () => {
    expect(filterIssueTree([], () => true)).toEqual([])
  })

  it('predicate가 항상 false → 빈 배열', () => {
    const tree = buildTree([makeIssue(1), makeIssue(2, 1)])
    expect(filterIssueTree(tree, () => false)).toEqual([])
  })

  it('predicate가 항상 true → 원본 구조 유지', () => {
    const tree = buildTree([makeIssue(1), makeIssue(2, 1)])
    const result = filterIssueTree(tree, () => true)
    expect(result).toHaveLength(1)
    expect(result[0].children).toHaveLength(1)
  })

  it('자식만 predicate 통과 → 부모도 결과에 포함됨', () => {
    const issues = [makeIssue(1), makeIssue(2, 1)]
    issues[1].subject = '검색어 포함'
    const tree = buildTree(issues)
    const result = filterIssueTree(tree, (n) => n.subject.includes('검색어'))
    // 부모(id=1)도 포함되어야 함
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
    expect(result[0].children[0].id).toBe(2)
  })

  it('부모만 predicate 통과, 자식 미통과 → 부모만 반환 (children 빈 배열)', () => {
    const issues = [makeIssue(1), makeIssue(2, 1)]
    issues[0].subject = '검색어 포함'
    const tree = buildTree(issues)
    const result = filterIssueTree(tree, (n) => n.subject.includes('검색어'))
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
    expect(result[0].children).toHaveLength(0)
  })

  it('상태 필터 시뮬레이션 (status.name === "진행 중")', () => {
    const issues = [makeIssue(1), makeIssue(2, 1)]
    issues[1].status = { id: 2, name: '완료' }
    const tree = buildTree(issues)
    const result = filterIssueTree(tree, (n) => n.status.name === '진행 중')
    // id=2(완료)는 걸러지고, id=1(진행중)만 남음
    expect(result[0].id).toBe(1)
    expect(result[0].children).toHaveLength(0)
  })
})
