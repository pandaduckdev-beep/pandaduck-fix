import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  type: ToastType
  title: string
  message?: string
  duration?: number
  onClose?: () => void
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-[#E6F9F0]',
    iconColor: 'text-[#34C759]',
    titleColor: 'text-[#1D1D1F]',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-[rgba(255,59,48,0.1)]',
    iconColor: 'text-[#FF3B30]',
    titleColor: 'text-[#FF3B30]',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-[rgba(255,149,0,0.1)]',
    iconColor: 'text-[#FF9500]',
    titleColor: 'text-[#FF9500]',
  },
  info: {
    icon: Info,
    bgColor: 'bg-[rgba(0,122,255,0.1)]',
    iconColor: 'text-[#007AFF]',
    titleColor: 'text-[#007AFF]',
  },
}

export function Toast({ type, title, message, duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onClose?.(), 300) // Wait for fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const config = toastConfig[type]
  const Icon = config.icon

  if (!visible) return null

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-[100] ${config.bgColor} rounded-2xl shadow-2xl p-4 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${config.titleColor}`}>{title}</h4>
          {message && (
            <p className="text-sm text-[#86868B] mt-0.5">{message}</p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setVisible(false)
            setTimeout(() => onClose?.(), 300)
          }}
          className="flex-shrink-0 p-1 text-[#86868B] hover:text-[#1D1D1F] transition-ios btn-press rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
