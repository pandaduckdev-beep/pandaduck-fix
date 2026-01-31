import {
  Menu,
  Zap,
  CircuitBoard,
  Plus,
  Battery,
  Star,
  ArrowRight,
  Gamepad2,
  Package,
  Truck,
} from 'lucide-react'
import { Footer } from '@/app/components/Footer'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MenuDrawer } from '@/app/components/MenuDrawer'
import { useSlideUp } from '@/hooks/useSlideUp'
import { createClient } from '@supabase/supabase-js'

const services = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: '스틱 쏠림(드리프트) 해결',
    description: 'TMR 센서로 영구적 해결',
    features: [
      'TMR 센서 교체',
      '완벽한 0포인트 복원',
      '정밀한 캘리브레이션',
      '원활한 조작감 보장',
    ],
    path: '/services/list',
  },
  {
    icon: <CircuitBoard className="w-6 h-6" />,
    title: '클릭키 버튼 교체',
    description: 'eXtremeRate 프리미엄 스위치로 교체',
    features: ['만족스러운 키감', '빠른 입력 반응', '프로게이머 수준', '오래 지속하는 퀄리티'],
    path: '/services/list',
  },
  {
    icon: <Plus className="w-6 h-6" />,
    title: '백버튼 모드',
    description: '프로급 후면 패들 장착',
    features: ['프로게이머 수준', '맞춤형 조절', '편리한 할당'],
    path: '/services/list',
  },
  {
    icon: <Battery className="w-6 h-6" />,
    title: '배터리 업그레이드',
    description: '최대 4000mAh 배터리로 업그레이드',
    features: ['고효율 대용량 배터리', '안전한 교체 공정', '완벽한 호환성', '장시간 플레이 지원'],
    path: '/services/list',
  },
]

const processSteps = [
  {
    step: 1,
    icon: <Gamepad2 className="w-5 h-5" />,
    title: '컨트롤러 선택',
    description: '수리할 모델을 선택하세요',
  },
  {
    step: 2,
    icon: <Package className="w-5 h-5" />,
    title: '서비스 선택',
    description: '필요한 서비스를 골라주세요',
  },
  {
    step: 3,
    icon: <CircuitBoard className="w-5 h-5" />,
    title: '상태 입력',
    description: '현재 상태를 상세히 알려주세요',
  },
  {
    step: 4,
    icon: <Plus className="w-5 h-5" />,
    title: '의뢰 폼 제출',
    description: '고객 정보와 주소를 입력하세요',
  },
  {
    step: 5,
    icon: <Truck className="w-5 h-5" />,
    title: '컨트롤러 발송',
    description: '안전한 포장으로 발송해주세요',
  },
  {
    step: 6,
    icon: <Zap className="w-5 h-5" />,
    title: '수리 진행',
    description: '전문가가 정밀하게 수리합니다',
  },
  {
    step: 7,
    icon: <Truck className="w-5 h-5" />,
    title: '완료 및 배송',
    description: '빠른 배송으로 돌려드립니다',
  },
]

export function HomeScreen() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [reviews, setReviews] = useState<any[]>([
    {
      name: '김*민',
      rating: 5,
      content: '스틱 드리프트로 고생했는데 홀 이펙트로 바꿔주니 완벽해졌어요!',
      service: '스틱 드리프트 해결',
    },
    {
      name: '이*호',
      rating: 5,
      content: '클릭키 버튼 교체 후 훨씬 좋은 키감입니다. 빠르고 정확해요.',
      service: '클릭키 버튼',
    },
    {
      name: '박*현',
      rating: 5,
      content: '배터리 업그레이드 후 플레이타임이 3배로 늘었네요. 대박!',
      service: '배터리 업그레이드',
    },
  ])
  const { setRef } = useSlideUp(25)

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('customer_name, rating, content, service_name, repair_requests!inner(service_name)')
        .eq('rating', 5)
        .eq('is_approved', true)
        .eq('is_public', true)
        .order('created_at', { ascending: true })
        .limit(3)

      if (error) throw error

      console.log('Fetched reviews:', data) // 디버깅용

      // 이름 마스킹 처리
      const maskedReviews = (data || []).map((review: any) => ({
        name: review.customer_name
          ? review.customer_name.charAt(0) + '*'.repeat(review.customer_name.length - 1)
          : '고객',
        rating: review.rating,
        content: review.content,
        service: review.service_name || review.repair_requests?.service_name || '수리 서비스',
      }))

      // 데이터가 있으면 교체
      if (maskedReviews.length > 0) {
        setReviews(maskedReviews)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      // 에러 시 기본 리뷰 유지
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-lg tracking-tight" style={{ fontWeight: 600 }}>
            PandaDuck Fix
          </div>
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

      {/* Hero Section */}
      <section className="max-w-md mx-auto px-6 pt-12 pb-16">
        <div className="text-center space-y-6">
          <div ref={setRef(0)} className="slide-up" style={{ transitionDelay: '0s' }}>
            <h1 className="text-5xl tracking-tight leading-[1.1]" style={{ fontWeight: 700 }}>
              완벽함,
              <br />그 이상으로
            </h1>
          </div>
          <div ref={setRef(1)} className="slide-up" style={{ transitionDelay: '0.1s' }}>
            <p className="text-lg text-[#86868B] max-w-xs mx-auto" style={{ fontWeight: 400 }}>
              게이머를 위한 전문 컨트롤러 수리,
            </p>
            <p className="text-lg text-[#86868B] max-w-xs mx-auto" style={{ fontWeight: 400 }}>
              컨트롤러 커스터마이징
            </p>
          </div>
          <div ref={setRef(2)} className="slide-up pt-4" style={{ transitionDelay: '0.2s' }}>
            <img
              src="/images/dualsense-closeup.jpg"
              alt="DualSense Controller"
              className="w-full h-64 object-cover rounded-[28px]"
            />
          </div>
          <div ref={setRef(3)} className="slide-up" style={{ transitionDelay: '0.3s' }}>
            <button
              onClick={() => navigate('/controllers')}
              className="w-full bg-[#000000] text-white py-4 rounded-full transition-transform hover:scale-[0.98] active:scale-[0.96]"
              style={{ fontWeight: 600 }}
            >
              수리 시작하기
            </button>
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="max-w-md mx-auto px-6 pb-20">
        <div ref={setRef(4)} className="slide-up mb-6" style={{ transitionDelay: '0s' }}>
          <h2 className="text-3xl mb-2" style={{ fontWeight: 700 }}>
            제공 서비스
          </h2>
          <p className="text-lg text-[#86868B]">게이머를 위한 최고 품질 서비스</p>
        </div>
        <div className="space-y-4">
          {services.map((service, index) => (
            <div
              key={index}
              ref={setRef(5 + index)}
              className="slide-up bg-[#F5F5F7] rounded-[28px] p-6"
              style={{ transitionDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  {service.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl mb-1" style={{ fontWeight: 600 }}>
                    {service.title}
                  </h3>
                  <p className="text-sm text-[#86868B] mb-3">{service.description}</p>
                  <ul className="space-y-1.5">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#000000] mt-1.5 flex-shrink-0" />
                        <span className="text-[#86868B]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div ref={setRef(9)} className="slide-up mt-6" style={{ transitionDelay: '0s' }}>
          <button
            onClick={() => navigate('/services/list')}
            className="w-full bg-[#000000] text-white py-3 rounded-full transition-transform hover:scale-[0.98] active:scale-[0.96] flex items-center justify-center gap-2"
            style={{ fontWeight: 600 }}
          >
            자세히 보기
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Process Section */}
      <section className="max-w-md mx-auto px-6 pb-20">
        <div ref={setRef(10)} className="slide-up mb-6" style={{ transitionDelay: '0s' }}>
          <h2 className="text-3xl mb-2" style={{ fontWeight: 700 }}>
            수리 과정
          </h2>
          <p className="text-lg text-[#86868B]">간단한 7단계로 완벽한 수리</p>
        </div>
        <div className="space-y-4">
          {processSteps.map((step, index) => (
            <div
              key={index}
              ref={setRef(11 + index)}
              className="slide-up bg-white border border-[rgba(0,0,0,0.05)] rounded-[20px] p-5 flex items-start gap-4"
              style={{ transitionDelay: `${index * 0.05}s` }}
            >
              <div className="w-10 h-10 rounded-full bg-[#000000] text-white flex items-center justify-center flex-shrink-0">
                {step.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-[#86868B]">STEP {step.step}</span>
                </div>
                <h3 className="text-base mb-1" style={{ fontWeight: 600 }}>
                  {step.title}
                </h3>
                <p className="text-sm text-[#86868B]">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="max-w-md mx-auto px-6 pb-20 bg-white">
        <div ref={setRef(18)} className="slide-up mb-6" style={{ transitionDelay: '0s' }}>
          <h2 className="text-3xl mb-2" style={{ fontWeight: 700 }}>
            고객 후기
          </h2>
          <p className="text-lg text-[#86868B]">실제 고객의 솔직한 리뷰</p>
        </div>
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div
              key={index}
              ref={setRef(19 + index)}
              className="slide-up bg-[#F5F5F7] rounded-[28px] p-6"
              style={{ transitionDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#FFB800] text-[#FFB800]" />
                    ))}
                  </div>
                  <div className="text-sm text-[#86868B]">{review.service}</div>
                </div>
                <div className="text-sm" style={{ fontWeight: 600 }}>
                  {review.name}
                </div>
              </div>
              <p className="text-sm leading-relaxed">{review.content}</p>
            </div>
          ))}
        </div>
        <div ref={setRef(22)} className="slide-up mt-6" style={{ transitionDelay: '0s' }}>
          <button
            onClick={() => navigate('/reviews')}
            className="w-full bg-[#000000] text-white py-3 rounded-full transition-transform hover:scale-[0.98] active:scale-[0.96]"
            style={{ fontWeight: 600 }}
          >
            더 많은 리뷰 보기
          </button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-md mx-auto px-6 pb-20">
        <div
          ref={setRef(23)}
          className="slide-up bg-[#000000] text-white rounded-[32px] p-8"
          style={{ transitionDelay: '0s' }}
        >
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-4xl mb-3" style={{ fontWeight: 700 }}>
                지금 바로 시작하세요
              </h2>
              <p className="text-[#86868B] text-lg">
                전문가의 손길로 완벽하게 커스터마이징된
                <br />
                나만의 컨트롤러를 만나보세요
              </p>
            </div>
            <button
              onClick={() => navigate('/controllers')}
              className="w-full bg-white text-black py-4 rounded-full transition-transform hover:scale-[0.98] active:scale-[0.96]"
              style={{ fontWeight: 600 }}
            >
              수리 신청하기
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div ref={setRef(24)} className="slide-up" style={{ transitionDelay: '0s' }}>
        <Footer />
      </div>
    </div>
  )
}
