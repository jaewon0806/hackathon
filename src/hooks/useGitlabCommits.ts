import { useInfiniteQuery } from '@tanstack/react-query'
import { gitlabClient } from '@/api/gitlabClient'
import type { CommitFilters } from '@/types/gitlab.types'
import { MOCK_GITLAB_COMMITS } from '@/mocks/mockData'

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

export function useGitlabCommits(
  projectId: number | null,
  branch: string | null,
  filters: Omit<CommitFilters, 'page'>
) {
  return useInfiniteQuery({
    queryKey: ['gitlab', 'commits', projectId, branch, filters],
    queryFn: ({ pageParam }) =>
      isDemoMode
        ? Promise.resolve(MOCK_GITLAB_COMMITS)
        : gitlabClient.getCommits(projectId!, branch!, { ...filters, page: pageParam as number, per_page: 50 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      !isDemoMode && lastPage.length === 50 ? pages.length + 1 : undefined,
    enabled: isDemoMode ? !!projectId : !!projectId && !!branch,
    staleTime: 5 * 60 * 1000,
  })
}
