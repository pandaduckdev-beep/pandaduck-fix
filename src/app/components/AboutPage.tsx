import { Menu, Target, Award, Users, Heart } from "lucide-react";
import { Footer } from "@/app/components/Footer";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MenuDrawer } from "@/app/components/MenuDrawer";
import { useSlideUp } from "@/hooks/useSlideUp";

export function AboutPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { setRef } = useSlideUp(10);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* Hero */}
      <section className="max-w-md mx-auto px-6 pt-12 pb-8">
        <div ref={setRef(0)} className="slide-up" style={{ transitionDelay: '0s' }}>
          <h1 className="text-4xl mb-4" style={{ fontWeight: 700 }}>
            회사소개
          </h1>
          <p className="text-lg text-[#86868B]">
            게이머의 꿈을 현실로 만드는<br />
            프리미엄 커스터마이징 전문가
          </p>
        </div>
      </section>

      {/* Brand Image */}
      <section className="max-w-md mx-auto px-6 pb-8">
        <div ref={setRef(1)} className="slide-up" style={{ transitionDelay: '0.1s' }}>
          <img
            src="https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt="PandaDuck Fix Workshop"
            className="w-full h-64 object-cover rounded-[28px]"
          />
        </div>
      </section>

      {/* Story */}
      <section className="max-w-md mx-auto px-6 pb-8">
        <div ref={setRef(2)} className="slide-up bg-[#F5F5F7] rounded-[28px] p-8 space-y-4" style={{ transitionDelay: '0.2s' }}>
          <h2 className="text-2xl" style={{ fontWeight: 700 }}>
            우리의 이야기
          </h2>
          <p className="text-sm text-[#86868B] leading-relaxed">
            PandaDuck Fix는 게이밍 컨트롤러 수리와 커스터마이징에 대한 열정으로 시작되었습니다.
            비록 이제 막 첫걸음을 내딛었지만, 우리는 모든 작업에 최선을 다하고 있습니다.
          </p>
          <p className="text-sm text-[#86868B] leading-relaxed">
            단순한 수리를 넘어, 게이머 여러분께 최고의 게이밍 경험을 선사하는 것이 우리의 목표입니다.
            한 대 한 대 정성을 다해 작업하며, 고객 만족을 최우선으로 생각합니다.
          </p>
          <p className="text-sm text-[#86868B] leading-relaxed">
            함께 성장해나갈 여러분의 소중한 지지와 신뢰를 부탁드립니다.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-md mx-auto px-6 pb-8">
        <h2 className="text-2xl mb-6" style={{ fontWeight: 700 }}>
          우리의 가치
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div ref={setRef(3)} className="slide-up bg-[#F5F5F7] rounded-[28px] p-6 space-y-3" style={{ transitionDelay: '0s' }}>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg" style={{ fontWeight: 600 }}>
              완벽함 추구
            </h3>
            <p className="text-sm text-[#86868B]">
              모든 작업에 장인정신을 담습니다
            </p>
          </div>

          <div ref={setRef(4)} className="slide-up bg-[#F5F5F7] rounded-[28px] p-6 space-y-3" style={{ transitionDelay: '0.1s' }}>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg" style={{ fontWeight: 600 }}>
              품질 보증
            </h3>
            <p className="text-sm text-[#86868B]">
              프리미엄 부품만 사용합니다
            </p>
          </div>

          <div ref={setRef(5)} className="slide-up bg-[#F5F5F7] rounded-[28px] p-6 space-y-3" style={{ transitionDelay: '0.2s' }}>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg" style={{ fontWeight: 600 }}>
              고객 중심
            </h3>
            <p className="text-sm text-[#86868B]">
              고객의 만족이 최우선입니다
            </p>
          </div>

          <div ref={setRef(6)} className="slide-up bg-[#F5F5F7] rounded-[28px] p-6 space-y-3" style={{ transitionDelay: '0.3s' }}>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-lg" style={{ fontWeight: 600 }}>
              열정
            </h3>
            <p className="text-sm text-[#86868B]">
              게이밍을 진심으로 사랑합니다
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-md mx-auto px-6 pb-8">
        <div ref={setRef(7)} className="slide-up bg-[#000000] text-white rounded-[28px] p-8" style={{ transitionDelay: '0s' }}>
          <h2 className="text-2xl mb-6 text-center" style={{ fontWeight: 700 }}>
            우리의 약속
          </h2>
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-3" style={{ fontWeight: 700 }}>
                100%
              </div>
              <p className="text-sm text-[#86868B]">
                모든 작업에<br />최선을 다하는 마음
              </p>
            </div>
            <div className="h-px bg-[rgba(255,255,255,0.1)]"></div>
            <p className="text-center text-sm text-[#86868B] leading-relaxed">
              여러분의 소중한 컨트롤러를<br />
              최고의 상태로 되돌려드리기 위해<br />
              항상 노력하겠습니다
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-md mx-auto px-6 pb-12">
        <div ref={setRef(8)} className="slide-up" style={{ transitionDelay: '0s' }}>
          <div className="bg-[#F5F5F7] rounded-[28px] p-8 text-center space-y-4">
            <h3 className="text-2xl" style={{ fontWeight: 700 }}>
              함께 시작해볼까요?
            </h3>
            <p className="text-[#86868B]">
              정성스러운 수리와 커스터마이징으로<br />
              새로운 게이밍 경험을 만나보세요
            </p>
            <button
              onClick={() => navigate('/controllers')}
              className="w-full bg-[#000000] text-white py-4 rounded-full transition-transform hover:scale-[0.98] active:scale-[0.96] mt-6"
              style={{ fontWeight: 600 }}
            >
              수리 신청하기
            </button>
          </div>
        </div>
      </section>

      <div ref={setRef(9)} className="slide-up" style={{ transitionDelay: '0s' }}>
        <Footer />
      </div>
    </div>
  );
}
