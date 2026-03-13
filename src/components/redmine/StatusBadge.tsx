interface Props {
  status: string
}

const statusStyles: Record<string, string> = {
  '신규': 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  '진행 중': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  '해결됨': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  '완료': 'bg-green-200 text-green-800 dark:bg-green-900/60 dark:text-green-200',
  '반려': 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300',
  '피드백': 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300',
}

const defaultStyle = 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'

export function StatusBadge({ status }: Props) {
  const style = statusStyles[status] ?? defaultStyle
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style}`}>
      {status}
    </span>
  )
}
