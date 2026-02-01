import { MobileHeader } from '../components/MobileHeader'
import { MobileFooterNav } from '../components/MobileFooterNav'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Star, Calendar, User, Package, MessageSquare, CheckCircle, X, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from '@/hooks/useToast.tsx'

interface Review {
  id: string
  customer_name: string
  rating: number
  content: string
  service_name: string
  created_at: string
  is_public: boolean
  image_urls?: string[]
  repair_request_id?: string
}

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { success, error } = useToast()

  const handleBack = () => {
    navigate('/admin-mobile/reviews')
  }

  const [review, setReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)

  useEffect(() => {
    if (id) {
      loadReviewDetail()
    }
  }, [id])

  const loadReviewDetail = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setReview(data)
    } catch (error) {
      console.error('Failed to load review detail:', error)
      error('로드 실패', '리뷰 상세 정보를 불러오는데 실패했습니다.')
      navigate('/admin-mobile/reviews')
    } finally {
      setLoading(false)
    }
  }

  const togglePublic = async () => {
    if (!review) return

    try {
      setUpdating(true)

      const { error } = await supabase
        .from('reviews')
        .update({ is_public: !review.is_public })
        .eq('id', review.id)

      if (error) throw error

      setReview({ ...review, is_public: !review.is_public })
      success('완료', review.is_public ? '비공개로 변경되었습니다.' : '공개로 변경되었습니다.')
    } catch (error) {
      console.error('Failed to toggle public:', error)
      error('실패', '변경에 실패했습니다.')
    } finally {
      setUpdating(false)
    }
  }

  const deleteReview = async () => {
    if (!review) return

    if (!confirm('정말 이 리뷰를 삭제하시겠습니까?')) {
      return
    }

    try {
      setUpdating(true)

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', review.id)

      if (error) throw error

      success('완료', '리뷰가 삭제되었습니다.')
      navigate('/admin-mobile/reviews')
    } catch (error) {
      console.error('Failed to delete review:', error)
      error('실패', '삭제에 실패했습니다.')
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}. ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  const renderStars = () => {
    if (!review) return null
    return Array.from({ length: 5 }).map((_, i) =>
      i < review.rating ? (
        <Star key={i} className="w-5 h-5 fill-[#FFCC00] text-[#FFCC00]" strokeWidth={0} />
      ) : (
        <Star key={i} className="w-5 h-5 text-[#E5E5EA] stroke-[#E5E5EA]" strokeWidth={2} />
      )
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F5F5F7] border-t-[#007AFF] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#86868B] text-sm" style={{ fontWeight: 600 }}>
            로딩 중...
          </p>
        </div>
      </div>
    )
  }

  if (!review) {
    return null
  }

  return (
    <div className="bg-[#F5F5F7] min-h-screen pb-20">
      <MobileHeader
        title="리뷰 상세"
        showBackButton={true}
        onBack={handleBack}
      />

      <main className="p-4 space-y-4">
        {/* 리뷰 정보 카드 */}
        <div className="bg-white rounded-2xl p-5 space-y-4">
          {/* 고객 정보 & 평점 */}
          <div className="pb-4 border-b border-[rgba(0,0,0,0.06)]">
            <h2 className="text-lg text-[#1D1D1F] mb-2" style={{ fontWeight: 700 }}>
              {review.customer_name}
            </h2>
            <div className="flex items-center gap-0.5 mb-1">{renderStars()}</div>
            <div className="flex items-center gap-1 text-xs text-[#86868B]" style={{ fontWeight: 500 }}>
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(review.created_at)}
            </div>
          </div>

          {/* 서비스 정보 */}
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-[#86868B] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-[#86868B] mb-1">서비스명</p>
              <p className="text-sm text-[#1D1D1F]" style={{ fontWeight: 600 }}>
                {review.service_name}
              </p>
            </div>
          </div>

          {/* 리뷰 내용 */}
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-[#86868B] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-[#86868B] mb-2">리뷰 내용</p>
              <p className="text-sm text-[#1D1D1F] leading-relaxed whitespace-pre-wrap" style={{ fontWeight: 500 }}>
                {review.content}
              </p>
            </div>
          </div>

          {/* 첨부 이미지 */}
          {review.image_urls && review.image_urls.length > 0 && (
            <div className="pt-4 border-t border-[rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-[#86868B]" />
                <p className="text-xs text-[#86868B]" style={{ fontWeight: 600 }}>
                  첨부 이미지 ({review.image_urls.length}장)
                </p>
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {review.image_urls.map((imageUrl, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentImageIndex(index)
                      setShowImageModal(true)
                    }}
                    className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 border-transparent hover:border-[#007AFF] transition-all btn-press"
                  >
                    <img
                      src={imageUrl}
                      alt={`리뷰 이미지 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 상태 관리 */}
        <div className="bg-white rounded-2xl p-5 space-y-3">
          <h3 className="text-base text-[#1D1D1F]" style={{ fontWeight: 700 }}>
            상태 관리
          </h3>

          {/* 공개 여부 토글 */}
          <div className="flex items-center justify-between py-3 border-b border-[rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3">
              {review.is_public ? (
                <Eye className="w-5 h-5 text-[#007AFF]" />
              ) : (
                <EyeOff className="w-5 h-5 text-[#86868B]" />
              )}
              <div>
                <p className="text-sm text-[#1D1D1F]" style={{ fontWeight: 600 }}>
                  공개 여부
                </p>
                <p className="text-xs text-[#86868B]">
                  {review.is_public ? '웹사이트에 표시' : '비공개'}
                </p>
              </div>
            </div>
            <button
              onClick={togglePublic}
              disabled={updating}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                review.is_public
                  ? 'bg-[#007AFF] text-white'
                  : 'bg-[#F5F5F7] text-[#1D1D1F]'
              } ${updating ? 'opacity-70' : ''}`}
            >
              {updating ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>변경 중...</span>
                </>
              ) : (
                <span>{review.is_public ? '공개중' : '비공개'}</span>
              )}
            </button>
          </div>

          {/* 승인 여부 토글 */}
        </div>

        {/* 삭제 버튼 */}
        <button
          onClick={deleteReview}
          disabled={updating}
          className="w-full py-4 bg-[#FF3B30] text-white rounded-2xl transition-all active:scale-98 flex items-center justify-center gap-2"
          style={{ fontWeight: 600 }}
        >
          <Trash2 className="w-5 h-5" />
          리뷰 삭제
        </button>
      </main>

      {/* 이미지 모달 (슬라이드) */}
      {showImageModal && review.image_urls && review.image_urls.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between p-4 safe-area-top">
            <p className="text-sm text-white" style={{ fontWeight: 600 }}>
              {currentImageIndex + 1} / {review.image_urls.length}
            </p>
            <button
              onClick={() => setShowImageModal(false)}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-ios btn-press"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 이미지 영역 */}
          <div className="flex-1 flex items-center justify-center px-4">
            <img
              src={review.image_urls[currentImageIndex]}
              alt={`리뷰 이미지 ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* 네비게이션 버튼 */}
          <div className="flex items-center justify-between px-4 py-6">
            <button
              onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : review.image_urls!.length - 1))}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-ios btn-press"
              disabled={review.image_urls.length <= 1}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => setCurrentImageIndex((prev) => (prev < review.image_urls!.length - 1 ? prev + 1 : 0))}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-ios btn-press"
              disabled={review.image_urls.length <= 1}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}

      <MobileFooterNav />
    </div>
  )
}
