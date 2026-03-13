export type ThemeMode = 'light' | 'dark' | 'system'

export interface GitlabSettings {
  url: string
  token: string
}

export interface RedmineSettings {
  url: string
  apiKey: string
}

export interface AnthropicSettings {
  apiKey: string
  model: string
}

export interface SettingsState {
  gitlab: GitlabSettings
  redmine: RedmineSettings
  anthropic: AnthropicSettings
  theme: ThemeMode
  refreshInterval: number
  setGitlab: (settings: Partial<GitlabSettings>) => void
  setRedmine: (settings: Partial<RedmineSettings>) => void
  setAnthropic: (settings: Partial<AnthropicSettings>) => void
  setTheme: (theme: ThemeMode) => void
  setRefreshInterval: (interval: number) => void
}
