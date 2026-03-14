import { useState } from 'react'
import { Eye, EyeOff, Loader2, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { testGitlabConnection, testRedmineConnection } from '@/api/connectionTest'

// 비밀번호 입력 컴포넌트 (토큰/키 입력용)
function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

// 스텝 인디케이터
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i < current
              ? 'w-2 h-2 bg-blue-500'
              : i === current
              ? 'w-6 h-2 bg-blue-600'
              : 'w-2 h-2 bg-gray-300 dark:bg-gray-600'
          }`}
        />
      ))}
    </div>
  )
}

const TOTAL_STEPS = 3

export function OnboardingModal() {
  const store = useSettingsStore()

  const [step, setStep] = useState(0)

  // GitLab 입력 상태 (URL은 환경변수 고정이므로 제외)
  const [gitlabToken, setGitlabToken] = useState(store.gitlab.token)
  const [testingGitlab, setTestingGitlab] = useState(false)
  const [gitlabStatus, setGitlabStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [gitlabMessage, setGitlabMessage] = useState('')

  // Redmine 입력 상태 (URL은 환경변수 고정이므로 제외)
  const [redmineKey, setRedmineKey] = useState(store.redmine.apiKey)
  const [testingRedmine, setTestingRedmine] = useState(false)
  const [redmineStatus, setRedmineStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [redmineMessage, setRedmineMessage] = useState('')

  // Anthropic 입력 상태
  const [anthropicKey, setAnthropicKey] = useState(store.anthropic.apiKey)

  const handleTestGitlab = async () => {
    setTestingGitlab(true)
    setGitlabStatus('idle')
    // URL은 환경변수에서 초기화된 store 값 사용
    const result = await testGitlabConnection(store.gitlab.url, gitlabToken)
    setTestingGitlab(false)
    if (result.success) {
      setGitlabStatus('success')
      setGitlabMessage(`연결 성공 (${result.username})`)
    } else {
      setGitlabStatus('error')
      setGitlabMessage(result.error || '연결 실패')
    }
  }

  const handleTestRedmine = async () => {
    setTestingRedmine(true)
    setRedmineStatus('idle')
    // URL은 환경변수에서 초기화된 store 값 사용
    const result = await testRedmineConnection(store.redmine.url, redmineKey)
    setTestingRedmine(false)
    if (result.success) {
      setRedmineStatus('success')
      setRedmineMessage(`연결 성공 (${result.username})`)
    } else {
      setRedmineStatus('error')
      setRedmineMessage(result.error || '연결 실패')
    }
  }

  const handleNext = () => {
    // 현재 단계 데이터 저장 후 다음 단계로
    if (step === 0) {
      store.setGitlab({ token: gitlabToken })
    } else if (step === 1) {
      store.setRedmine({ apiKey: redmineKey })
    }
    setStep((s) => s + 1)
  }

  const handleSkipAnthropic = () => {
    // Anthropic 건너뛰기 — store에 빈값 유지 (변경 없음)
    store.setGitlab({ token: gitlabToken })
    store.setRedmine({ apiKey: redmineKey })
  }

  const handleFinish = () => {
    store.setGitlab({ token: gitlabToken })
    store.setRedmine({ apiKey: redmineKey })
    store.setAnthropic({ apiKey: anthropicKey })
  }

  // 다음 버튼 활성화 조건 (URL 제거 후 토큰/키만 확인)
  const canProceed = () => {
    if (step === 0) return !!gitlabToken.trim()
    if (step === 1) return !!redmineKey.trim()
    return true
  }

  return (
    // 오버레이 + backdrop-blur
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8">
        {/* 헤더 */}
        <div className="text-center mb-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">업무 대시보드 설정</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {step === 0 && 'GitLab Personal Access Token을 입력하세요.'}
            {step === 1 && 'Redmine API Access Key를 입력하세요.'}
            {step === 2 && 'Claude AI 챗봇 설정 (선택 사항)'}
          </p>
        </div>

        {/* 스텝 인디케이터 */}
        <StepIndicator current={step} total={TOTAL_STEPS} />

        {/* 스텝 콘텐츠 */}
        <div className="space-y-4">
          {/* Step 0: GitLab */}
          {step === 0 && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Personal Access Token
                </label>
                <PasswordInput
                  value={gitlabToken}
                  onChange={setGitlabToken}
                  placeholder="glpat-xxxxxxxxxxxx"
                />
              </div>
              <button
                onClick={handleTestGitlab}
                disabled={testingGitlab || !store.gitlab.url || !gitlabToken}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {testingGitlab && <Loader2 size={14} className="animate-spin" />}
                {!testingGitlab && gitlabStatus === 'success' && <CheckCircle size={14} className="text-green-500" />}
                연결 테스트
              </button>
              {gitlabMessage && (
                <p className={`text-xs ${gitlabStatus === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                  {gitlabMessage}
                </p>
              )}
            </>
          )}

          {/* Step 1: Redmine */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  API Access Key
                </label>
                <PasswordInput
                  value={redmineKey}
                  onChange={setRedmineKey}
                  placeholder="API 액세스 키"
                />
              </div>
              <button
                onClick={handleTestRedmine}
                disabled={testingRedmine || !store.redmine.url || !redmineKey}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {testingRedmine && <Loader2 size={14} className="animate-spin" />}
                {!testingRedmine && redmineStatus === 'success' && <CheckCircle size={14} className="text-green-500" />}
                연결 테스트
              </button>
              {redmineMessage && (
                <p className={`text-xs ${redmineStatus === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                  {redmineMessage}
                </p>
              )}
            </>
          )}

          {/* Step 2: Anthropic (선택) */}
          {step === 2 && (
            <>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-700 dark:text-blue-300">
                Anthropic API 키는 챗봇 기능에만 사용됩니다. 건너뛰어도 대시보드 기능은 모두 사용 가능합니다.
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Anthropic API Key <span className="text-gray-400">(선택)</span>
                </label>
                <PasswordInput
                  value={anthropicKey}
                  onChange={setAnthropicKey}
                  placeholder="sk-ant-xxxxxxxxxxxx"
                />
              </div>
            </>
          )}
        </div>

        {/* 데모 모드 안내 (Step 0에서만 표시) */}
        {step === 0 && import.meta.env.VITE_DEMO_MODE === 'true' && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-between gap-2">
            <span className="text-xs text-amber-700 dark:text-amber-300">
              API 키 없이 샘플 데이터로 체험할 수 있습니다.
            </span>
            <button
              onClick={handleFinish}
              className="shrink-0 text-xs font-medium text-amber-700 dark:text-amber-300 underline hover:no-underline"
            >
              데모로 시작
            </button>
          </div>
        )}

        {/* 하단 버튼 영역 */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          {/* 이전 버튼 */}
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <ChevronLeft size={16} />
              이전
            </button>
          ) : (
            <div />
          )}

          {/* 다음/완료/건너뛰기 버튼 */}
          <div className="flex items-center gap-2">
            {/* Anthropic 단계 건너뛰기 */}
            {step === 2 && (
              <button
                onClick={handleSkipAnthropic}
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-3 py-2 transition-colors"
              >
                건너뛰기
              </button>
            )}
            {step < TOTAL_STEPS - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                다음
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <CheckCircle size={16} />
                완료
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
