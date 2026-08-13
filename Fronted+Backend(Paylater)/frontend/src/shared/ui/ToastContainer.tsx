import { useEffect, useState, type ReactElement } from 'react'
import { toastState, type Toast } from './toastState'

export function ToastContainer(): ReactElement {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    return toastState.subscribe(setToasts)
  }, [])

  return (
    <>
      <style>{`
        @keyframes toast-slide-in {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .toast-item {
          animation: toast-slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .toast-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
          max-width: calc(100vw - 24px);
        }
        @media (max-width: 640px) {
          .toast-container {
            top: 12px;
            right: 12px;
            left: 12px;
            max-width: none;
          }
          .toast-item {
            min-width: 0 !important;
            max-width: none !important;
          }
        }
      `}</style>
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="toast-item"
            style={{
              pointerEvents: 'auto',
              minWidth: '280px',
              maxWidth: '400px',
              backgroundColor: toast.type === 'success' ? '#059669' : '#dc2626',
              color: '#ffffff',
              padding: '14px 18px',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '14px',
              fontWeight: 500,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <span style={{ flex: 1, whiteSpace: 'pre-line' }}>{toast.message}</span>
            <button
              onClick={() => toastState.remove(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                opacity: 0.7,
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0 4px',
                lineHeight: 1,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
