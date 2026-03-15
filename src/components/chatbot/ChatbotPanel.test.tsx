import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// 외부 의존성 전체 모킹
vi.mock('@/store/chatbotStore', () => ({
  useChatbotStore: vi.fn(),
}))
vi.mock('@/store/settingsStore', () => ({
  useSettingsStore: vi.fn(),
}))
vi.mock('@/store/redmineStore', () => ({
  useRedmineStore: vi.fn(),
}))
vi.mock('@/store/gitlabStore', () => ({
  useGitlabStore: vi.fn(),
}))
vi.mock('@/hooks/useRedmineIssues', () => ({
  useRedmineIssues: () => ({ data: [] }),
}))
vi.mock('@/hooks/useGitlabCommits', () => ({
  useGitlabCommits: () => ({ data: undefined }),
}))
vi.mock('@/api/claudeClient', () => ({
  streamChatMessage: vi.fn(),
}))
vi.mock('./ChatMessage', () => ({
  ChatMessage: ({ message }: { message: { content: string } }) => <div>{message.content}</div>,
}))
vi.mock('./SuggestedQuestions', () => ({
  SuggestedQuestions: () => <div>추천 질문</div>,
}))

import { useChatbotStore } from '@/store/chatbotStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useRedmineStore } from '@/store/redmineStore'
import { useGitlabStore } from '@/store/gitlabStore'
import { ChatbotPanel } from './ChatbotPanel'

// jsdom에 scrollIntoView 미구현 → 모킹
window.HTMLElement.prototype.scrollIntoView = vi.fn()

const mockChatbotStore = {
  messages: [],
  isOpen: false,
  isStreaming: false,
  toggle: vi.fn(),
  addMessage: vi.fn().mockReturnValue({ id: '1', role: 'assistant', content: '' }),
  updateLastMessage: vi.fn(),
  clearMessages: vi.fn(),
  setStreaming: vi.fn(),
}

const mockSettings = { anthropic: { apiKey: 'test-key' } }

beforeEach(() => {
  vi.mocked(useChatbotStore).mockReturnValue(mockChatbotStore)
  vi.mocked(useSettingsStore).mockImplementation((selector: (s: typeof mockSettings) => unknown) =>
    selector(mockSettings)
  )
  vi.mocked(useRedmineStore).mockReturnValue({ selectedProjectId: null, selectedVersionId: null } as never)
  vi.mocked(useGitlabStore).mockReturnValue({
    selectedProjectId: null,
    selectedBranch: null,
    dateRange: { from: null, to: null },
  } as never)
})

describe('ChatbotPanel', () => {
  it('플로팅 버튼이 항상 렌더링된다', () => {
    render(<ChatbotPanel />)
    const btn = screen.getByRole('button')
    expect(btn).toBeInTheDocument()
  })

  it('isOpen=false 이면 채팅 패널이 보이지 않는다', () => {
    render(<ChatbotPanel />)
    expect(screen.queryByText('AI 어시스턴트')).not.toBeInTheDocument()
  })

  it('isOpen=true 이면 채팅 패널이 표시된다', () => {
    vi.mocked(useChatbotStore).mockReturnValue({ ...mockChatbotStore, isOpen: true })
    render(<ChatbotPanel />)
    expect(screen.getByText('AI 어시스턴트')).toBeInTheDocument()
  })

  it('API 키 미설정 시 경고 메시지가 표시된다', () => {
    vi.mocked(useChatbotStore).mockReturnValue({ ...mockChatbotStore, isOpen: true })
    vi.mocked(useSettingsStore).mockImplementation((selector: (s: typeof mockSettings) => unknown) =>
      selector({ anthropic: { apiKey: '' } })
    )
    render(<ChatbotPanel />)
    expect(screen.getByText(/Anthropic API 키를 설정 페이지에서 입력하세요/)).toBeInTheDocument()
  })

  it('API 키 설정 시 경고 메시지가 표시되지 않는다', () => {
    vi.mocked(useChatbotStore).mockReturnValue({ ...mockChatbotStore, isOpen: true })
    render(<ChatbotPanel />)
    expect(screen.queryByText(/Anthropic API 키를 설정 페이지에서 입력하세요/)).not.toBeInTheDocument()
  })

  it('플로팅 버튼 클릭 시 toggle이 호출된다', async () => {
    const toggle = vi.fn()
    vi.mocked(useChatbotStore).mockReturnValue({ ...mockChatbotStore, toggle })
    render(<ChatbotPanel />)
    await userEvent.click(screen.getByRole('button'))
    expect(toggle).toHaveBeenCalledTimes(1)
  })

  it('메시지가 없을 때 추천 질문이 표시된다', () => {
    vi.mocked(useChatbotStore).mockReturnValue({ ...mockChatbotStore, isOpen: true, messages: [] })
    render(<ChatbotPanel />)
    expect(screen.getByText('추천 질문')).toBeInTheDocument()
  })
})
