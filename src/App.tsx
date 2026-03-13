import { Routes, Route } from 'react-router-dom'
import { Sidebar } from '@/components/common/Sidebar'
import { TopBar } from '@/components/common/TopBar'
import { ChatbotPanel } from '@/components/chatbot/ChatbotPanel'
import { DashboardPage } from '@/pages/DashboardPage'
import { GitlabPage } from '@/pages/GitlabPage'
import { RedminePage } from '@/pages/RedminePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { useTheme } from '@/hooks/useTheme'

function AppLayout() {
  useTheme()

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/gitlab" element={<GitlabPage />} />
            <Route path="/redmine" element={<RedminePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
      <ChatbotPanel />
    </div>
  )
}

export default function App() {
  return <AppLayout />
}
