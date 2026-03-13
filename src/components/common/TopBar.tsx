import { useLocation } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

const pageTitles: Record<string, string> = {
  '/': '대시보드',
  '/gitlab': 'GitLab 커밋 이력',
  '/redmine': 'Redmine 일감 목록',
  '/settings': '설정',
}

export function TopBar() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || '업무 대시보드'

  return (
    <header className="h-12 px-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
      <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</h2>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}
