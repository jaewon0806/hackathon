import { useQuery } from '@tanstack/react-query'
import { gitlabClient } from '@/api/gitlabClient'

export function useGitlabBranches(projectId: number | null) {
  return useQuery({
    queryKey: ['gitlab', 'branches', projectId],
    queryFn: () => gitlabClient.getBranches(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  })
}
