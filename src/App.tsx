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

  // API 키 설정 여부 확인 (URL은 환경변수 고정, 토큰/키만 확인)
  const gitlabToken = useSettingsStore((s) => s.gitlab.token)
  const redmineApiKey = useSettingsStore((s) => s.redmine.apiKey)

  const needsOnboarding = !gitlabToken.trim() || !redmineApiKey.trim()

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

      {/* 온보딩 모달 — API 키 미설정 시 표시 (store 업데이트로 자동 해소) */}
      {needsOnboarding && <OnboardingModal />}
    </div>
  )
}

export default function App() {
  return <AppLayout />
}
