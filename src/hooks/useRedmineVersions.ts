import { useQuery } from '@tanstack/react-query'
import { redmineClient } from '@/api/redmineClient'
import { MOCK_REDMINE_VERSIONS } from '@/mocks/mockData'

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

export function useRedmineVersions(projectId: number | null) {
  return useQuery({
    queryKey: ['redmine', 'versions', projectId],
    queryFn: () => isDemoMode ? Promise.resolve(MOCK_REDMINE_VERSIONS) : redmineClient.getVersions(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  })
}
