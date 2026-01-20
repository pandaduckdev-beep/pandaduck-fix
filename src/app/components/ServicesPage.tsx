import { Menu, Zap, CircuitBoard, Plus, Battery, Wrench, Palette } from "lucide-react";
import { Footer } from "@/app/components/Footer";
import { useState } from "react";
import { MenuDrawer } from "@/app/components/MenuDrawer";

interface ServicesPageProps {
  onNavigate: (screen: string) => void;
}

const allServices = [
  {
    icon: <Zap className="w-6 h-6" />,
    name: "홀 이펙트 센서 업그레이드",
    description: "자석 기반 센서로 스틱 드리프트를 영구적으로 해결합니다.",
    price: "25,000원",
    features: ["영구 보증", "무드리프트 보장", "1일 작업"],
    options: [
      { name: "기본형", price: 0, description: "홀 이펙트 센서" },
      { name: "굴리킷 TMR", price: 15000, description: "Gulikit TMR 센서" },
      { name: "굴리킷 TMR 720", price: 25000, description: "텐션 조절이 가능한 TMR 센서" },
    ],
  },
  {
    icon: <CircuitBoard className="w-6 h-6" />,
    name: "클릭키 버튼 모듈",
    description: "eXtremeRate 프리미엄 촉감 스위치로 버튼 반응성을 극대화합니다.",
    price: "25,000원",
    features: ["프리미엄 스위치", "내구성 향상", "클릭감 개선"],
    options: [
      { name: "LIGHT", price: 0, description: "eXtremeRate 스탠다드" },
      { name: "STRONG", price: 0, description: "eXtremeRate 스탠다드" },
    ],
  },
  {
    icon: <Plus className="w-6 h-6" />,
    name: "백버튼 모드",
    description: "프로게이머급 후면 패들을 추가하여 경쟁력을 높입니다.",
    price: "40,000원",
    features: ["2~4개 패들", "커스텀 매핑", "프로급 성능"],
    options: [
      { name: "RISE3", price: 0, description: "eXtremeRate 2버튼" },
      { name: "RISE4", price: 10000, description: "eXtremeRate 4버튼" },
    ],
  },
  {
    icon: <Battery className="w-6 h-6" />,
    name: "고용량 배터리",
    description: "고용량 배터리로 최대 3배 더 긴 플레이타임을 제공합니다.",
    price: "15,000원",
    features: ["고용량", "3배 수명", "안전 인증"],
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    name: "헤어 트리거",
    description: "트리거 반응거리를 단축하여 FPS 게임에서 우위를 점합니다.",
    price: "25,000원",
    features: ["즉각 반응", "조절 가능", "FPS 최적화"],
  },
  {
    icon: <Palette className="w-6 h-6" />,
    name: "커스텀 쉘 교체",
    description: "다양한 색상과 디자인의 프리미엄 쉘로 개성을 표현하세요.",
    price: "30,000원~",
    features: ["다양한 색상", "프리미엄 재질", "독특한 디자인"],
  },
];

export function ServicesPage({ onNavigate }: ServicesPageProps) {
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
          제공 서비스
        </h1>
        <p className="text-lg text-[#86868B]">
          프로게이머와 열정적인 게이머를 위한<br />
          최고 품질의 커스터마이징 서비스
        </p>
      </section>

      {/* Services Grid */}
      <section className="max-w-md mx-auto px-6 pb-8">
        <div className="space-y-4">
          {allServices.map((service, index) => (
            <div 
              key={index}
              className="bg-[#F5F5F7] rounded-[28px] p-6 space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  {service.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>
                    {service.name}
                  </h3>
                  <p className="text-sm text-[#86868B] mb-3">
                    {service.description}
                  </p>
                  <div className="text-xl mb-3" style={{ fontWeight: 700 }}>
                    {service.price}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {service.features.map((feature, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 bg-white rounded-full text-xs"
                        style={{ fontWeight: 600 }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  {/* Options */}
                  {service.options && (
                    <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.1)]">
                      <p className="text-sm mb-3" style={{ fontWeight: 600 }}>
                        선택 옵션
                      </p>
                      <div className="space-y-2">
                        {service.options.map((option, i) => (
                          <div 
                            key={i}
                            className="bg-white rounded-[16px] p-3 flex items-center justify-between"
                          >
                            <div>
                              <div className="text-sm" style={{ fontWeight: 600 }}>
                                {option.name}
                              </div>
                              <div className="text-xs text-[#86868B]">
                                {option.description}
                              </div>
                            </div>
                            <div className="text-sm" style={{ fontWeight: 700 }}>
                              {option.price === 0 ? '기본' : `+${option.price.toLocaleString()}원`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-md mx-auto px-6 pb-12">
        <div className="bg-[#000000] text-white rounded-[28px] p-8 text-center space-y-4">
          <h3 className="text-2xl" style={{ fontWeight: 700 }}>
            지금 바로 시작하세요
          </h3>
          <p className="text-[#86868B]">
            전문가의 손길로 완벽하게 커스터마이징된<br />
            나만의 컨트롤러를 만나보세요
          </p>
          <button
            onClick={() => onNavigate('service')}
            className="w-full bg-white text-black py-4 rounded-full transition-transform hover:scale-[0.98] active:scale-[0.96] mt-6"
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