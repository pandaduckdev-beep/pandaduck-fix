import { Menu, Star, Loader2 } from 'lucide-react'
import { Footer } from '@/app/components/Footer'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MenuDrawer } from '@/app/components/MenuDrawer'
import { supabase } from '@/lib/supabase'

export function ReviewsPage() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)

  // 리뷰 데이터 로드
  useEffect(() => {
    const loadReviews = async () => {
      try {
        // 승인되고 공개된 리뷰만 가져옴
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('is_approved', true)
          .eq('is_public', true)
          .order('created_at', { ascending: false })

        if (error) throw error
        setReviews(data || [])
        setTotalReviews(data?.length || 0)

        // 평균 평점 계산
        if (data && data.length > 0) {
          const sum = data.reduce((acc, review) => acc + review.rating, 0)
          const avg = sum / data.length
          setAverageRating(Math.round(avg * 10) / 10) // 소수점 한 자리까지
        }
      } catch (error) {
        console.error('Failed to load reviews:', error)
      } finally {
        setLoading(false)
      }
    }

    loadReviews()
  }, [])

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
        <div className="flex items-center gap-8 mt-8 p-6 bg-[#F5F5F7] rounded-[28px]">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Star className="w-6 h-6 fill-current" />
              <span className="text-3xl" style={{ fontWeight: 700 }}>
                {averageRating}
              </span>
            </div>
            <p className="text-sm text-[#86868B]">평균 평점</p>
          </div>
          <div>
            <div className="text-3xl mb-1" style={{ fontWeight: 700 }}>
              {totalReviews}
            </div>
            <p className="text-sm text-[#86868B]">누적 후기</p>
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
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-[#F5F5F7] rounded-[28px] p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontWeight: 600 }}>{review.customer_name}</span>
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

                <div className="px-3 py-2 bg-white rounded-[16px] inline-block">
                  <span className="text-sm" style={{ fontWeight: 600 }}>
                    {review.service_name}
                  </span>
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
