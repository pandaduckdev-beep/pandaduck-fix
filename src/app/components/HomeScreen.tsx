import { Menu, Zap, CircuitBoard, Plus, Battery } from "lucide-react";
import { Footer } from "@/app/components/Footer";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MenuDrawer } from "@/app/components/MenuDrawer";
import { ServiceDetailModal } from "@/app/components/ServiceDetailModal";
import { useSlideUp } from "@/hooks/useSlideUp";

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
    price: "25,000원",
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
    price: "25,000원",
    duration: "1일",
    warranty: "1년",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBidXR0b25zfGVufDF8fHx8MTc2ODkyNzE5NHww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "back-buttons",
    icon: <Plus className="w-6 h-6" />,
    title: "백버튼 모드",
    subtitle: "프로급 후면 패들 장착",
    description: "컨트롤러 뒷면에 2~4개의 프로그래밍 가능한 패들 버튼을 추가하여 경쟁력을 높입니다. 엄지를 스틱에서 떼지 않고도 추가 기능을 실행할 수 있어, FPS와 배틀로얄 장르에서 특히 유용합니다. 프로게이머들이 가장 선호하는 커스터마이징입니다.",
    features: [
      "2~4개의 프로그래밍 가능한 패들 버튼",
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
    price: "40,000원",
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
    price: "15,000원",
    duration: "1일",
    warranty: "6개월",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXR0ZXJ5JTIwY2hhcmdpbmd8ZW58MXx8fHwxNzY4OTI3MTk0fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
];

export function HomeScreen() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<typeof serviceDetails[0] | null>(null);
  const { setRef } = useSlideUp(9);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFeatureClick = (serviceId: string) => {
    const service = serviceDetails.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service);
    }
  };

  const handleBookService = () => {
    setSelectedService(null);
    navigate('/services');
  };

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
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* Hero Section */}
      <section className="max-w-md mx-auto px-6 pt-12 pb-16">
        <div className="text-center space-y-6">
          <div ref={setRef(0)} className="slide-up" style={{ transitionDelay: '0s' }}>
            <h1
              className="text-5xl tracking-tight leading-[1.1]"
              style={{ fontWeight: 700 }}
            >
              완벽함,<br />그 이상으로
            </h1>
          </div>
          <div ref={setRef(1)} className="slide-up" style={{ transitionDelay: '0.1s' }}>
            <p
              className="text-lg text-[#86868B] max-w-xs mx-auto"
              style={{ fontWeight: 400 }}
            >
              게이머를 위한 전문 컨트롤러 수리 및 커스터마이징
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

      {/* Bento Grid Features */}
      <section className="max-w-md mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 gap-3">
          {/* Stick Drift Fix */}
          <div
            ref={setRef(4)}
            onClick={() => handleFeatureClick('hall-effect')}
            className="slide-up bg-[#F5F5F7] rounded-[28px] p-6 space-y-4 cursor-pointer transition-transform hover:scale-[0.98] active:scale-[0.96]"
            style={{ transitionDelay: '0s' }}
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>
                스틱 드리프트 해결
              </h3>
              <p className="text-sm text-[#86868B]">
                홀 이펙트 센서로 영구적 해결
              </p>
            </div>
          </div>

          {/* Clicky Buttons */}
          <div
            ref={setRef(5)}
            onClick={() => handleFeatureClick('clicky-buttons')}
            className="slide-up bg-[#F5F5F7] rounded-[28px] p-6 space-y-4 cursor-pointer transition-transform hover:scale-[0.98] active:scale-[0.96]"
            style={{ transitionDelay: '0.1s' }}
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <CircuitBoard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>
                클릭키 버튼
              </h3>
              <p className="text-sm text-[#86868B]">
                eXtremeRate 프리미엄 스위치
              </p>
            </div>
          </div>

          {/* Back Button Mod */}
          <div
            ref={setRef(6)}
            onClick={() => handleFeatureClick('back-buttons')}
            className="slide-up bg-[#F5F5F7] rounded-[28px] p-6 space-y-4 cursor-pointer transition-transform hover:scale-[0.98] active:scale-[0.96]"
            style={{ transitionDelay: '0.2s' }}
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>
                백버튼 모드
              </h3>
              <p className="text-sm text-[#86868B]">
                프로급 후면 패들 장착
              </p>
            </div>
          </div>

          {/* High-Capacity Battery */}
          <div
            ref={setRef(7)}
            onClick={() => handleFeatureClick('battery')}
            className="slide-up bg-[#F5F5F7] rounded-[28px] p-6 space-y-4 cursor-pointer transition-transform hover:scale-[0.98] active:scale-[0.96]"
            style={{ transitionDelay: '0.3s' }}
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Battery className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>
                배터리 업그레이드
              </h3>
              <p className="text-sm text-[#86868B]">
                최대 3배 더 긴 플레이타임
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div ref={setRef(8)} className="slide-up" style={{ transitionDelay: '0s' }}>
        <Footer />
      </div>

      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={selectedService}
        options={[]}
        isOpen={selectedService !== null}
        onClose={() => setSelectedService(null)}
        onBookService={handleBookService}
      />
    </div>
  );
}