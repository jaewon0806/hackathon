import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SettingsState, ThemeMode, GitlabSettings, RedmineSettings, AnthropicSettings } from '@/types/settings.types'

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      gitlab: {
        url: import.meta.env.VITE_GITLAB_URL || '',
        token: import.meta.env.VITE_GITLAB_TOKEN || '',
      },
      redmine: {
        url: import.meta.env.VITE_REDMINE_URL || '',
        apiKey: import.meta.env.VITE_REDMINE_API_KEY || '',
      },
      anthropic: {
        apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
        model: import.meta.env.VITE_CLAUDE_MODEL || 'claude-haiku-4-5',
      },
      theme: 'system' as ThemeMode,
      refreshInterval: Number(import.meta.env.VITE_DEFAULT_REFRESH_INTERVAL) || 900,
      setGitlab: (settings: Partial<GitlabSettings>) =>
        set((state) => ({ gitlab: { ...state.gitlab, ...settings } })),
      setRedmine: (settings: Partial<RedmineSettings>) =>
        set((state) => ({ redmine: { ...state.redmine, ...settings } })),
      setAnthropic: (settings: Partial<AnthropicSettings>) =>
        set((state) => ({ anthropic: { ...state.anthropic, ...settings } })),
      setTheme: (theme: ThemeMode) => set({ theme }),
      setRefreshInterval: (interval: number) => set({ refreshInterval: interval }),
    }),
    {
      name: 'dashboard_settings',
    }
  )
)
