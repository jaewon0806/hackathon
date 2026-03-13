import { useEffect, useRef } from 'react'
import { Loader2, GitCommitHorizontal } from 'lucide-react'
import { CommitItem } from './CommitItem'
import { useSettingsStore } from '@/store/settingsStore'
import type { GitlabCommit } from '@/types/gitlab.types'

interface Props {
  commits: GitlabCommit[]
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
}

export function CommitList({ commits, isFetchingNextPage, hasNextPage, fetchNextPage }: Props) {
  const gitlabUrl = useSettingsStore((s) => s.gitlab.url)
  const loaderRef = useRef<HTMLDivElement>(null)

  // Intersection Observer로 무한 스크롤
  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (commits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <GitCommitHorizontal size={40} className="mb-3 opacity-40" />
        <p className="text-sm">선택한 기간에 커밋이 없습니다.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {commits.map((commit) => (
          <CommitItem key={commit.id} commit={commit} gitlabUrl={gitlabUrl} />
        ))}
      </div>

      {/* 무한 스크롤 트리거 */}
      <div ref={loaderRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <Loader2 size={20} className="animate-spin text-gray-400" />
        )}
        {!hasNextPage && commits.length > 0 && (
          <p className="text-xs text-gray-400">모든 커밋을 불러왔습니다.</p>
        )}
      </div>
    </div>
  )
}
