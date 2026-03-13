import { useQuery } from '@tanstack/react-query'
import { redmineClient } from '@/api/redmineClient'

export function useRedmineVersions(projectId: number | null) {
  return useQuery({
    queryKey: ['redmine', 'versions', projectId],
    queryFn: () => redmineClient.getVersions(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  })
}
