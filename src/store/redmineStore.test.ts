import { describe, it, expect, beforeEach } from 'vitest'
import { useRedmineStore } from './redmineStore'

const initialState = {
  selectedProjectId: null,
  selectedVersionId: null,
  expandedIssueIds: [],
  assigneeFilter: [],
  statusFilter: [],
  priorityFilter: [],
  keyword: '',
  appliedProjectId: null,
  appliedVersionId: null,
  appliedStatusFilter: [],
  appliedPriorityFilter: [],
  appliedKeyword: '',
}

beforeEach(() => {
  useRedmineStore.setState(initialState)
})

describe('RedmineStore — setSelectedProjectId', () => {
  it('프로젝트 ID 설정', () => {
    useRedmineStore.getState().setSelectedProjectId(10)
    expect(useRedmineStore.getState().selectedProjectId).toBe(10)
  })

  it('프로젝트 변경 시 selectedVersionId가 null로 리셋', () => {
    useRedmineStore.setState({ selectedVersionId: 5 })
    useRedmineStore.getState().setSelectedProjectId(20)
    expect(useRedmineStore.getState().selectedVersionId).toBeNull()
  })
})

describe('RedmineStore — setSelectedVersionId', () => {
  it('버전 ID 설정', () => {
    useRedmineStore.getState().setSelectedVersionId(7)
    expect(useRedmineStore.getState().selectedVersionId).toBe(7)
  })
})

describe('RedmineStore — toggleIssueExpanded', () => {
  it('없던 ID 추가 → expandedIssueIds에 포함', () => {
    useRedmineStore.getState().toggleIssueExpanded(100)
    expect(useRedmineStore.getState().expandedIssueIds).toContain(100)
  })

  it('있던 ID 재클릭 → expandedIssueIds에서 제거 (토글)', () => {
    useRedmineStore.setState({ expandedIssueIds: [100] })
    useRedmineStore.getState().toggleIssueExpanded(100)
    expect(useRedmineStore.getState().expandedIssueIds).not.toContain(100)
  })

  it('여러 ID 독립적으로 토글', () => {
    useRedmineStore.getState().toggleIssueExpanded(1)
    useRedmineStore.getState().toggleIssueExpanded(2)
    useRedmineStore.getState().toggleIssueExpanded(3)
    expect(useRedmineStore.getState().expandedIssueIds).toEqual([1, 2, 3])

    useRedmineStore.getState().toggleIssueExpanded(2)
    expect(useRedmineStore.getState().expandedIssueIds).toEqual([1, 3])
  })
})

describe('RedmineStore — applyProject (조회 버튼)', () => {
  it('selectedProjectId, selectedVersionId가 applied로 복사', () => {
    useRedmineStore.setState({ selectedProjectId: 5, selectedVersionId: 12 })
    useRedmineStore.getState().applyProject()

    const state = useRedmineStore.getState()
    expect(state.appliedProjectId).toBe(5)
    expect(state.appliedVersionId).toBe(12)
  })

  it('draft 필터 (statusFilter, priorityFilter, keyword)도 함께 applied로 복사', () => {
    useRedmineStore.setState({
      statusFilter: ['진행 중', '신규'],
      priorityFilter: ['높음'],
      keyword: '로그인',
    })
    useRedmineStore.getState().applyProject()

    const state = useRedmineStore.getState()
    expect(state.appliedStatusFilter).toEqual(['진행 중', '신규'])
    expect(state.appliedPriorityFilter).toEqual(['높음'])
    expect(state.appliedKeyword).toBe('로그인')
  })

  it('applyProject 호출 전 applied 값은 초기값 유지', () => {
    useRedmineStore.setState({ selectedProjectId: 99, keyword: '테스트' })
    // applyProject 호출 안 함
    expect(useRedmineStore.getState().appliedProjectId).toBeNull()
    expect(useRedmineStore.getState().appliedKeyword).toBe('')
  })

  it('프로젝트 null로 applyProject → appliedProjectId도 null', () => {
    useRedmineStore.setState({ appliedProjectId: 10 })
    useRedmineStore.setState({ selectedProjectId: null })
    useRedmineStore.getState().applyProject()
    expect(useRedmineStore.getState().appliedProjectId).toBeNull()
  })
})

describe('RedmineStore — draft 필터 액션', () => {
  it('setStatusFilter', () => {
    useRedmineStore.getState().setStatusFilter(['완료', '진행 중'])
    expect(useRedmineStore.getState().statusFilter).toEqual(['완료', '진행 중'])
  })

  it('setPriorityFilter', () => {
    useRedmineStore.getState().setPriorityFilter(['긴급'])
    expect(useRedmineStore.getState().priorityFilter).toEqual(['긴급'])
  })

  it('setKeyword', () => {
    useRedmineStore.getState().setKeyword('API 구현')
    expect(useRedmineStore.getState().keyword).toBe('API 구현')
  })
})
