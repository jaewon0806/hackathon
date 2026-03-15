import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from './settingsStore'
import type { ThemeMode } from '@/types/settings.types'

// vitest.config.ts env에 정의된 초기값:
// VITE_GITLAB_URL: 'https://gitlab.example.com'
// VITE_REDMINE_URL: 'https://redmine.example.com'
// VITE_ANTHROPIC_API_KEY: 'test-key'
// VITE_CLAUDE_MODEL: 'claude-haiku-4-5'
// VITE_DEMO_MODE: 'false'

beforeEach(() => {
  useSettingsStore.setState({
    gitlab: {
      url: 'https://gitlab.example.com',
      token: '',
    },
    redmine: {
      url: 'https://redmine.example.com',
      apiKey: '',
    },
    anthropic: {
      apiKey: 'test-key',
      model: 'claude-haiku-4-5',
    },
    theme: 'system' as ThemeMode,
    refreshInterval: 900,
  })
})

describe('SettingsStore — setGitlab', () => {
  it('URL 업데이트', () => {
    useSettingsStore.getState().setGitlab({ url: 'https://my-gitlab.company.com' })
    expect(useSettingsStore.getState().gitlab.url).toBe('https://my-gitlab.company.com')
  })

  it('token 업데이트 (url 유지)', () => {
    useSettingsStore.getState().setGitlab({ token: 'glpat-xxxx' })
    expect(useSettingsStore.getState().gitlab.token).toBe('glpat-xxxx')
    expect(useSettingsStore.getState().gitlab.url).toBe('https://gitlab.example.com')
  })

  it('url과 token 동시 업데이트', () => {
    useSettingsStore.getState().setGitlab({ url: 'https://gl.test.com', token: 'tok-abc' })
    expect(useSettingsStore.getState().gitlab.url).toBe('https://gl.test.com')
    expect(useSettingsStore.getState().gitlab.token).toBe('tok-abc')
  })

  it('빈 문자열로 token 초기화', () => {
    useSettingsStore.setState({ gitlab: { url: 'https://gl.com', token: 'old-token' } })
    useSettingsStore.getState().setGitlab({ token: '' })
    expect(useSettingsStore.getState().gitlab.token).toBe('')
  })
})

describe('SettingsStore — setRedmine', () => {
  it('URL 업데이트', () => {
    useSettingsStore.getState().setRedmine({ url: 'https://redmine.mycompany.com' })
    expect(useSettingsStore.getState().redmine.url).toBe('https://redmine.mycompany.com')
  })

  it('apiKey 업데이트 (url 유지)', () => {
    useSettingsStore.getState().setRedmine({ apiKey: 'rm-key-xyz' })
    expect(useSettingsStore.getState().redmine.apiKey).toBe('rm-key-xyz')
    expect(useSettingsStore.getState().redmine.url).toBe('https://redmine.example.com')
  })

  it('partial update는 기존 값 유지', () => {
    useSettingsStore.setState({ redmine: { url: 'https://rm.com', apiKey: 'old' } })
    useSettingsStore.getState().setRedmine({ url: 'https://rm2.com' })
    expect(useSettingsStore.getState().redmine.apiKey).toBe('old')
  })
})

describe('SettingsStore — setAnthropic', () => {
  it('apiKey 업데이트', () => {
    useSettingsStore.getState().setAnthropic({ apiKey: 'sk-ant-new-key' })
    expect(useSettingsStore.getState().anthropic.apiKey).toBe('sk-ant-new-key')
  })

  it('model 업데이트', () => {
    useSettingsStore.getState().setAnthropic({ model: 'claude-opus-4-6' })
    expect(useSettingsStore.getState().anthropic.model).toBe('claude-opus-4-6')
  })

  it('apiKey 업데이트 시 model 유지', () => {
    useSettingsStore.getState().setAnthropic({ apiKey: 'new-key' })
    expect(useSettingsStore.getState().anthropic.model).toBe('claude-haiku-4-5')
  })
})

describe('SettingsStore — setTheme', () => {
  it('light 테마로 변경', () => {
    useSettingsStore.getState().setTheme('light')
    expect(useSettingsStore.getState().theme).toBe('light')
  })

  it('dark 테마로 변경', () => {
    useSettingsStore.getState().setTheme('dark')
    expect(useSettingsStore.getState().theme).toBe('dark')
  })

  it('system 테마로 변경', () => {
    useSettingsStore.setState({ theme: 'light' })
    useSettingsStore.getState().setTheme('system')
    expect(useSettingsStore.getState().theme).toBe('system')
  })
})

describe('SettingsStore — setRefreshInterval', () => {
  it('새로고침 간격 변경', () => {
    useSettingsStore.getState().setRefreshInterval(300)
    expect(useSettingsStore.getState().refreshInterval).toBe(300)
  })

  it('0으로 설정 (수동 새로고침)', () => {
    useSettingsStore.getState().setRefreshInterval(0)
    expect(useSettingsStore.getState().refreshInterval).toBe(0)
  })

  it('1800초(30분)으로 설정', () => {
    useSettingsStore.getState().setRefreshInterval(1800)
    expect(useSettingsStore.getState().refreshInterval).toBe(1800)
  })
})

describe('SettingsStore — 상태 독립성', () => {
  it('gitlab 업데이트가 redmine에 영향 없음', () => {
    const before = useSettingsStore.getState().redmine.url
    useSettingsStore.getState().setGitlab({ url: 'https://changed.com' })
    expect(useSettingsStore.getState().redmine.url).toBe(before)
  })

  it('anthropic 업데이트가 theme에 영향 없음', () => {
    useSettingsStore.setState({ theme: 'dark' })
    useSettingsStore.getState().setAnthropic({ apiKey: 'new' })
    expect(useSettingsStore.getState().theme).toBe('dark')
  })
})
