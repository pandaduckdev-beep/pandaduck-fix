import React from 'react'
import { Menu as MenuIcon, NotificationsNone } from '@mui/icons-material'

interface MobileHeaderProps {
  title: string
  subtitle?: string
  onMenuClick?: () => void
  onNotificationClick?: () => void
  rightAction?: React.ReactNode
}

export function MobileHeader({
  title,
  subtitle,
  onMenuClick,
  onNotificationClick,
  rightAction,
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
            {title}
          </h1>
          {subtitle && (
            <span className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {rightAction || (
            <>
              {onNotificationClick && (
                <button
                  onClick={onNotificationClick}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300"
                >
                  <NotificationsNone fontSize="small" />
                </button>
              )}
              {onMenuClick && (
                <button
                  onClick={onMenuClick}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300"
                >
                  <MenuIcon fontSize="small" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
