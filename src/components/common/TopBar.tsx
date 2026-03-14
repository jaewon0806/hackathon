import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

const pageTitles: Record<string, string> = {
  '/': '대시보드',
  '/gitlab': 'GitLab 커밋 이력',
  '/redmine': 'Redmine 일감 목록',
  '/settings': '설정',
}

interface Props {
  onMenuClick?: () => void
}

export function TopBar({ onMenuClick }: Props) {
  const location = useLocation()
  const title = pageTitles[location.pathname] || '업무 대시보드'

  return (
    // backdrop-blur + 하단 보더 대신 미세한 그림자
    <header className="h-12 px-4 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu size={18} />
          </button>
        )}
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}
