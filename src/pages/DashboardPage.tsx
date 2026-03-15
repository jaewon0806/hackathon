import { useMemo, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, GitCommitHorizontal, PlayCircle, AlertTriangle, Settings, ExternalLink, Sparkles, Copy, Check, X } from 'lucide-react'
import { generateStandupReport } from '@/api/claudeClient'
import { useRedmineIssues } from '@/hooks/useRedmineIssues'
import { useGitlabCommits } from '@/hooks/useGitlabCommits'
import { useRedmineStore } from '@/store/redmineStore'
import { useGitlabStore } from '@/store/gitlabStore'
import { useSettingsStore } from '@/store/settingsStore'
import { DONE_STATUSES, IN_PROGRESS_STATUS } from '@/constants/redmine'
import { SummaryDetailPanel } from '@/components/dashboard/SummaryDetailPanel'
import type { CardType } from '@/components/dashboard/SummaryDetailPanel'

function formatDateWithRelative(dateStr: string): string {
  const date = new Date(dateStr)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const datePart = `${date.getMonth() + 1}/${date.getDate()}`
  if (minutes < 60) return `${datePart} (${minutes}분 전)`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${datePart} (${hours}시간 전)`
  return `${datePart} (${Math.floor(hours / 24)}일 전)`
}

// 기간 드롭다운 옵션 (null = 전체)
const PERIOD_OPTIONS: { label: string; days: number | null }[] = [
  { label: '1일', days: 1 },
  { label: '3일', days: 3 },
  { label: '1주일', days: 7 },
  { label: '2주일', days: 14 },
  { label: '1개월', days: 30 },
  { label: '전체', days: null },
]

interface SummaryCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: number | string
  color: 'blue' | 'purple' | 'yellow' | 'red'
  isLoading?: boolean
  onClick?: () => void
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

function SummaryCard({ icon: Icon, label, value, color, isLoading, onClick }: SummaryCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
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
  const gitlabUrl = useSettingsStore((s) => s.gitlab.url)
  const redmineUrl = useSettingsStore((s) => s.redmine.url)
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

  // ── AI 스탠드업 리포트 상태 ──
  const [standupReport, setStandupReport] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [standupError, setStandupError] = useState('')
  const [showStandup, setShowStandup] = useState(false)
  const [copied, setCopied] = useState(false)
  const standupRef = useRef<HTMLDivElement>(null)
  const anthropicKey = useSettingsStore((s) => s.anthropic.apiKey)

  const handleGenerateStandup = useCallback(async () => {
    if (isGenerating) return
    setStandupReport('')
    setStandupError('')
    setShowStandup(true)
    setIsGenerating(true)

    await generateStandupReport(issues, commits, {
      onToken: (token) => setStandupReport((prev) => prev + token),
      onDone: () => setIsGenerating(false),
      onError: (err) => {
        setStandupError(err.message)
        setIsGenerating(false)
      },
    })
  }, [issues, commits, isGenerating])

  const handleCopyStandup = useCallback(async () => {
    if (!standupReport) return
    await navigator.clipboard.writeText(standupReport)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [standupReport])

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

  // 기간 드롭다운 상태 (기본 1주일)
  const [activityPeriodDays, setActivityPeriodDays] = useState<number | null>(7)

  // 최근 활동 피드 (커밋 + 이슈 갱신 혼합) + 기간 필터 적용
  const recentActivity = useMemo(() => {
    // 기간 cutoff 계산
    const cutoff = activityPeriodDays !== null
      ? new Date(Date.now() - activityPeriodDays * 24 * 60 * 60 * 1000)
      : null

    const activities = [
      ...commits.slice(0, 10).map((c) => ({
        type: 'commit' as const,
        id: c.id,
        title: c.title,
        author: c.author_name,
        date: c.authored_date,
        ref: c.short_id,
        // 커밋 원본 URL
        url: c.web_url || (gitlabUrl ? `${gitlabUrl}/-/commit/${c.id}` : ''),
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
          // Redmine 이슈 URL
          url: redmineUrl ? `${redmineUrl}/issues/${i.id}` : '',
        })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      // 기간 필터 적용
      .filter((a) => !cutoff || new Date(a.date) >= cutoff)
      .slice(0, 20)

    return activities
  }, [commits, issues, activityPeriodDays, gitlabUrl, redmineUrl])

  // 작성자 드롭다운 상태 (임시 클라이언트 사이드 필터)
  const [selectedAuthor, setSelectedAuthor] = useState('')

  // 최근 활동에서 작성자 목록 추출 (중복 제거, 정렬)
  const activityAuthors = useMemo(() => {
    const names = recentActivity.map((a) => a.author).filter(Boolean)
    return [...new Set(names)].sort()
  }, [recentActivity])

  // 선택된 작성자로 필터링 (빈 문자열 = 전체)
  const filteredActivity = useMemo(() => {
    if (!selectedAuthor) return recentActivity
    return recentActivity.filter((a) => a.author === selectedAuthor)
  }, [recentActivity, selectedAuthor])

  // 요약 카드 상세 패널 상태
  const [activeCard, setActiveCard] = useState<CardType | null>(null)

  const isNotConfigured = !glToken && !rmApiKey

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">오늘의 업무 현황</h2>
        {/* AI 스탠드업 리포트 버튼 */}
        <button
          onClick={handleGenerateStandup}
          disabled={isGenerating || !anthropicKey}
          title={!anthropicKey ? 'Anthropic API 키를 설정하세요' : 'AI가 오늘의 스탠드업 리포트를 생성합니다'}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Sparkles size={15} className={isGenerating ? 'animate-spin' : ''} />
          {isGenerating ? '생성 중...' : '스탠드업 리포트'}
        </button>
      </div>

      {/* AI 스탠드업 리포트 패널 */}
      {showStandup && (
        <div ref={standupRef} className="mb-5 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200 dark:border-violet-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-violet-200 dark:border-violet-800">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">AI 스탠드업 리포트</span>
              {isGenerating && (
                <span className="text-xs text-violet-500 dark:text-violet-400 animate-pulse">작성 중...</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {standupReport && !isGenerating && (
                <button
                  onClick={handleCopyStandup}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/50 rounded-lg transition-colors"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? '복사됨' : '복사'}
                </button>
              )}
              <button
                onClick={() => setShowStandup(false)}
                className="p-1 text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/50 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed min-h-[80px]">
            {standupError ? (
              <span className="text-red-500">{standupError}</span>
            ) : standupReport ? (
              standupReport
            ) : (
              <span className="text-violet-400 animate-pulse">AI가 리포트를 작성하고 있습니다...</span>
            )}
          </div>
        </div>
      )}

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
          onClick={() => setActiveCard('issues')}
        />
        <SummaryCard
          icon={GitCommitHorizontal}
          label="이번 주 커밋"
          value={stats.weeklyCommits}
          color="purple"
          isLoading={commitsLoading}
          onClick={() => setActiveCard('commits')}
        />
        <SummaryCard
          icon={PlayCircle}
          label="진행 중"
          value={stats.inProgress}
          color="yellow"
          isLoading={issuesLoading}
          onClick={() => setActiveCard('inProgress')}
        />
        <SummaryCard
          icon={AlertTriangle}
          label="기한 초과"
          value={stats.overdue}
          color="red"
          isLoading={issuesLoading}
          onClick={() => setActiveCard('overdue')}
        />
      </div>

      {/* 최근 활동 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">최근 활동</h3>
          <div className="flex items-center gap-2">
            {/* 기간 드롭다운 */}
            <select
              value={activityPeriodDays ?? 'all'}
              onChange={(e) =>
                setActivityPeriodDays(e.target.value === 'all' ? null : Number(e.target.value))
              }
              className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.days ?? 'all'}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* 작성자 드롭다운 */}
            {activityAuthors.length > 0 && (
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체 작성자</option>
                {activityAuthors.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        {filteredActivity.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-gray-400">
            {issuesLoading || commitsLoading
              ? '데이터 로딩 중...'
              : '프로젝트를 선택하면 최근 활동이 표시됩니다.'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-gray-700">
            {filteredActivity.map((activity) => (
              <li key={`${activity.type}-${activity.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
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
                <span className="text-xs text-gray-400 shrink-0">{formatDateWithRelative(activity.date)}</span>
                {/* 원본 링크 */}
                {activity.url && (
                  <a
                    href={activity.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-gray-400 hover:text-blue-500 transition-colors"
                    title="원본 보기"
                  >
                    <ExternalLink size={13} />
                  </a>
                )}
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

      {/* 요약 카드 상세 패널 */}
      {activeCard && (
        <SummaryDetailPanel
          type={activeCard}
          issues={issues}
          commits={commits}
          redmineUrl={redmineUrl}
          gitlabUrl={gitlabUrl}
          onClose={() => setActiveCard(null)}
        />
      )}
    </div>
  )
}
