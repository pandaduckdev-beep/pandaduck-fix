import { Menu, Zap, CircuitBoard, Plus, Battery, Wrench, Palette, HelpCircle } from "lucide-react";
import { Footer } from "@/app/components/Footer";
import { useState } from "react";
import { MenuDrawer } from "@/app/components/MenuDrawer";
import { ServiceDetailModal } from "@/app/components/ServiceDetailModal";

interface ServicesPageProps {
  onNavigate: (screen: string) => void;
}

const serviceDetails = [
  {
    id: "hall-effect",
    icon: <Zap className="w-6 h-6" />,
    title: "홀 이펙트 센서 업그레이드",
    subtitle: "스틱 드리프트 영구 해결",
    description: "PS5 컨트롤러의 가장 흔한 문제인 스틱 드리프트를 영구적으로 해결합니다. 기존 전통적인 포텐셔미터 방식 대신, 자석 기반의 홀 이펙트 센서를 사용하여 물리적 마모가 없어 드리프트 현상이 발생하지 않습니다. ALPS, Gulikit, TMR 등 다양한 등급의 센서 옵션을 제공합니다.",
    features: [
      "영구적인 드리프트 방지 - 자석 센서로 물리적 마모 없음",
      "정밀한 조작감 - 원래보다 더 정확한 입력",
      "다양한 센서 옵션 - ALPS부터 TMR까지",
      "빠른 작업 완료 - 1일 내 작업 완료",
      "평생 보증 - 드리프트 재발 시 무상 재작업"
    ],
    process: [
      "컨트롤러 정밀 분해 및 상태 점검",
      "기존 아날로그 스틱 모듈 제거",
      "홀 이펙트 센서 모듈 장착 및 캘리브레이션",
      "품질 테스트 및 최종 점검",
      "조립 완료 및 동작 확인"
    ],
    price: "89,000원~",
    duration: "1일",
    warranty: "평생",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1lJTIwY29udHJvbGxlciUyMHN0aWNrfGVufDF8fHx8MTc2ODkyNzE5NHww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "clicky-buttons",
    icon: <CircuitBoard className="w-6 h-6" />,
    title: "클릭키 버튼 모듈",
    subtitle: "eXtremeRate 프리미엄 스위치",
    description: "eXtremeRate의 프리미엄 촉감 스위치를 장착하여 버튼의 반응성과 내구성을 극대화합니다. 기계식 키보드와 같은 명확한 클릭감으로 입력의 정확성이 향상되며, 특히 격투 게임이나 리듬 게임에서 뛰어난 성능을 발휘합니다.",
    features: [
      "명확한 클릭감 - 기계식 스위치 같은 촉감",
      "빠른 반응속도 - 0.1ms 입력 지연 감소",
      "향상된 내구성 - 500만회 이상 클릭 보장",
      "정확한 입력 - 우발적 입력 방지",
      "프로게이머 선호 - 격투게임 필수 모드"
    ],
    process: [
      "컨트롤러 분해 및 버튼 모듈 접근",
      "기존 러버돔 방식 버튼 제거",
      "eXtremeRate 클릭키 모듈 정밀 장착",
      "버튼 반응성 테스트 및 조정",
      "최종 조립 및 품질 확인"
    ],
    price: "65,000원~",
    duration: "1일",
    warranty: "1년",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBidXR0b25zfGVufDF8fHx8MTc2ODkyNzE5NHww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "back-buttons",
    icon: <Plus className="w-6 h-6" />,
    title: "백버튼 모드",
    subtitle: "프로급 후면 패들 장착",
    description: "컨트롤러 뒷면에 4개의 프로그래밍 가능한 패들 버튼을 추가하여 경쟁력을 높입니다. 엄지를 스틱에서 떼지 않고도 추가 기능을 실행할 수 있어, FPS와 배틀로얄 장르에서 특히 유용합니다. 프로게이머들이 가장 선호하는 커스터마이징입니다.",
    features: [
      "4개의 프로그래밍 가능한 패들 버튼",
      "커스텀 버튼 매핑 - 원하는 기능 자유 설정",
      "에르고노믹 디자인 - 손에 편안한 위치",
      "프로게이머 필수템 - 경쟁 게임 우위",
      "빌드 인 방식 - 외부 부착이 아닌 내장형"
    ],
    process: [
      "컨트롤러 완전 분해",
      "백버튼 모듈 장착을 위한 쉘 가공",
      "회로 연결 및 패들 버튼 장착",
      "버튼 매핑 프로그래밍",
      "작동 테스트 및 최종 조립"
    ],
    price: "95,000원",
    duration: "2일",
    warranty: "1년",
    image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm8lMjBnYW1pbmclMjBjb250cm9sbGVyfGVufDF8fHx8MTc2ODkyNzE5NHww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "battery",
    icon: <Battery className="w-6 h-6" />,
    title: "고용량 배터리",
    subtitle: "최대 3배 더 긴 플레이타임",
    description: "순정 배터리(1560mAh)를 고용량 3000mAh 또는 4000mAh 배터리로 교체하여 충전 없이 더 오래 게임을 즐길 수 있습니다. 안전 인증을 받은 프리미엄 배터리만 사용하며, 과충전/과방전 보호 회로가 내장되어 있습니다.",
    features: [
      "3배 긴 플레이타임 - 최대 30시간 사용",
      "안전 인증 배터리 - KC, CE 인증 완료",
      "과충전 보호 회로 내장",
      "순정과 동일한 크기 - 쉘 가공 불필요",
      "빠른 충전 지원 - USB-C 고속 충전"
    ],
    process: [
      "컨트롤러 분해 및 기존 배터리 제거",
      "새 고용량 배터리 연결",
      "충전 회로 점검 및 테스트",
      "배터리 셀 밸런싱",
      "조립 완료 및 충전 테스트"
    ],
    price: "35,000원~",
    duration: "1일",
    warranty: "6개월",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXR0ZXJ5JTIwY2hhcmdpbmd8ZW58MXx8fHwxNzY4OTI3MTk0fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "hair-trigger",
    icon: <Wrench className="w-6 h-6" />,
    title: "헤어 트리거",
    subtitle: "FPS 최적화 트리거",
    description: "트리거 버튼의 반응거리를 극단적으로 단축하여 FPS 게임에서 압도적인 우위를 점합니다. 조절 가능한 스톱퍼를 장착하여 트리거를 살짝만 당겨도 즉시 발사되도록 설정할 수 있습니다. 프로 FPS 게이머들의 필수 모드입니다.",
    features: [
      "즉각적인 반응 - 트리거 거리 최소화",
      "조절 가능 - 원하는 깊이로 설정",
      "FPS 게임 최적화 - 발사 속도 향상",
      "간편한 on/off - 스위치로 전환 가능",
      "내구성 우수 - 금속 스톱퍼 사용"
    ],
    process: [
      "컨트롤러 분해 및 트리거 모듈 접근",
      "헤어 트리거 스톱퍼 장착",
      "트리거 깊이 조절 및 테스트",
      "스위치 장착 (on/off 전환용)",
      "최종 조립 및 동작 확인"
    ],
    price: "45,000원",
    duration: "1일",
    warranty: "1년",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBzaG9vdGVyfGVufDF8fHx8MTc2ODkyNzE5NHww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "custom-shell",
    icon: <Palette className="w-6 h-6" />,
    title: "커스텀 쉘 교체",
    subtitle: "프리미엄 디자인 쉘",
    description: "다양한 색상과 디자인의 프리미엄 쉘로 나만의 개성을 표현하세요. 단색, 투명, 그라데이션, 카본 패턴 등 다양한 옵션이 준비되어 있습니다. 모든 쉘은 고품질 ABS 소재를 사용하며, 정밀 가공으로 완벽한 조립감을 자랑합니다.",
    features: [
      "다양한 디자인 - 50가지 이상 색상/패턴",
      "프리미엄 재질 - 고품질 ABS 소재",
      "완벽한 핏 - 순정과 동일한 조립감",
      "독특한 스타일 - 세상에 하나뿐인 디자인",
      "내구성 보장 - 긁힘 방지 코팅"
    ],
    process: [
      "컨트롤러 완전 분해",
      "기존 쉘 제거 및 부품 이동",
      "새 커스텀 쉘에 부품 장착",
      "정밀 조립 및 핏 확인",
      "최종 검수 및 마감 처리"
    ],
    price: "55,000원~",
    duration: "1일",
    warranty: "6개월",
    image: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjBnYW1pbmclMjBjb250cm9sbGVyfGVufDF8fHx8MTc2ODkyNzE5NHww&ixlib=rb-4.1.0&q=80&w=1080"
  },
];

const allServices = [
  {
    id: "hall-effect",
    icon: <Zap className="w-6 h-6" />,
    name: "홀 이펙트 센서 업그레이드",
    description: "자석 기반 센서로 스틱 드리프트를 영구적으로 해결합니다.",
    price: "89,000원",
    features: ["영구 보증", "무드리프트 보장", "1일 작업"],
    options: [
      { name: "기본형", price: 0, description: "ALPS 홀 이펙트 센서" },
      { name: "프리미엄", price: 15000, description: "Gulikit 홀 이펙트 센서" },
      { name: "프로급", price: 30000, description: "TMR 센서 (최상급)" },
    ],
  },
  {
    id: "clicky-buttons",
    icon: <CircuitBoard className="w-6 h-6" />,
    name: "클릭키 버튼 모듈",
    description: "eXtremeRate 프리미엄 촉감 스위치로 버튼 반응성을 극대화합니다.",
    price: "65,000원",
    features: ["프리미엄 스위치", "내구성 향상", "클릭감 개선"],
    options: [
      { name: "기본형", price: 0, description: "eXtremeRate 스탠다드" },
      { name: "프리미엄", price: 10000, description: "eXtremeRate 프로" },
    ],
  },
  {
    id: "back-buttons",
    icon: <Plus className="w-6 h-6" />,
    name: "백버튼 모드",
    description: "프로게이머급 후면 패들을 추가하여 경쟁력을 높입니다.",
    price: "95,000원",
    features: ["4개 패들", "커스텀 매핑", "프로급 성능"],
  },
  {
    id: "battery",
    icon: <Battery className="w-6 h-6" />,
    name: "고용량 배터리",
    description: "3000mAh 배터리로 최대 3배 더 긴 플레이타임을 제공합니다.",
    price: "35,000원",
    features: ["3000mAh", "3배 수명", "안전 인증"],
    options: [
      { name: "3000mAh", price: 0, description: "기본 고용량" },
      { name: "4000mAh", price: 15000, description: "울트라 고용량" },
    ],
  },
  {
    id: "hair-trigger",
    icon: <Wrench className="w-6 h-6" />,
    name: "헤어 트리거",
    description: "트리거 반응거리를 단축하여 FPS 게임에서 우위를 점합니다.",
    price: "45,000원",
    features: ["즉각 반응", "조절 가능", "FPS 최적화"],
  },
  {
    id: "custom-shell",
    icon: <Palette className="w-6 h-6" />,
    name: "커스텀 쉘 교체",
    description: "다양한 색상과 디자인의 프리미엄 쉘로 개성을 표현하세요.",
    price: "55,000원~",
    features: ["다양한 색상", "프리미엄 재질", "독특한 디자인"],
    options: [
      { name: "단색", price: 0, description: "화이트, 블랙 등" },
      { name: "투명", price: 10000, description: "클리어 쉘" },
      { name: "그라데이션", price: 20000, description: "특수 패턴" },
    ],
  },
];

export function ServicesPage({ onNavigate }: ServicesPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<typeof serviceDetails[0] | null>(null);

  const handleInfoClick = (serviceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const service = serviceDetails.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service);
    }
  };

  const handleBookService = () => {
    setSelectedService(null);
    onNavigate('service');
  };

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
              <button
                onClick={(e) => handleInfoClick(service.id, e)}
                className="w-full bg-[#000000] text-white py-2 rounded-full transition-transform hover:scale-[0.98] active:scale-[0.96] mt-4"
                style={{ fontWeight: 600 }}
              >
                상세 정보
              </button>
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
      
      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={selectedService}
        isOpen={selectedService !== null}
        onClose={() => setSelectedService(null)}
        onBookService={handleBookService}
      />
    </div>
  );
}