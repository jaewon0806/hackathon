import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { useToast } from '@/hooks/useToast'
import { testGitlabConnection, testRedmineConnection } from '@/api/connectionTest'
import type { ThemeMode } from '@/types/settings.types'

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  )
}

export function SettingsPage() {
  const { showToast } = useToast()
  const store = useSettingsStore()

  // 로컬 폼 상태
  const [gitlabUrl, setGitlabUrl] = useState(store.gitlab.url)
  const [gitlabToken, setGitlabToken] = useState(store.gitlab.token)
  const [redmineUrl, setRedmineUrl] = useState(store.redmine.url)
  const [redmineKey, setRedmineKey] = useState(store.redmine.apiKey)
  const [anthropicKey, setAnthropicKey] = useState(store.anthropic.apiKey)
  const [claudeModel, setClaudeModel] = useState(store.anthropic.model)
  const [theme, setTheme] = useState<ThemeMode>(store.theme)
  const [refreshInterval, setRefreshInterval] = useState(store.refreshInterval)

  const [testingGitlab, setTestingGitlab] = useState(false)
  const [testingRedmine, setTestingRedmine] = useState(false)

  const handleTestGitlab = async () => {
    setTestingGitlab(true)
    const result = await testGitlabConnection(gitlabUrl, gitlabToken)
    setTestingGitlab(false)
    if (result.success) {
      showToast(`GitLab 연결 성공 (${result.username})`, 'success')
    } else {
      showToast(result.error || 'GitLab 연결 실패', 'error')
    }
  }

  const handleTestRedmine = async () => {
    setTestingRedmine(true)
    const result = await testRedmineConnection(redmineUrl, redmineKey)
    setTestingRedmine(false)
    if (result.success) {
      showToast(`Redmine 연결 성공 (${result.username})`, 'success')
    } else {
      showToast(result.error || 'Redmine 연결 실패', 'error')
    }
  }

  const handleSave = () => {
    store.setGitlab({ url: gitlabUrl, token: gitlabToken })
    store.setRedmine({ url: redmineUrl, apiKey: redmineKey })
    store.setAnthropic({ apiKey: anthropicKey, model: claudeModel })
    store.setTheme(theme)
    store.setRefreshInterval(refreshInterval)
    showToast('설정이 저장되었습니다.', 'success')
  }

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">설정</h2>

      {/* API 연결 섹션 */}
      <section className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          API 연결
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
          {/* GitLab */}
          <div className="p-4 space-y-3">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">GitLab</h4>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">GitLab URL</label>
              <TextInput value={gitlabUrl} onChange={setGitlabUrl} placeholder="https://gitlab.example.com" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Personal Access Token</label>
              <PasswordInput value={gitlabToken} onChange={setGitlabToken} placeholder="glpat-xxxxxxxxxxxx" />
            </div>
            <button
              onClick={handleTestGitlab}
              disabled={testingGitlab || !gitlabUrl || !gitlabToken}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {testingGitlab && <Loader2 size={14} className="animate-spin" />}
              연결 테스트
            </button>
          </div>

          {/* Redmine */}
          <div className="p-4 space-y-3">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">Redmine</h4>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Redmine URL</label>
              <TextInput value={redmineUrl} onChange={setRedmineUrl} placeholder="https://redmine.example.com" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">API Access Key</label>
              <PasswordInput value={redmineKey} onChange={setRedmineKey} placeholder="API 액세스 키" />
            </div>
            <button
              onClick={handleTestRedmine}
              disabled={testingRedmine || !redmineUrl || !redmineKey}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {testingRedmine && <Loader2 size={14} className="animate-spin" />}
              연결 테스트
            </button>
          </div>

          {/* Anthropic */}
          <div className="p-4 space-y-3">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">Anthropic Claude AI</h4>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Anthropic API Key</label>
              <PasswordInput value={anthropicKey} onChange={setAnthropicKey} placeholder="sk-ant-xxxxxxxxxxxx" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Claude 모델</label>
              <select
                value={claudeModel}
                onChange={(e) => setClaudeModel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="claude-haiku-4-5">claude-haiku-4-5 (빠름/저렴)</option>
                <option value="claude-sonnet-4-6">claude-sonnet-4-6 (정확/상세)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 화면 설정 섹션 */}
      <section className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          화면 설정
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          {/* 테마 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">테마</label>
            <div className="flex gap-4">
              {(['light', 'dark', 'system'] as ThemeMode[]).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={t}
                    checked={theme === t}
                    onChange={() => setTheme(t)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t === 'light' ? '라이트' : t === 'dark' ? '다크' : '시스템'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 자동 새로고침 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">자동 새로고침</label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="w-48 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>수동</option>
              <option value={300}>5분</option>
              <option value={900}>15분</option>
              <option value={1800}>30분</option>
            </select>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          저장
        </button>
      </div>
    </div>
  )
}
