import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RedmineState {
  // 선택 상태 (즉시 반영)
  selectedProjectId: number | null
  selectedVersionId: number | null
  expandedIssueIds: number[]
  // 드래프트 필터 (입력 중)
  assigneeFilter: number[]
  statusFilter: string[]
  priorityFilter: string[]
  keyword: string
  // 적용된 프로젝트/버전 ("조회" 버튼 클릭 시 반영 — API 호출 트리거)
  appliedProjectId: number | null
  appliedVersionId: number | null
  // 적용된 필터 ("조회" 버튼 클릭 시 반영)
  appliedStatusFilter: string[]
  appliedPriorityFilter: string[]
  appliedKeyword: string
  // 액션
  setSelectedProjectId: (id: number | null) => void
  setSelectedVersionId: (id: number | null) => void
  setAssigneeFilter: (ids: number[]) => void
  setStatusFilter: (statuses: string[]) => void
  setPriorityFilter: (priorities: string[]) => void
  setKeyword: (keyword: string) => void
  toggleIssueExpanded: (id: number) => void
  setExpandedIssueIds: (ids: number[]) => void
  applyFilters: () => void
  // 프로젝트/버전 + 필터를 모두 적용 ("조회" 버튼)
  applyProject: () => void
}

export const useRedmineStore = create<RedmineState>()(
  persist(
    (set, get) => ({
      selectedProjectId: null,
      selectedVersionId: null,
      assigneeFilter: [],
      statusFilter: [],
      priorityFilter: [],
      keyword: '',
      expandedIssueIds: [],
      appliedProjectId: null,
      appliedVersionId: null,
      // 초기값: applied = draft (첫 로딩 시 기본 필터가 즉시 적용되도록)
      appliedStatusFilter: [],
      appliedPriorityFilter: [],
      appliedKeyword: '',
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
      // 드래프트 → 적용 상태로 복사
      applyFilters: () => {
        const { statusFilter, priorityFilter, keyword } = get()
        set({
          appliedStatusFilter: statusFilter,
          appliedPriorityFilter: priorityFilter,
          appliedKeyword: keyword,
        })
      },
      // 프로젝트/버전 + 필터 모두 적용 ("조회" 버튼 클릭 시)
      applyProject: () => {
        const { selectedProjectId, selectedVersionId, statusFilter, priorityFilter, keyword } = get()
        set({
          appliedProjectId: selectedProjectId,
          appliedVersionId: selectedVersionId,
          appliedStatusFilter: statusFilter,
          appliedPriorityFilter: priorityFilter,
          appliedKeyword: keyword,
        })
      },
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
