import { MobileHeader } from '../components/MobileHeader'
import { MobileFooterNav } from '../components/MobileFooterNav'
import { ReviewCard } from '../components/ReviewCard'
import { useEffect, useState } from 'react'
import { Review } from '@/types/database'
import { supabase } from '@/lib/supabase'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setReviews(data)
  }

  const handleTogglePublic = async (review: Review) => {
    const { error } = await supabase
      .from('reviews')
      .update({ is_public: !review.is_public })
      .eq('id', review.id)

    if (!error) {
      setReviews(reviews.map((r) => (r.id === review.id ? { ...r, is_public: !r.is_public } : r)))
    }
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm('이 리뷰를 삭제하시겠습니까?')) return

    const { error } = await supabase.from('reviews').delete().eq('id', reviewId)

    if (!error) {
      setReviews(reviews.filter((r) => r.id !== reviewId))
    }
  }

  const filteredReviews = searchQuery
    ? reviews.filter(
        (review) =>
          review.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.service_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : reviews

  const formatDate = (date: string) => {
    const d = new Date(date)
    return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen pb-24">
      <MobileHeader title="리뷰 관리" subtitle={`총 ${reviews.length}건`} />

      <main className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="고객명, 서비스명, 리뷰 내용 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 py-2 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
            전체 상태
            <span className="material-icons-outlined text-lg">expand_more</span>
          </button>
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium flex items-center justify-center">
            <span className="material-icons-outlined text-lg">tune</span>
          </button>
        </div>

        {/* Review List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              customerName={review.customer_name}
              rating={review.rating}
              serviceName={review.service_name}
              content={review.content}
              date={formatDate(review.created_at)}
              isApproved={review.is_approved}
              isPublic={review.is_public}
              onTogglePublic={() => handleTogglePublic(review)}
              onDelete={() => handleDelete(review.id)}
            />
          ))}
        </div>
      </main>

      <MobileFooterNav />
    </div>
  )
}
