import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { ChatMessage } from './ChatMessage'
import { SuggestedQuestions } from './SuggestedQuestions'
import { useChatbotStore } from '@/store/chatbotStore'
import { useSettingsStore } from '@/store/settingsStore'
import { streamChatMessage } from '@/api/claudeClient'
import { useRedmineIssues } from '@/hooks/useRedmineIssues'
import { useGitlabCommits } from '@/hooks/useGitlabCommits'
import { useRedmineStore } from '@/store/redmineStore'
import { useGitlabStore } from '@/store/gitlabStore'
import type Anthropic from '@anthropic-ai/sdk'

export function ChatbotPanel() {
  const { messages, isOpen, isStreaming, toggle, addMessage, updateLastMessage, clearMessages, setStreaming } =
    useChatbotStore()
  const anthropicKey = useSettingsStore((s) => s.anthropic.apiKey)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 현재 로드된 데이터 가져오기
  const { selectedProjectId: rmProjectId, selectedVersionId } = useRedmineStore()
  const { selectedProjectId: glProjectId, selectedBranch, dateRange } = useGitlabStore()
  const { data: issues = [] } = useRedmineIssues(rmProjectId, selectedVersionId)
  const { data: commitsData } = useGitlabCommits(glProjectId, selectedBranch, {
    since: dateRange.from ? `${dateRange.from}T00:00:00Z` : undefined,
    until: dateRange.to ? `${dateRange.to}T23:59:59Z` : undefined,
  })
  const commits = commitsData?.pages.flat() ?? []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return
    setInput('')

    // 사용자 메시지 추가
    addMessage({ role: 'user', content: text.trim() })

    // AI 응답 메시지 placeholder 추가
    const assistantMsg = addMessage({ role: 'assistant', content: '' })
    setStreaming(true)

    // 대화 히스토리를 Anthropic 형식으로 변환
    const history: Anthropic.MessageParam[] = [
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: text.trim() },
    ]

    let accumulated = ''

    await streamChatMessage(history, issues, commits, {
      onToken: (token) => {
        accumulated += token
        updateLastMessage(accumulated)
      },
      onDone: () => {
        setStreaming(false)
      },
      onError: (error) => {
        updateLastMessage(`⚠️ ${error.message}`)
        setStreaming(false)
      },
    })

    // assistantMsg를 사용해서 lint 경고 방지
    void assistantMsg
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={toggle}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center transition-all hover:scale-105"
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {/* 챗봇 패널 */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-40 w-80 h-[480px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          {/* 헤더 */}
          <div className="px-4 py-3 bg-blue-600 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle size={16} />
              <span className="font-medium text-sm">AI 어시스턴트</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearMessages}
                title="대화 초기화"
                className="p-1.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={toggle}
                className="p-1.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* API 키 미설정 경고 */}
          {!anthropicKey && (
            <div className="mx-3 mt-3 flex items-start gap-2 p-2.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg text-xs text-orange-700 dark:text-orange-300">
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
              <span>Anthropic API 키를 설정 페이지에서 입력하세요.</span>
            </div>
          )}

          {/* 추천 질문 */}
          {messages.length === 0 && <SuggestedQuestions onSelect={sendMessage} />}

          {/* 메시지 목록 */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            {messages.length === 0 && (
              <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4">
                현재 로드된 업무 데이터를 기반으로 답변드립니다.
              </p>
            )}
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-2xl rounded-bl-sm">
                  <Loader2 size={14} className="animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력창 */}
          <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-700 shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지 입력... (Enter 전송)"
                rows={1}
                disabled={isStreaming || !anthropicKey}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 max-h-24"
                style={{ overflowY: 'auto' }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming || !anthropicKey}
                className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                {isStreaming ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
