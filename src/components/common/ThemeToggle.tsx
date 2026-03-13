import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import type { ThemeMode } from '@/types/settings.types'

const themes: { value: ThemeMode; icon: React.ComponentType<{ size?: number }>; label: string }[] = [
  { value: 'light', icon: Sun, label: '라이트' },
  { value: 'dark', icon: Moon, label: '다크' },
  { value: 'system', icon: Monitor, label: '시스템' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const next = () => {
    const idx = themes.findIndex((t) => t.value === theme)
    const nextTheme = themes[(idx + 1) % themes.length]
    setTheme(nextTheme.value)
  }

  const current = themes.find((t) => t.value === theme) || themes[2]
  const Icon = current.icon

  return (
    <button
      onClick={next}
      title={`테마: ${current.label}`}
      className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <Icon size={18} />
    </button>
  )
}
