import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GitlabState {
  selectedProjectId: number | null
  selectedBranch: string | null
  authorFilter: string[]
  dateRange: { from: string; to: string }
  keyword: string
  setSelectedProjectId: (id: number | null) => void
  setSelectedBranch: (branch: string | null) => void
  setAuthorFilter: (authors: string[]) => void
  setDateRange: (range: { from: string; to: string }) => void
  setKeyword: (keyword: string) => void
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
    (set) => ({
      selectedProjectId: null,
      selectedBranch: null,
      authorFilter: [],
      dateRange: getDefaultDateRange(),
      keyword: '',
      setSelectedProjectId: (id: number | null) => set({ selectedProjectId: id, selectedBranch: null }),
      setSelectedBranch: (branch: string | null) => set({ selectedBranch: branch }),
      setAuthorFilter: (authors: string[]) => set({ authorFilter: authors }),
      setDateRange: (range: { from: string; to: string }) => set({ dateRange: range }),
      setKeyword: (keyword: string) => set({ keyword }),
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
