import { ChevronDown, Folder, Tag, SlidersHorizontal } from 'lucide-react'
import { useRedmineProjects } from '@/hooks/useRedmineProjects'
import { useRedmineVersions } from '@/hooks/useRedmineVersions'
import { useRedmineStore } from '@/store/redmineStore'

export function ProjectVersionSelector() {
  const { data: projects, isLoading: loadingProjects } = useRedmineProjects()
  const {
    selectedProjectId,
    selectedVersionId,
    setSelectedProjectId,
    setSelectedVersionId,
    applyProject,
  } = useRedmineStore()
  const { data: versions, isLoading: loadingVersions } = useRedmineVersions(selectedProjectId)

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* 프로젝트 선택 */}
      <div>
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

      {/* 버전 선택 */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
          <Tag size={12} />
          <span>목표 버전</span>
        </div>
        <div className="relative">
          <select
            value={selectedVersionId ?? ''}
            onChange={(e) => setSelectedVersionId(e.target.value ? Number(e.target.value) : null)}
            disabled={!selectedProjectId || loadingVersions}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-40 disabled:opacity-50"
          >
            <option value="">전체</option>
            {versions?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* 조회 버튼 */}
      <div className="self-end">
        <button
          onClick={applyProject}
          disabled={!selectedProjectId}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SlidersHorizontal size={14} />
          조회
        </button>
      </div>
    </div>
  )
}
