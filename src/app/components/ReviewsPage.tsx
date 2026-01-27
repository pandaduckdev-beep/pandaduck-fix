import { Menu, Star, Loader2 } from 'lucide-react'
import { Footer } from '@/app/components/Footer'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MenuDrawer } from '@/app/components/MenuDrawer'
import { supabase } from '@/lib/supabase'
import { maskName } from '@/lib/reviewUtils'

export function ReviewsPage() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  // 통계 데이터 로드 (평균 평점, 총 리뷰 수)
  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('rating')
          .eq('is_approved', true)
          .eq('is_public', true)

        if (error) throw error

        setTotalReviews(data?.length || 0)

        // 평균 평점 계산
        if (data && data.length > 0) {
          const sum = data.reduce((acc, review) => acc + review.rating, 0)
          const avg = sum / data.length
          setAverageRating(Math.round(avg * 10) / 10)
        }
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    }

    loadStats()
  }, [])

  // 리뷰 데이터 로드 (페이징)
  const loadReviews = async (pageNum: number) => {
    try {
      if (pageNum === 0) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const from = pageNum * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      if (data) {
        // Get services list for each review
        const reviewsWithServices = await Promise.all(
          data.map(async (review) => {
            let servicesList = review.service_name || ''

            if (review.repair_request_id) {
              const { data: requestServices } = await supabase
                .from('repair_request_services')
                .select('service_id')
                .eq('repair_request_id', review.repair_request_id)

              if (requestServices && requestServices.length > 0) {
                const serviceIds = requestServices.map((s) => s.service_id)
                const { data: services } = await supabase
                  .from('controller_services')
                  .select('name')
                  .in('id', serviceIds)

                if (services && services.length > 0) {
                  servicesList = services.map((s) => s.name).join(', ')
                }
              }
            }

            return {
              ...review,
              service_name: servicesList
            }
          })
        )

        if (pageNum === 0) {
          setReviews(reviewsWithServices)
        } else {
          setReviews(prev => [...prev, ...reviewsWithServices])
        }

        // 더 이상 데이터가 없으면 hasMore를 false로
        if (data.length < PAGE_SIZE) {
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error('Failed to load reviews:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // 초기 로드
  useEffect(() => {
    loadReviews(0)
  }, [])

  // 무한 스크롤 처리
  useEffect(() => {
    const handleScroll = () => {
      // 페이지 하단에 거의 도달했을 때
      const scrollPosition = window.innerHeight + window.scrollY
      const pageHeight = document.documentElement.scrollHeight

      if (scrollPosition >= pageHeight - 500 && !loadingMore && hasMore) {
        const nextPage = page + 1
        setPage(nextPage)
        loadReviews(nextPage)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [page, loadingMore, hasMore])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-lg tracking-tight"
            style={{ fontWeight: 600 }}
          >
            PandaDuck Fix
          </button>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Menu Drawer */}
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Hero */}
      <section className="max-w-md mx-auto px-6 pt-12 pb-8">
        <h1 className="text-4xl mb-4" style={{ fontWeight: 700 }}>
          고객 후기
        </h1>
        <p className="text-lg text-[#86868B]">
          PandaDuck Fix를 경험한 고객님들의
          <br />
          솔직한 후기를 확인해보세요
        </p>

        {/* Stats */}
        <div className="bg-[#F5F5F7] rounded-[28px] p-6 mt-8">
          <div className="grid grid-cols-2 divide-x divide-[rgba(0,0,0,0.1)]">
            <div className="text-center pr-4">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star className="w-6 h-6 fill-current" />
                <span className="text-3xl" style={{ fontWeight: 700 }}>
                  {averageRating}
                </span>
              </div>
              <p className="text-sm text-[#86868B]">평균 평점</p>
            </div>
            <div className="text-center pl-4">
              <div className="text-3xl mb-2" style={{ fontWeight: 700 }}>
                {totalReviews}
              </div>
              <p className="text-sm text-[#86868B]">누적 후기</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews List */}
      <section className="max-w-md mx-auto px-6 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-black" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-[#F5F5F7] rounded-[28px] p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ fontWeight: 600 }}>{maskName(review.customer_name)}</span>
                        <span className="text-xs text-[#86868B]">
                          {new Date(review.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current text-[#000000]" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {review.service_name.split(',').map((service: string, index: number) => (
                      <div key={index} className="px-3 py-1.5 bg-white rounded-full">
                        <span className="text-xs" style={{ fontWeight: 600 }}>
                          {service.trim()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm leading-relaxed">{review.content}</p>

                  {review.image_url && (
                    <img
                      src={review.image_url}
                      alt="Review"
                      className="w-full h-48 object-cover rounded-[20px]"
                    />
                  )}
                </div>
              ))}
            </div>

            {loadingMore && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-black" />
              </div>
            )}

            {!hasMore && reviews.length > 0 && (
              <div className="text-center py-8 text-[#86868B] text-sm">
                모든 리뷰를 불러왔습니다
              </div>
            )}
          </>
        )}

        {!loading && reviews.length === 0 && (
          <div className="text-center py-12 text-[#86868B]">등록된 리뷰가 없습니다.</div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-md mx-auto px-6 pb-12">
        <div className="bg-[#000000] text-white rounded-[28px] p-8 text-center space-y-4">
          <h3 className="text-2xl" style={{ fontWeight: 700 }}>
            당신의 후기를 기다립니다
          </h3>
          <p className="text-[#86868B]">
            PandaDuck Fix와 함께
            <br />
            최고의 게이밍 경험을 만들어보세요
          </p>
          <button
            onClick={() => navigate('/controllers')}
            className="w-full bg-white text-black py-4 rounded-full transition-transform hover:scale-[0.98] active:scale-[0.96] mt-6"
            style={{ fontWeight: 600 }}
          >
            수리 신청하기
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
