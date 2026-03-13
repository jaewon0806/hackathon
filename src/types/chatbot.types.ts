export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatbotState {
  messages: ChatMessage[]
  isOpen: boolean
  isStreaming: boolean
}
