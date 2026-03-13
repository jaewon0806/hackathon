import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage } from '@/types/chatbot.types'

const MAX_HISTORY = 50

interface ChatbotStore {
  messages: ChatMessage[]
  isOpen: boolean
  isStreaming: boolean
  open: () => void
  close: () => void
  toggle: () => void
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage
  updateLastMessage: (content: string) => void
  clearMessages: () => void
  setStreaming: (v: boolean) => void
}

export const useChatbotStore = create<ChatbotStore>()(
  persist(
    (set) => ({
      messages: [],
      isOpen: false,
      isStreaming: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      addMessage: (message) => {
        const newMsg: ChatMessage = {
          ...message,
          id: Math.random().toString(36).slice(2),
          timestamp: new Date(),
        }
        set((s) => ({
          messages: [...s.messages.slice(-MAX_HISTORY + 1), newMsg],
        }))
        return newMsg
      },
      updateLastMessage: (content) =>
        set((s) => {
          const msgs = [...s.messages]
          if (msgs.length > 0) {
            msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content }
          }
          return { messages: msgs }
        }),
      clearMessages: () => set({ messages: [] }),
      setStreaming: (v) => set({ isStreaming: v }),
    }),
    {
      name: 'chatbot_history',
      partialize: (state) => ({
        messages: state.messages.slice(-MAX_HISTORY),
      }),
    }
  )
)

