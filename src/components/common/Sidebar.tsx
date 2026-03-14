import { NavLink } from 'react-router-dom'
import { LayoutDashboard, GitBranch, ClipboardList, Settings, X } from 'lucide-react'

const navItems = [
  { to: '/', label: '대시보드', icon: LayoutDashboard },
  { to: '/gitlab', label: 'GitLab', icon: GitBranch },
  { to: '/redmine', label: 'Redmine', icon: ClipboardList },
  { to: '/settings', label: '설정', icon: Settings },
]

interface Props {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: Props) {
  return (
    <>
      {/* 모바일 오버레이 */}
      {onClose && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-60 min-h-screen flex flex-col shrink-0
          bg-gradient-to-b from-gray-900 to-gray-950
          transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="px-6 py-5 border-b border-gray-700/60 flex items-center justify-between">
          <h1 className="text-white font-bold text-lg tracking-tight">업무 대시보드</h1>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-0.5">
            {navItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-600/90 text-white shadow-md shadow-blue-900/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/70'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* 활성 메뉴 좌측 accent bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-300 rounded-r-full" />
                      )}
                      <Icon size={18} />
                      {label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}
