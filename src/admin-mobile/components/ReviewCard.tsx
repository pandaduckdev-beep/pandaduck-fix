import { Star, CheckCircle, Image } from 'lucide-react'

interface ReviewCardProps {
  customerName: string
  rating: number
  serviceName: string
  content: string
  date: string
  isApproved: boolean
  isPublic: boolean
  reviewId: string
  imageUrls?: string[]
  onTogglePublic?: () => void
  onView?: () => void
  onDelete?: () => void
}

export function ReviewCard({
  customerName,
  rating,
  serviceName,
  content,
  date,
  isApproved,
  reviewId,
  imageUrls,
}: ReviewCardProps) {

  const imageCount = imageUrls?.length || 0
  const hasImages = imageCount > 0

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, i) =>
      i < rating ? (
        <Star key={i} className="w-4 h-4 fill-[#FFCC00] text-[#FFCC00]" strokeWidth={0} />
      ) : (
        <Star key={i} className="w-4 h-4 text-[#E5E5EA] stroke-[#E5E5EA]" strokeWidth={2} />
      )
    )
  }

  const handleClick = (e: React.MouseEvent) => {
    // 카드 클릭 시 상세 페이지로 이동
    if (!e.target.closest('button') && !e.target.closest('label')) {
      window.location.href = `/admin-mobile/reviews/${reviewId}`
    }
  }

  return (
    <div
      className="py-4 border-b border-[rgba(0,0,0,0.06)] last:border-0 transition-ios hover:bg-[#F5F5F7]/50 -mx-4 px-4 cursor-pointer"
      onClick={handleClick}
    >
      {/* Header: Customer info & Rating */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-[#1D1D1F]" style={{ fontWeight: 600 }}>
            {customerName}
          </h3>
          <span className="text-xs text-[#86868B]" style={{ fontWeight: 500 }}>
            {date}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">{renderStars()}</div>
            {hasImages && (
              <div className="flex items-center gap-1 text-[#86868B]" title="이미지 첨부됨">
                <Image className="w-3.5 h-3.5" strokeWidth={2} />
                <span className="text-xs" style={{ fontWeight: 500 }}>{imageCount}</span>
              </div>
            )}
          </div>
          {isApproved && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-[#E6F9F0] text-[#34C759] rounded text-[10px] font-semibold flex-shrink-0">
              <CheckCircle className="w-3 h-3" strokeWidth={3} />
              승인됨
            </span>
          )}
        </div>
      </div>

      {/* Service & Content */}
      <div>
        <span className="inline-block px-2 py-0.5 bg-[#F5F5F7] text-[#86868B] rounded text-[10px] font-semibold mb-2">
          {serviceName}
        </span>
        {content && (
          <p className="text-sm text-[#1D1D1F] leading-relaxed line-clamp-2" style={{ fontWeight: 500 }}>
            {content}
          </p>
        )}
      </div>
    </div>
  )
}
