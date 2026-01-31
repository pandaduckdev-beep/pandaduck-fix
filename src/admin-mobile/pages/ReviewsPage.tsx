import { MobileHeader } from '../components/MobileHeader'
import { MobileFooterNav } from '../components/MobileFooterNav'
import { ReviewCard } from '../components/ReviewCard'
import { useState } from 'react'
import { useReviews } from '../hooks/useReviews'
import { useDebouncedValue } from '@/lib/debounce'
import { Search } from 'lucide-react'

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'public' | 'private'>('all')
  const debouncedSearch = useDebouncedValue(searchQuery, 300)

  // Use custom hook with debounced search
  const { reviews, togglePublic, deleteReview } = useReviews(debouncedSearch)

  const formatTime = (date: string) => {
    const d = new Date(date)
    return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`
  }

  // Filter reviews by status
  const filteredReviews = reviews.filter((review) => {
    if (filterStatus === 'all') return true
    if (filterStatus === 'public') return review.is_public
    if (filterStatus === 'private') return !review.is_public
    return true
  })

  return (
    <div className="bg-white min-h-screen pb-20">
      <MobileHeader title="리뷰 관리" />

      <main className="p-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]" />
          <input
            type="text"
            placeholder="고객명, 서비스명, 리뷰 내용 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F5F5F7] border-none rounded-[16px] py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#007AFF]/20 transition-all placeholder:text-[#86868B]"
            style={{ fontWeight: 500 }}
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-[14px] text-xs whitespace-nowrap transition-all ${
              filterStatus === 'all'
                ? 'bg-[#007AFF] text-white'
                : 'bg-white border border-[rgba(0,0,0,0.08)] text-[#86868B]'
            }`}
            style={{ fontWeight: 600 }}
          >
            전체 ({reviews.length})
          </button>
          <button
            onClick={() => setFilterStatus('public')}
            className={`px-4 py-2 rounded-[14px] text-xs whitespace-nowrap transition-all ${
              filterStatus === 'public'
                ? 'bg-[#34C759] text-white'
                : 'bg-white border border-[rgba(0,0,0,0.08)] text-[#86868B]'
            }`}
            style={{ fontWeight: 600 }}
          >
            공개 ({reviews.filter((r) => r.is_public).length})
          </button>
          <button
            onClick={() => setFilterStatus('private')}
            className={`px-4 py-2 rounded-[14px] text-xs whitespace-nowrap transition-all ${
              filterStatus === 'private'
                ? 'bg-[#86868B] text-white'
                : 'bg-white border border-[rgba(0,0,0,0.08)] text-[#86868B]'
            }`}
            style={{ fontWeight: 600 }}
          >
            비공개 ({reviews.filter((r) => !r.is_public).length})
          </button>
        </div>

        {/* Review List */}
        <div>
          <p className="text-sm text-[#86868B] mb-3" style={{ fontWeight: 600 }}>
            총 {filteredReviews.length}건의 리뷰
          </p>
          <div className="bg-white rounded-xl overflow-hidden px-4">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                reviewId={review.id}
                customerName={review.customer_name}
                rating={review.rating}
                serviceName={review.service_name}
                content={review.content}
                date={formatTime(review.created_at)}
                isApproved={review.is_approved}
                isPublic={review.is_public}
                imageUrls={review.image_urls}
                onTogglePublic={() => togglePublic(review)}
                onDelete={() => deleteReview(review.id)}
              />
            ))}
          </div>
        </div>
      </main>

      <MobileFooterNav />
    </div>
  )
}
