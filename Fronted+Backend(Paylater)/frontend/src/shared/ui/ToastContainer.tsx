import { useEffect, useState, type ReactElement } from 'react'

import { toastState, type Toast } from './toastState'
import './toast.css'

export function ToastContainer(): ReactElement {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    return toastState.subscribe(setToasts)
  }, [])

  return (
    <div className="toast-container" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={
            toast.type === 'success'
              ? 'toast-item toast-item--success'
              : 'toast-item toast-item--error'
          }
          role="status"
        >
          <span className="toast-item__message">{toast.message}</span>
          <button
            type="button"
            className="toast-item__close"
            aria-label="Dismiss notification"
            onClick={() => toastState.remove(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
