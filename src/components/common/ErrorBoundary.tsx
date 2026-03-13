import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  reset = () => this.setState({ hasError: false, error: null })

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-500 dark:text-gray-400">
          <AlertTriangle size={40} className="text-red-400" />
          <div className="text-center">
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">예기치 않은 오류가 발생했습니다.</p>
            <p className="text-sm">{this.state.error?.message}</p>
          </div>
          <button
            onClick={this.reset}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={14} />
            다시 시도
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
