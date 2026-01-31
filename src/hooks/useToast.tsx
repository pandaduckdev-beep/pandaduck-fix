import { useState, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { Toast, ToastType } from '../components/common/Toast'

interface ToastData {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

let toastRoot: any = null
let toastContainer: HTMLDivElement | null = null

// Initialize toast container
function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.id = 'toast-container'
    toastContainer.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; z-index: 9999; pointer-events: none;'
    document.body.appendChild(toastContainer)
  }
  return toastContainer
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const showToast = useCallback(
    (props: Omit<ToastData, 'id'> & { duration?: number }) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: ToastData = {
        id,
        type: props.type || 'info',
        title: props.title,
        message: props.message,
        duration: props.duration || 3000,
      }

      setToasts((prev) => [...prev, newToast])

      // Auto remove after duration
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)

      return id
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      return showToast({ type: 'success', title, message, duration })
    },
    [showToast]
  )

  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      return showToast({ type: 'error', title, message, duration })
    },
    [showToast]
  )

  const warning = useCallback(
    (title: string, message?: string, duration?: number) => {
      return showToast({ type: 'warning', title, message, duration })
    },
    [showToast]
  )

  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      return showToast({ type: 'info', title, message, duration })
    },
    [showToast]
  )

  return {
    showToast,
    success,
    error,
    warning,
    info,
    toasts,
  }
}

// Simple global toast function (without hook)
export function toast(type: ToastType, title: string, message?: string, duration = 3000) {
  const container = ensureToastContainer()
  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'pointer-events: auto;'
  container.appendChild(wrapper)

  const root = createRoot(wrapper)

  const handleRemove = () => {
    root.unmount()
    wrapper.remove()
  }

  root.render(
    <Toast
      type={type}
      title={title}
      message={message}
      duration={duration}
      onClose={handleRemove}
    />
  )
}
