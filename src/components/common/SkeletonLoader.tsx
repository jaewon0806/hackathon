export function CommitSkeleton() {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 py-3 px-4 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        </div>
      ))}
    </div>
  )
}
