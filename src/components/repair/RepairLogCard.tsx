import { memo } from 'react'
import { ChevronRight, Calendar, Gamepad2 } from 'lucide-react'
import { LazyImage } from '@/components/common/LazyImage'
import type { RepairLog } from '@/types/database'

// 썸네일 URL 최적화 함수
const getOptimizedThumbnailUrl = (url: string | null, size: number = 150): string | null => {
  if (!url) return null

  // Supabase Storage URL인지 확인
  if (url.includes('/storage/v1/object/public/')) {
    try {
      const urlObj = new URL(url)

      // 기존 파라미터 제거 (중복 방지)
      urlObj.searchParams.delete('width')
      urlObj.searchParams.delete('quality')
      urlObj.searchParams.delete('resize')
      urlObj.searchParams.delete('format')

      // 이미지 변환 파라미터 추가 (최적화)
      urlObj.searchParams.set('width', size.toString())
      urlObj.searchParams.set('quality', '75')
      urlObj.searchParams.set('resize', 'cover')
      urlObj.searchParams.set('format', 'webp')

      return urlObj.toString()
    } catch {
      return url
    }
  }

  return url
}

interface RepairLogCardProps {
  log: RepairLog
  onClick: () => void
}

/**
 * RepairLogCard - 수리 작업기 리스트 아이템 컴포넌트
 *
 * React.memo로 최적화되어 props가 변경되지 않으면 리렌더링되지 않습니다.
 * LazyImage를 사용하여 이미지는 화면에 보이기 직전에 로드됩니다.
 */
export const RepairLogCard = memo(function RepairLogCard({ log, onClick }: RepairLogCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-[#F5F5F7] rounded-[20px] sm:rounded-[28px] p-4 sm:p-5 text-left hover:bg-[#EBEBED] transition-colors"
    >
      <div className="flex gap-4">
        {/* Thumbnail with LazyImage */}
        <LazyImage
          src={getOptimizedThumbnailUrl(log.thumbnail_url, 200)}
          alt={log.title}
          width={80}
          height={80}
          className="rounded-xl sm:w-24 sm:h-24"
          fallback={<Gamepad2 className="w-8 h-8 text-[#86868B]" />}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className="text-base sm:text-lg mb-1 line-clamp-2"
            style={{ fontWeight: 600 }}
          >
            {log.title}
          </h3>

          {/* Controller Model */}
          {log.controller_model && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-1 bg-white rounded-full">
                {log.controller_model}
              </span>
            </div>
          )}

          {/* Content Preview */}
          {log.summary && (
            <p className="text-sm text-[#86868B] mb-2 line-clamp-2">
              {log.summary}
            </p>
          )}

          {/* Date */}
          <div className="flex items-center gap-2 text-xs text-[#86868B]">
            <Calendar className="w-3 h-3" />
            <span>{new Date(log.created_at).toLocaleDateString('ko-KR')}</span>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-[#86868B] flex-shrink-0 self-center" />
      </div>
    </button>
  )
})
