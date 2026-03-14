import { describe, it, expect, beforeEach } from 'vitest'
import { useGitlabStore } from './gitlabStore'

// 각 테스트 전 스토어를 초기 상태로 리셋
const initialState = {
  selectedProjectId: null,
  selectedBranch: null,
  authorFilter: [],
  dateRange: { from: '', to: '' },
  keyword: '',
  appliedAuthorFilter: [],
  appliedDateRange: { from: '', to: '' },
  appliedKeyword: '',
}

beforeEach(() => {
  useGitlabStore.setState(initialState)
})

describe('GitlabStore — setSelectedProjectId', () => {
  it('프로젝트 ID 설정', () => {
    useGitlabStore.getState().setSelectedProjectId(42)
    expect(useGitlabStore.getState().selectedProjectId).toBe(42)
  })

  it('프로젝트 변경 시 selectedBranch가 null로 리셋', () => {
    useGitlabStore.setState({ selectedBranch: 'main' })
    useGitlabStore.getState().setSelectedProjectId(99)
    expect(useGitlabStore.getState().selectedBranch).toBeNull()
  })

  it('null로 설정 가능', () => {
    useGitlabStore.setState({ selectedProjectId: 10 })
    useGitlabStore.getState().setSelectedProjectId(null)
    expect(useGitlabStore.getState().selectedProjectId).toBeNull()
  })
})

describe('GitlabStore — setSelectedBranch', () => {
  it('브랜치 설정', () => {
    useGitlabStore.getState().setSelectedBranch('develop')
    expect(useGitlabStore.getState().selectedBranch).toBe('develop')
  })
})

describe('GitlabStore — draft 필터 액션', () => {
  it('setAuthorFilter — 작성자 배열 설정', () => {
    useGitlabStore.getState().setAuthorFilter(['홍길동', '김철수'])
    expect(useGitlabStore.getState().authorFilter).toEqual(['홍길동', '김철수'])
  })

  it('setDateRange — 날짜 범위 설정', () => {
    useGitlabStore.getState().setDateRange({ from: '2026-03-01', to: '2026-03-15' })
    expect(useGitlabStore.getState().dateRange).toEqual({ from: '2026-03-01', to: '2026-03-15' })
  })

  it('setKeyword — 키워드 설정', () => {
    useGitlabStore.getState().setKeyword('feat')
    expect(useGitlabStore.getState().keyword).toBe('feat')
  })
})

describe('GitlabStore — applyFilters (조회 버튼)', () => {
  it('draft 값이 applied 값으로 복사됨', () => {
    useGitlabStore.setState({
      authorFilter: ['홍길동'],
      dateRange: { from: '2026-03-01', to: '2026-03-15' },
      keyword: 'fix',
    })
    useGitlabStore.getState().applyFilters()

    const state = useGitlabStore.getState()
    expect(state.appliedAuthorFilter).toEqual(['홍길동'])
    expect(state.appliedDateRange).toEqual({ from: '2026-03-01', to: '2026-03-15' })
    expect(state.appliedKeyword).toBe('fix')
  })

  it('applyFilters 호출 전 applied 값은 초기값 유지', () => {
    useGitlabStore.setState({ keyword: 'newKeyword' })
    // applyFilters 호출 안 함
    expect(useGitlabStore.getState().appliedKeyword).toBe('')
  })

  it('빈 draft로 applyFilters → applied도 초기화', () => {
    // 먼저 값 설정 후 apply
    useGitlabStore.setState({ appliedAuthorFilter: ['홍길동'], appliedKeyword: 'old' })
    useGitlabStore.setState({ authorFilter: [], keyword: '' })
    useGitlabStore.getState().applyFilters()

    expect(useGitlabStore.getState().appliedAuthorFilter).toEqual([])
    expect(useGitlabStore.getState().appliedKeyword).toBe('')
  })
})
