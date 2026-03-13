import { NavLink } from 'react-router-dom'
import { LayoutDashboard, GitBranch, ClipboardList, Settings } from 'lucide-react'

const navItems = [
  { to: '/', label: '대시보드', icon: LayoutDashboard },
  { to: '/gitlab', label: 'GitLab', icon: GitBranch },
  { to: '/redmine', label: 'Redmine', icon: ClipboardList },
  { to: '/settings', label: '설정', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-gray-900 dark:bg-gray-950 flex flex-col shrink-0">
      <div className="px-6 py-5 border-b border-gray-700">
        <h1 className="text-white font-bold text-lg">업무 대시보드</h1>
      </div>
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
