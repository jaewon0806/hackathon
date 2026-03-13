import { useQuery } from '@tanstack/react-query'
import { redmineClient } from '@/api/redmineClient'
import { useSettingsStore } from '@/store/settingsStore'

export function useRedmineProjects() {
  const apiKey = useSettingsStore((s) => s.redmine.apiKey)

  return useQuery({
    queryKey: ['redmine', 'projects'],
    queryFn: () => redmineClient.getProjects(),
    enabled: !!apiKey,
    staleTime: 5 * 60 * 1000,
  })
}
