export type ToastType = 'success' | 'error'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

type Listener = (toasts: Toast[]) => void

let toasts: Toast[] = []
let listeners: Listener[] = []

function notify() {
  listeners.forEach((listener) => listener([...toasts]))
}

export const toastState = {
  add(message: string, type: ToastType) {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = { id, message, type }
    toasts = [...toasts, newToast]
    notify()

    setTimeout(() => {
      this.remove(id)
    }, 4000)
  },

  remove(id: string) {
    toasts = toasts.filter((t) => t.id !== id)
    notify()
  },

  subscribe(listener: Listener) {
    listeners.push(listener)
    listener([...toasts])
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
}

export function showToast(message: string, type: ToastType = 'success') {
  toastState.add(message, type)
}
