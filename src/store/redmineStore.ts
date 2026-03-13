import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RedmineState {
  selectedProjectId: number | null
  selectedVersionId: number | null
  assigneeFilter: number[]
  statusFilter: string[]
  priorityFilter: string[]
  keyword: string
  expandedIssueIds: number[]
  setSelectedProjectId: (id: number | null) => void
  setSelectedVersionId: (id: number | null) => void
  setAssigneeFilter: (ids: number[]) => void
  setStatusFilter: (statuses: string[]) => void
  setPriorityFilter: (priorities: string[]) => void
  setKeyword: (keyword: string) => void
  toggleIssueExpanded: (id: number) => void
  setExpandedIssueIds: (ids: number[]) => void
}

export const useRedmineStore = create<RedmineState>()(
  persist(
    (set) => ({
      selectedProjectId: null,
      selectedVersionId: null,
      assigneeFilter: [],
      statusFilter: [],
      priorityFilter: [],
      keyword: '',
      expandedIssueIds: [],
      setSelectedProjectId: (id: number | null) => set({ selectedProjectId: id, selectedVersionId: null }),
      setSelectedVersionId: (id: number | null) => set({ selectedVersionId: id }),
      setAssigneeFilter: (ids: number[]) => set({ assigneeFilter: ids }),
      setStatusFilter: (statuses: string[]) => set({ statusFilter: statuses }),
      setPriorityFilter: (priorities: string[]) => set({ priorityFilter: priorities }),
      setKeyword: (keyword: string) => set({ keyword }),
      toggleIssueExpanded: (id: number) =>
        set((state) => ({
          expandedIssueIds: state.expandedIssueIds.includes(id)
            ? state.expandedIssueIds.filter((i) => i !== id)
            : [...state.expandedIssueIds, id],
        })),
      setExpandedIssueIds: (ids: number[]) => set({ expandedIssueIds: ids }),
    }),
    {
      name: 'redmine_last_selection',
      partialize: (state) => ({
        selectedProjectId: state.selectedProjectId,
        selectedVersionId: state.selectedVersionId,
      }),
    }
  )
)
