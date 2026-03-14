import { useQuery } from '@tanstack/react-query'
import { gitlabClient } from '@/api/gitlabClient'
import { useSettingsStore } from '@/store/settingsStore'
import { MOCK_GITLAB_PROJECTS } from '@/mocks/mockData'

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

export function useGitlabProjects() {
  const token = useSettingsStore((s) => s.gitlab.token)

  return useQuery({
    queryKey: ['gitlab', 'projects'],
    queryFn: () => isDemoMode ? Promise.resolve(MOCK_GITLAB_PROJECTS) : gitlabClient.getProjects(),
    enabled: isDemoMode || !!token,
    staleTime: 5 * 60 * 1000,
  })
}
