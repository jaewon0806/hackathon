import { useEffect } from 'react'
import { ChevronDown, GitBranch, Folder } from 'lucide-react'
import { useGitlabProjects } from '@/hooks/useGitlabProjects'
import { useGitlabBranches } from '@/hooks/useGitlabBranches'
import { useGitlabStore } from '@/store/gitlabStore'

export function ProjectBranchSelector() {
  const { data: projects, isLoading: loadingProjects } = useGitlabProjects()
  const { selectedProjectId, selectedBranch, setSelectedProjectId, setSelectedBranch } = useGitlabStore()
  const { data: branches, isLoading: loadingBranches } = useGitlabBranches(selectedProjectId)

  // 프로젝트 선택 시 기본 브랜치 자동 선택
  useEffect(() => {
    if (branches && branches.length > 0 && !selectedBranch) {
      const defaultBranch = branches.find((b) => b.name === 'main' || b.name === 'master') || branches[0]
      setSelectedBranch(defaultBranch.name)
    }
  }, [branches, selectedBranch, setSelectedBranch])

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* 프로젝트 선택 */}
      <div className="relative">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
          <Folder size={12} />
          <span>프로젝트</span>
        </div>
        <div className="relative">
          <select
            value={selectedProjectId ?? ''}
            onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
            disabled={loadingProjects}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-48 disabled:opacity-50"
          >
            <option value="">프로젝트 선택</option>
            {projects?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* 브랜치 선택 */}
      <div className="relative">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
          <GitBranch size={12} />
          <span>브랜치</span>
        </div>
        <div className="relative">
          <select
            value={selectedBranch ?? ''}
            onChange={(e) => setSelectedBranch(e.target.value || null)}
            disabled={!selectedProjectId || loadingBranches}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-36 disabled:opacity-50"
          >
            <option value="">브랜치 선택</option>
            {branches?.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
