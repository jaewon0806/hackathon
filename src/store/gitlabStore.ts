import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GitlabState {
  // 선택 상태 (즉시 반영)
  selectedProjectId: number | null
  selectedBranch: string | null
  // 드래프트 필터 (입력 중)
  authorFilter: string[]
  dateRange: { from: string; to: string }
  keyword: string
  // 적용된 필터 ("조회" 버튼 클릭 시 반영)
  appliedAuthorFilter: string[]
  appliedDateRange: { from: string; to: string }
  appliedKeyword: string
  // 액션
  setSelectedProjectId: (id: number | null) => void
  setSelectedBranch: (branch: string | null) => void
  setAuthorFilter: (authors: string[]) => void
  setDateRange: (range: { from: string; to: string }) => void
  setKeyword: (keyword: string) => void
  applyFilters: () => void
}

const getDefaultDateRange = () => {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 7)
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  }
}

export const useGitlabStore = create<GitlabState>()(
  persist(
    (set, get) => ({
      selectedProjectId: null,
      selectedBranch: null,
      authorFilter: [],
      dateRange: getDefaultDateRange(),
      keyword: '',
      // 초기값: applied = draft (첫 로딩 시 기본 필터가 즉시 적용되도록)
      appliedAuthorFilter: [],
      appliedDateRange: getDefaultDateRange(),
      appliedKeyword: '',
      setSelectedProjectId: (id: number | null) => set({ selectedProjectId: id, selectedBranch: null }),
      setSelectedBranch: (branch: string | null) => set({ selectedBranch: branch }),
      setAuthorFilter: (authors: string[]) => set({ authorFilter: authors }),
      setDateRange: (range: { from: string; to: string }) => set({ dateRange: range }),
      setKeyword: (keyword: string) => set({ keyword }),
      // 드래프트 → 적용 상태로 복사
      applyFilters: () => {
        const { authorFilter, dateRange, keyword } = get()
        set({
          appliedAuthorFilter: authorFilter,
          appliedDateRange: dateRange,
          appliedKeyword: keyword,
        })
      },
    }),
    {
      name: 'gitlab_last_selection',
      partialize: (state) => ({
        selectedProjectId: state.selectedProjectId,
        selectedBranch: state.selectedBranch,
      }),
    }
  )
)
