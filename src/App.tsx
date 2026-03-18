import { lazy, Suspense, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Sidebar } from '@/components/common/Sidebar'
import { TopBar } from '@/components/common/TopBar'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ChatbotPanel } from '@/components/chatbot/ChatbotPanel'
import { OnboardingModal } from '@/components/common/OnboardingModal'
import { useTheme } from '@/hooks/useTheme'
import { useSettingsStore } from '@/store/settingsStore'

const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const GitlabPage = lazy(() => import('@/pages/GitlabPage').then((m) => ({ default: m.GitlabPage })))
const RedminePage = lazy(() => import('@/pages/RedminePage').then((m) => ({ default: m.RedminePage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))

function PageSkeleton() {
  return (
    <div className="p-6 animate-pulse space-y-4">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
    </div>
  )
}

function AppLayout() {
  useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

  const isUnset = (val: string, defaultVal: string) =>
    !val.trim() || val.trim() === defaultVal

  // 마운트 시점에 한 번만 평가 — 이후 store 변경에 영향받지 않음
  // GitLab · Redmine · Anthropic 중 하나라도 기본값이면 온보딩 필요
  const [onboardingDone, setOnboardingDone] = useState(() => {
    if (isDemoMode) return true
    const { gitlab, redmine, anthropic } = useSettingsStore.getState()
    return (
      !isUnset(gitlab.token, 'your_gitlab_personal_access_token') &&
      !isUnset(redmine.apiKey, 'your_redmine_api_key') &&
      !isUnset(anthropic.apiKey, 'your_anthropic_api_key')
    )
  })

  const needsOnboarding = !isDemoMode && !onboardingDone

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto">
          <ErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/gitlab" element={<GitlabPage />} />
                <Route path="/redmine" element={<RedminePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <ChatbotPanel />

      {/* 온보딩 모달 — API 키 미설정 시 표시, 완료 버튼으로만 닫힘 */}
      {needsOnboarding && <OnboardingModal onDismiss={() => setOnboardingDone(true)} />}
    </div>
  )
}

export default function App() {
  return <AppLayout />
}
