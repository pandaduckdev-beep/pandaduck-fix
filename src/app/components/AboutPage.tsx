import { Menu, Target, Award, Users, Heart } from "lucide-react";
import { Footer } from "@/app/components/Footer";
import { useState } from "react";
import { MenuDrawer } from "@/app/components/MenuDrawer";

interface AboutPageProps {
  onNavigate: (screen: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => onNavigate('home')}
            className="text-lg tracking-tight" 
            style={{ fontWeight: 600 }}
          >
            PandaDuck Pix
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
        onNavigate={onNavigate}
      />

      {/* Hero */}
      <section className="max-w-md mx-auto px-6 pt-12 pb-8">
        <h1 className="text-4xl mb-4" style={{ fontWeight: 700 }}>
          회사소개
        </h1>
        <p className="text-lg text-[#86868B]">
          게이머의 꿈을 현실로 만드는<br />
          프리미엄 커스터마이징 전문가
        </p>
      </section>

      {/* Brand Image */}
      <section className="max-w-md mx-auto px-6 pb-8">
        <img
          src="https://images.unsplash.com/photo-1556607173-eca49c3c4f47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMG1pbmltYWwlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc2ODkyNzE5NHww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="PandaDuck Pix Workshop"
          className="w-full h-64 object-cover rounded-[28px]"
        />
      </section>

      {/* Story */}
      <section className="max-w-md mx-auto px-6 pb-8">
        <div className="bg-[#F5F5F7] rounded-[28px] p-8 space-y-4">
          <h2 className="text-2xl" style={{ fontWeight: 700 }}>
            우리의 이야기
          </h2>
          <p className="text-sm text-[#86868B] leading-relaxed">
            PandaDuck Pix는 2021년, 게이밍을 사랑하는 엔지니어들이 모여 시작되었습니다. 
            우리는 단순히 컨트롤러를 수리하는 것을 넘어, 게이머들에게 최상의 경험을 선사하고자 합니다.
          </p>
          <p className="text-sm text-[#86868B] leading-relaxed">
            3년간 1만 개 이상의 컨트롤러를 커스터마이징하며 쌓은 노하우로, 
            이제는 프로게이머와 스트리머들이 신뢰하는 브랜드로 성장했습니다.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-md mx-auto px-6 pb-8">
        <h2 className="text-2xl mb-6" style={{ fontWeight: 700 }}>
          우리의 가치
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F5F5F7] rounded-[28px] p-6 space-y-3">
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

          <div className="bg-[#F5F5F7] rounded-[28px] p-6 space-y-3">
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

          <div className="bg-[#F5F5F7] rounded-[28px] p-6 space-y-3">
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

          <div className="bg-[#F5F5F7] rounded-[28px] p-6 space-y-3">
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

      {/* Stats */}
      <section className="max-w-md mx-auto px-6 pb-8">
        <div className="bg-[#000000] text-white rounded-[28px] p-8">
          <h2 className="text-2xl mb-6 text-center" style={{ fontWeight: 700 }}>
            숫자로 보는 PandaDuck Pix
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2" style={{ fontWeight: 700 }}>
                10,000+
              </div>
              <p className="text-sm text-[#86868B]">누적 작업</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2" style={{ fontWeight: 700 }}>
                5.0
              </div>
              <p className="text-sm text-[#86868B]">평균 평점</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2" style={{ fontWeight: 700 }}>
                99%
              </div>
              <p className="text-sm text-[#86868B]">재방문율</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-md mx-auto px-6 pb-12">
        <div className="bg-[#F5F5F7] rounded-[28px] p-8 text-center space-y-4">
          <h3 className="text-2xl" style={{ fontWeight: 700 }}>
            함께 시작해볼까요?
          </h3>
          <p className="text-[#86868B]">
            프리미엄 커스터마이징 서비스를<br />
            지금 바로 경험해보세요
          </p>
          <button
            onClick={() => onNavigate('service')}
            className="w-full bg-[#000000] text-white py-4 rounded-full transition-transform hover:scale-[0.98] active:scale-[0.96] mt-6"
            style={{ fontWeight: 600 }}
          >
            수리 신청하기
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
