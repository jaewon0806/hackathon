interface Props {
  onSelect: (question: string) => void
}

const QUESTIONS = [
  '담당 일감 알려줘',
  '마감 임박 일감 있어?',
  '이번 주 커밋 요약해줘',
  '진행 중인 일감 목록',
]

export function SuggestedQuestions({ onSelect }: Props) {
  return (
    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">자주 쓰는 질문</p>
      <div className="flex flex-wrap gap-1.5">
        {QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="px-2.5 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
