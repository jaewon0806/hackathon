import { useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { ToastContext } from './toastContext'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  type: ToastType
  message: string
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-3 rounded-lg shadow-lg border text-sm ${
              toast.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-200'
                : toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200'
                : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle size={16} className="mt-0.5 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
            ) : (
              <Info size={16} className="mt-0.5 shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => dismiss(toast.id)} className="shrink-0 opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
