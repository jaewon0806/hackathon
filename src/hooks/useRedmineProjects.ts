import { useQuery } from '@tanstack/react-query'
import { redmineClient } from '@/api/redmineClient'
import { useSettingsStore } from '@/store/settingsStore'
import { MOCK_REDMINE_PROJECTS } from '@/mocks/mockData'

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

export function useRedmineProjects() {
  const apiKey = useSettingsStore((s) => s.redmine.apiKey)

  return useQuery({
    queryKey: ['redmine', 'projects'],
    queryFn: () => isDemoMode ? Promise.resolve(MOCK_REDMINE_PROJECTS) : redmineClient.getProjects(),
    enabled: isDemoMode || !!apiKey,
    staleTime: 5 * 60 * 1000,
  })
}
