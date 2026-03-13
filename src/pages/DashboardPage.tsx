// Sprint 4에서 완성 예정 — 현재 플레이스홀더
export function DashboardPage() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">오늘의 업무 현황</h2>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '담당 일감', value: '-', color: 'blue' },
          { label: '이번 주 커밋', value: '-', color: 'purple' },
          { label: '진행 중', value: '-', color: 'yellow' },
          { label: '기한 초과', value: '-', color: 'red' },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{value}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-400">Sprint 4에서 실제 데이터가 표시됩니다.</p>
    </div>
  )
}
