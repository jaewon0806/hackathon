import { useQuery } from '@tanstack/react-query'
import { gitlabClient } from '@/api/gitlabClient'
import { MOCK_GITLAB_BRANCHES } from '@/mocks/mockData'

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

export function useGitlabBranches(projectId: number | null) {
  return useQuery({
    queryKey: ['gitlab', 'branches', projectId],
    queryFn: () => isDemoMode ? Promise.resolve(MOCK_GITLAB_BRANCHES) : gitlabClient.getBranches(projectId!),
    enabled: isDemoMode ? !!projectId : !!projectId,
    staleTime: 5 * 60 * 1000,
  })
}
