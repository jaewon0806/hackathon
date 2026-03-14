import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, GitCommitHorizontal, PlayCircle, AlertTriangle, Settings } from 'lucide-react'
import { useRedmineIssues } from '@/hooks/useRedmineIssues'
import { useGitlabCommits } from '@/hooks/useGitlabCommits'
import { useRedmineStore } from '@/store/redmineStore'
import { useGitlabStore } from '@/store/gitlabStore'
import { useSettingsStore } from '@/store/settingsStore'
import { DONE_STATUSES, IN_PROGRESS_STATUS } from '@/constants/redmine'

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

interface SummaryCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: number | string
  color: 'blue' | 'purple' | 'yellow' | 'red'
  isLoading?: boolean
}

// 아이콘 배경 그라데이션 매핑
const gradientMap = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  yellow: 'from-yellow-400 to-yellow-500',
  red: 'from-red-500 to-red-600',
}

const textColorMap = {
  blue: 'text-blue-600 dark:text-blue-400',
  purple: 'text-purple-600 dark:text-purple-400',
  yellow: 'text-yellow-600 dark:text-yellow-400',
  red: 'text-red-600 dark:text-red-400',
}

function SummaryCard({ icon: Icon, label, value, color, isLoading }: SummaryCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        {/* 아이콘 배경 그라데이션 */}
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientMap[color]}`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      {isLoading ? (
        <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      ) : (
        <p className={`text-2xl font-bold ${textColorMap[color]}`}>{value}</p>
      )}
    </div>
  )
}


export function DashboardPage() {
  const glToken = useSettingsStore((s) => s.gitlab.token)
  const rmApiKey = useSettingsStore((s) => s.redmine.apiKey)
  const { selectedProjectId: rmProjectId, selectedVersionId } = useRedmineStore()
  const { selectedProjectId: glProjectId, selectedBranch, appliedDateRange } = useGitlabStore()

  const { data: issues = [], isLoading: issuesLoading } = useRedmineIssues(rmProjectId, selectedVersionId)
  const { data: commitsData, isLoading: commitsLoading } = useGitlabCommits(
    glProjectId,
    selectedBranch,
    {
      // 적용된 날짜 범위 사용
      since: appliedDateRange.from ? `${appliedDateRange.from}T00:00:00Z` : undefined,
      until: appliedDateRange.to ? `${appliedDateRange.to}T23:59:59Z` : undefined,
    }
  )
  const commits = useMemo(() => commitsData?.pages.flat() ?? [], [commitsData])

  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return {
      totalIssues: issues.filter((i) => !DONE_STATUSES.includes(i.status.name)).length,
      inProgress: issues.filter((i) => i.status.name === IN_PROGRESS_STATUS).length,
      overdue: issues.filter((i) => {
        if (!i.due_date || DONE_STATUSES.includes(i.status.name)) return false
        return new Date(i.due_date) < today
      }).length,
      weeklyCommits: commits.length,
    }
  }, [issues, commits])

  // 최근 활동 피드 (커밋 + 이슈 갱신 혼합)
  const recentActivity = useMemo(() => {
    const activities = [
      ...commits.slice(0, 10).map((c) => ({
        type: 'commit' as const,
        id: c.id,
        title: c.title,
        author: c.author_name,
        date: c.authored_date,
        ref: c.short_id,
      })),
      ...issues
        .slice()
        .sort((a, b) => new Date(b.updated_on).getTime() - new Date(a.updated_on).getTime())
        .slice(0, 10)
        .map((i) => ({
          type: 'issue' as const,
          id: String(i.id),
          title: i.subject,
          author: i.assigned_to?.name ?? i.author.name,
          date: i.updated_on,
          ref: `#${i.id}`,
        })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15)

    return activities
  }, [commits, issues])

  const isNotConfigured = !glToken && !rmApiKey

  return (
    <div className="p-6 max-w-4xl">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-5">오늘의 업무 현황</h2>

      {isNotConfigured && (
        <div className="mb-5 flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl text-sm text-orange-700 dark:text-orange-300">
          <AlertTriangle size={18} />
          <span>GitLab 또는 Redmine API 키를 설정해야 데이터가 표시됩니다.</span>
          <Link to="/settings" className="ml-auto flex items-center gap-1 text-blue-600 hover:underline">
            <Settings size={14} />
            설정
          </Link>
        </div>
      )}

      {/* 요약 카드 — 반응형 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          icon={ClipboardList}
          label="담당 일감"
          value={stats.totalIssues}
          color="blue"
          isLoading={issuesLoading}
        />
        <SummaryCard
          icon={GitCommitHorizontal}
          label="이번 주 커밋"
          value={stats.weeklyCommits}
          color="purple"
          isLoading={commitsLoading}
        />
        <SummaryCard
          icon={PlayCircle}
          label="진행 중"
          value={stats.inProgress}
          color="yellow"
          isLoading={issuesLoading}
        />
        <SummaryCard
          icon={AlertTriangle}
          label="기한 초과"
          value={stats.overdue}
          color="red"
          isLoading={issuesLoading}
        />
      </div>

      {/* 최근 활동 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">최근 활동</h3>
        </div>
        {recentActivity.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-gray-400">
            {issuesLoading || commitsLoading
              ? '데이터 로딩 중...'
              : '프로젝트를 선택하면 최근 활동이 표시됩니다.'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-gray-700">
            {recentActivity.map((activity) => (
              <li key={`${activity.type}-${activity.id}`} className="flex items-center gap-3 px-4 py-3">
                <span
                  className={`shrink-0 text-xs font-mono px-1.5 py-0.5 rounded ${
                    activity.type === 'commit'
                      ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                      : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {activity.type === 'commit' ? 'GL' : 'RM'}
                </span>
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                  <span className="font-mono text-xs text-gray-400 mr-1.5">{activity.ref}</span>
                  {activity.title}
                </span>
                <span className="text-xs text-gray-400 shrink-0">{activity.author}</span>
                <span className="text-xs text-gray-400 shrink-0">{formatRelativeTime(activity.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 선택 안내 */}
      {!isNotConfigured && !rmProjectId && !glProjectId && (
        <p className="mt-4 text-xs text-gray-400 text-center">
          GitLab 또는 Redmine 페이지에서 프로젝트를 선택하면 이 화면에 데이터가 표시됩니다.
        </p>
      )}
    </div>
  )
}
