import { useQuery } from '@tanstack/react-query'
import { redmineClient } from '@/api/redmineClient'

export function useRedmineIssues(projectId: number | null, versionId: number | null) {
  return useQuery({
    queryKey: ['redmine', 'issues', projectId, versionId],
    queryFn: async () => {
      // 전체 조회 (트리 구성을 위해 페이지네이션 순차 처리)
      const all = []
      let offset = 0
      const limit = 100
      while (true) {
        const res = await redmineClient.getIssues({ projectId: projectId!, versionId, offset, limit })
        all.push(...res.issues)
        if (all.length >= res.total_count) break
        offset += limit
      }
      return all
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  })
}
