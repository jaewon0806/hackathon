import { ExternalLink } from 'lucide-react'
import type { GitlabCommit } from '@/types/gitlab.types'

interface Props {
  commit: GitlabCommit
  gitlabUrl: string
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  return `${days}일 전`
}

export function CommitItem({ commit, gitlabUrl }: Props) {
  const avatarUrl = `https://www.gravatar.com/avatar/${commit.author_email}?d=identicon&s=32`

  return (
    <div className="flex items-start gap-3 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      {/* 아바타 */}
      <img
        src={avatarUrl}
        alt={commit.author_name}
        className="w-8 h-8 rounded-full shrink-0 mt-0.5"
      />

      {/* 본문 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate leading-snug">
            {commit.title}
          </p>
          <a
            href={commit.web_url || `${gitlabUrl}/-/commit/${commit.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-gray-400 hover:text-blue-500 transition-colors"
            title="GitLab에서 보기"
          >
            <ExternalLink size={14} />
          </a>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
          <code className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">
            {commit.short_id}
          </code>
          <span>{commit.author_name}</span>
          <span>·</span>
          <span>{formatRelativeTime(commit.authored_date)}</span>
          {commit.stats && (
            <>
              <span>·</span>
              <span className="text-green-600 dark:text-green-400">+{commit.stats.additions}</span>
              <span className="text-red-500 dark:text-red-400">-{commit.stats.deletions}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
