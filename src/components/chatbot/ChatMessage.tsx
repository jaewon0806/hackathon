import type { ChatMessage as ChatMessageType } from '@/types/chatbot.types'

interface Props {
  message: ChatMessageType
}

// 간단한 마크다운 렌더링 (bold, code, 줄바꿈)
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    // 코드 블록은 단순 처리
    const parts = line.split(/(`[^`]+`)/)
    const rendered = parts.map((part, j) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={j}
            className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-xs font-mono"
          >
            {part.slice(1, -1)}
          </code>
        )
      }
      // bold
      const boldParts = part.split(/(\*\*[^*]+\*\*)/)
      return boldParts.map((bp, k) => {
        if (bp.startsWith('**') && bp.endsWith('**')) {
          return <strong key={k}>{bp.slice(2, -2)}</strong>
        }
        return bp
      })
    })
    return (
      <span key={i}>
        {rendered}
        {i < lines.length - 1 && <br />}
      </span>
    )
  })
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm'
        }`}
      >
        {renderMarkdown(message.content)}
      </div>
    </div>
  )
}
