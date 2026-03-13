import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSettingsStore } from '@/store/settingsStore'

export function useAutoRefresh(queryKeys: string[][]) {
  const refreshInterval = useSettingsStore((s) => s.refreshInterval)
  const queryClient = useQueryClient()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (!refreshInterval) return

    timerRef.current = setInterval(() => {
      queryKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    }, refreshInterval * 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // queryKeys는 렌더마다 새 배열 → JSON 직렬화로 안정화
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshInterval, queryClient, JSON.stringify(queryKeys)])
}
