import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

export function useTheme() {
  const theme = useSettingsStore((state) => state.theme)
  const setTheme = useSettingsStore((state) => state.setTheme)

  useEffect(() => {
    const root = document.documentElement

    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    if (theme === 'dark') {
      applyTheme(true)
    } else if (theme === 'light') {
      applyTheme(false)
    } else {
      // system
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mediaQuery.matches)

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [theme])

  return { theme, setTheme }
}
