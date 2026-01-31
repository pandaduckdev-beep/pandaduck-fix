import React, { useState, useRef, TouchEvent } from 'react'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  threshold?: number
}

export function PullToRefresh({ onRefresh, children, threshold = 80 }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const currentY = useRef(0)

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
      setPulling(true)
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!pulling) return

    currentY.current = e.touches[0].clientY
    const distance = currentY.current - startY.current

    // Only pull down (positive distance)
    if (distance > 0 && window.scrollY === 0) {
      // Add resistance
      const resistance = 0.3
      const adjustedDistance = distance * resistance

      // Cap at threshold + 20px
      const maxDistance = threshold + 20
      const clampedDistance = Math.min(adjustedDistance, maxDistance)

      setPullDistance(clampedDistance)

      // Prevent default scroll
      if (distance > 10) {
        e.preventDefault()
      }
    }
  }

  const handleTouchEnd = async () => {
    if (!pulling) return

    setPulling(false)

    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true)
      setPullDistance(threshold)

      try {
        await onRefresh()
      } finally {
        setRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }

    startY.current = 0
    currentY.current = 0
  }

  const progress = Math.min(pullDistance / threshold, 1)

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull Indicator */}
      <div
        className="fixed left-0 right-0 flex items-center justify-center pointer-events-none z-50"
        style={{
          height: `${Math.max(0, pullDistance - 20)}px`,
          opacity: progress,
          transition: refreshing ? 'height 0.3s' : 'none',
        }}
      >
        <div className="bg-white rounded-full shadow-lg p-3 flex items-center gap-2">
          <RefreshCw
            className={`w-5 h-5 text-[#007AFF] ${
              refreshing ? 'animate-spin' : ''
            }`}
            style={{ transform: `rotate(${progress * 360}deg)` }}
          />
          <span className="text-sm text-[#86868B] font-medium">
            {refreshing ? '새로고침 중...' : '당겨서 새로고침'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: pulling ? `translateY(${pullDistance * 0.5}px)` : 'none',
          transition: pulling ? 'none' : 'transform 0.3s',
        }}
      >
        {children}
      </div>
    </div>
  )
}
