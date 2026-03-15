import { describe, it, expect, beforeEach } from 'vitest'
import { useChatbotStore } from './chatbotStore'

// 각 테스트 전 스토어 초기화
beforeEach(() => {
  useChatbotStore.setState({
    messages: [],
    isOpen: false,
    isStreaming: false,
  })
})

describe('ChatbotStore — open/close/toggle', () => {
  it('초기 상태: isOpen=false', () => {
    expect(useChatbotStore.getState().isOpen).toBe(false)
  })

  it('open() → isOpen=true', () => {
    useChatbotStore.getState().open()
    expect(useChatbotStore.getState().isOpen).toBe(true)
  })

  it('close() → isOpen=false', () => {
    useChatbotStore.setState({ isOpen: true })
    useChatbotStore.getState().close()
    expect(useChatbotStore.getState().isOpen).toBe(false)
  })

  it('toggle(): false→true', () => {
    useChatbotStore.getState().toggle()
    expect(useChatbotStore.getState().isOpen).toBe(true)
  })

  it('toggle(): true→false', () => {
    useChatbotStore.setState({ isOpen: true })
    useChatbotStore.getState().toggle()
    expect(useChatbotStore.getState().isOpen).toBe(false)
  })

  it('toggle 연속 2회 → 원래 상태', () => {
    useChatbotStore.getState().toggle()
    useChatbotStore.getState().toggle()
    expect(useChatbotStore.getState().isOpen).toBe(false)
  })
})

describe('ChatbotStore — addMessage', () => {
  it('메시지 추가 후 messages 배열에 포함', () => {
    useChatbotStore.getState().addMessage({ role: 'user', content: '안녕하세요' })
    expect(useChatbotStore.getState().messages).toHaveLength(1)
    expect(useChatbotStore.getState().messages[0].content).toBe('안녕하세요')
    expect(useChatbotStore.getState().messages[0].role).toBe('user')
  })

  it('addMessage 반환값에 id와 timestamp 포함', () => {
    const msg = useChatbotStore.getState().addMessage({ role: 'assistant', content: '응답' })
    expect(msg.id).toBeDefined()
    expect(msg.timestamp).toBeInstanceOf(Date)
  })

  it('여러 메시지 순서 유지', () => {
    useChatbotStore.getState().addMessage({ role: 'user', content: '첫 번째' })
    useChatbotStore.getState().addMessage({ role: 'assistant', content: '두 번째' })
    useChatbotStore.getState().addMessage({ role: 'user', content: '세 번째' })

    const msgs = useChatbotStore.getState().messages
    expect(msgs).toHaveLength(3)
    expect(msgs[0].content).toBe('첫 번째')
    expect(msgs[2].content).toBe('세 번째')
  })

  it('id는 각 메시지마다 고유함', () => {
    useChatbotStore.getState().addMessage({ role: 'user', content: 'A' })
    useChatbotStore.getState().addMessage({ role: 'user', content: 'B' })
    const msgs = useChatbotStore.getState().messages
    expect(msgs[0].id).not.toBe(msgs[1].id)
  })
})

describe('ChatbotStore — updateLastMessage', () => {
  it('마지막 메시지 content가 업데이트된다', () => {
    useChatbotStore.getState().addMessage({ role: 'assistant', content: '' })
    useChatbotStore.getState().updateLastMessage('스트리밍 완료 내용')
    const msgs = useChatbotStore.getState().messages
    expect(msgs[msgs.length - 1].content).toBe('스트리밍 완료 내용')
  })

  it('여러 메시지 중 마지막만 업데이트', () => {
    useChatbotStore.getState().addMessage({ role: 'user', content: '사용자 질문' })
    useChatbotStore.getState().addMessage({ role: 'assistant', content: '초기' })
    useChatbotStore.getState().updateLastMessage('수정됨')

    const msgs = useChatbotStore.getState().messages
    expect(msgs[0].content).toBe('사용자 질문')
    expect(msgs[1].content).toBe('수정됨')
  })

  it('메시지가 없을 때 updateLastMessage 호출해도 에러 없음', () => {
    expect(() => {
      useChatbotStore.getState().updateLastMessage('아무 내용')
    }).not.toThrow()
  })
})

describe('ChatbotStore — clearMessages', () => {
  it('clearMessages 후 messages 배열이 비워진다', () => {
    useChatbotStore.getState().addMessage({ role: 'user', content: '질문' })
    useChatbotStore.getState().addMessage({ role: 'assistant', content: '답변' })
    useChatbotStore.getState().clearMessages()
    expect(useChatbotStore.getState().messages).toHaveLength(0)
  })
})

describe('ChatbotStore — setStreaming', () => {
  it('setStreaming(true) → isStreaming=true', () => {
    useChatbotStore.getState().setStreaming(true)
    expect(useChatbotStore.getState().isStreaming).toBe(true)
  })

  it('setStreaming(false) → isStreaming=false', () => {
    useChatbotStore.setState({ isStreaming: true })
    useChatbotStore.getState().setStreaming(false)
    expect(useChatbotStore.getState().isStreaming).toBe(false)
  })
})

describe('ChatbotStore — MAX_HISTORY 제한', () => {
  it('50개 초과 시 오래된 메시지가 잘린다', () => {
    // 51개 메시지 추가
    for (let i = 0; i < 51; i++) {
      useChatbotStore.getState().addMessage({ role: 'user', content: `메시지 ${i}` })
    }
    // 최대 50개 유지
    expect(useChatbotStore.getState().messages.length).toBeLessThanOrEqual(50)
    // 가장 최근 메시지가 보존됨
    const msgs = useChatbotStore.getState().messages
    expect(msgs[msgs.length - 1].content).toBe('메시지 50')
  })
})
