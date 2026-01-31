import React from 'react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      {/* Icon */}
      {icon && (
        <div className="w-16 h-16 mb-4 flex items-center justify-center text-[#C7C7CC]">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-ios-title text-[#1D1D1F] text-center mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-ios-subtitle text-[#86868B] text-center mb-6 max-w-sm">
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-[#007AFF] text-white font-semibold rounded-xl transition-ios btn-press"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
