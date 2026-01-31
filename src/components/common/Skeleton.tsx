import React from 'react'

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-[rgba(0,0,0,0.08)]">
      {/* Header Skeleton */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F5F5F7] animate-pulse" />
          <div className="space-y-2">
            <div className="w-24 h-4 bg-[#F5F5F7] rounded animate-pulse" />
            <div className="w-16 h-3 bg-[#E5E5EA] rounded animate-pulse" />
          </div>
        </div>
        <div className="w-16 h-3 bg-[#E5E5EA] rounded animate-pulse" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-2 mb-3">
        <div className="w-20 h-3 bg-[#F5F5F7] rounded animate-pulse" />
        <div className="w-full h-3 bg-[#E5E5EA] rounded animate-pulse" />
        <div className="w-3/4 h-3 bg-[#E5E5EA] rounded animate-pulse" />
      </div>

      {/* Footer Skeleton */}
      <div className="flex justify-between items-center pt-3 border-t border-[rgba(0,0,0,0.08)]">
        <div className="w-24 h-4 bg-[#F5F5F7] rounded-full animate-pulse" />
        <div className="w-8 h-8 bg-[#F5F5F7] rounded-full animate-pulse" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonText({ width = '100%', height = '1rem' }: { width?: string; height?: string }) {
  return (
    <div
      className="bg-[#F5F5F7] rounded animate-pulse"
      style={{ width, height }}
    />
  )
}

export function SkeletonStatusCard() {
  return (
    <div className="min-w-[80px] p-4 bg-white rounded-2xl shadow-sm border border-[rgba(0,0,0,0.08)] animate-pulse">
      <div className="w-12 h-7 mx-auto mb-2 bg-[#F5F5F7] rounded" />
      <div className="w-16 h-3 mx-auto bg-[#E5E5EA] rounded" />
    </div>
  )
}
