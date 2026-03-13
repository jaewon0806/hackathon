import { useQuery } from '@tanstack/react-query'
import { gitlabClient } from '@/api/gitlabClient'
import { useSettingsStore } from '@/store/settingsStore'

export function useGitlabProjects() {
  const token = useSettingsStore((s) => s.gitlab.token)

  return useQuery({
    queryKey: ['gitlab', 'projects'],
    queryFn: () => gitlabClient.getProjects(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  })
}
