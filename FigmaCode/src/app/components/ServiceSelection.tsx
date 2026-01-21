import { ChevronLeft, Gamepad2, Zap, Settings, CircuitBoard, Plus, Battery, Wrench, Palette, HelpCircle } from "lucide-react";
import { useState } from "react";
import { ServiceDetailModal } from "@/app/components/ServiceDetailModal";

interface ServiceSelectionProps {
  onNavigate: (screen: string) => void;
}

interface ServiceOption {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  options?: ServiceOption[];
}

const services: Service[] = [
  {
    id: "hall-effect",
    name: "홀 이펙트 스틱 센서 업그레이드",
    description: "자석 센서로 스틱 드리프트 영구 해결",
    price: 89000,
    icon: <Zap className="w-6 h-6" />,
    options: [
      { id: "basic", name: "기본형", price: 0, description: "ALPS 센서" },
      { id: "premium", name: "프리미엄", price: 15000, description: "Gulikit 센서" },
      { id: "pro", name: "프로급", price: 30000, description: "TMR 센서" },
    ],
  },
  {
    id: "clicky-buttons",
    name: "클릭키 버튼 모듈",
    description: "eXtremeRate 프리미엄 촉감 스위치",
    price: 65000,
    icon: <CircuitBoard className="w-6 h-6" />,
    options: [
      { id: "standard", name: "기본형", price: 0, description: "스탠다드" },
      { id: "premium", name: "프리미엄", price: 10000, description: "프로" },
    ],
  },
  {
    id: "back-buttons",
    name: "백버튼 모드",
    description: "프로게이머급 후면 패들 장착",
    price: 95000,
    icon: <Plus className="w-6 h-6" />,
  },
  {
    id: "battery",
    name: "고용량 배터리",
    description: "최대 3배 더 긴 플레이타임",
    price: 35000,
    icon: <Battery className="w-6 h-6" />,
    options: [
      { id: "3000mah", name: "3000mAh", price: 0, description: "기본 고용량" },
      { id: "4000mah", name: "4000mAh", price: 15000, description: "울트라 고용량" },
    ],
  },
  {
    id: "hair-trigger",
    name: "헤어 트리거",
    description: "경쟁 게임을 위한 더 빠른 반응 속도",
    price: 45000,
    icon: <Settings className="w-6 h-6" />,
  },
  {
    id: "custom-shell",
    name: "커스텀 쉘 교체",
    description: "프리미엄 쉘로 개성 표현",
    price: 55000,
    icon: <Palette className="w-6 h-6" />,
    options: [
      { id: "solid", name: "단색", price: 0, description: "화이트, 블랙 등" },
      { id: "clear", name: "투명", price: 10000, description: "클리어 쉘" },
      { id: "gradient", name: "그라데이션", price: 20000, description: "특수 패턴" },
    ],
  },
];

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
      "조립 완료 �� 충전 테스트"
    ],
    price: "35,000원~",
    duration: "1일",
    warranty: "6개월",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXR0ZXJ5JTIwY2hhcmdpbmd8ZW58MXx8fHwxNzY4OTI3MTk0fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "hair-trigger",
    icon: <Settings className="w-6 h-6" />,
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

export function ServiceSelection({ onNavigate }: ServiceSelectionProps) {
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedServiceInfo, setSelectedServiceInfo] = useState<typeof serviceDetails[0] | null>(null);

  const handleInfoClick = (serviceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const service = serviceDetails.find(s => s.id === serviceId);
    if (service) {
      setSelectedServiceInfo(service);
    }
  };

  const handleBookService = () => {
    setSelectedServiceInfo(null);
  };

  const toggleService = (serviceId: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
      // Remove selected option when deselecting service
      const newOptions = { ...selectedOptions };
      delete newOptions[serviceId];
      setSelectedOptions(newOptions);
    } else {
      newSelected.add(serviceId);
      // Set default option (first one) if service has options
      const service = services.find(s => s.id === serviceId);
      if (service?.options && service.options.length > 0) {
        setSelectedOptions({
          ...selectedOptions,
          [serviceId]: service.options[0].id
        });
      }
    }
    setSelectedServices(newSelected);
  };

  const selectOption = (serviceId: string, optionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOptions({
      ...selectedOptions,
      [serviceId]: optionId
    });
  };

  const totalPrice = services
    .filter(service => selectedServices.has(service.id))
    .reduce((sum, service) => {
      let price = service.price;
      // Add option price if selected
      if (service.options && selectedOptions[service.id]) {
        const option = service.options.find(opt => opt.id === selectedOptions[service.id]);
        if (option) {
          price += option.price;
        }
      }
      return sum + price;
    }, 0);

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => onNavigate('home')}
            className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors -ml-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-lg tracking-tight" style={{ fontWeight: 600 }}>
            서비스 선택
          </div>
          <div className="w-10"></div>
        </div>
      </nav>

      {/* Progress Indicator */}
      <div className="max-w-md mx-auto px-6 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center text-sm" style={{ fontWeight: 600 }}>
              1
            </div>
            <span className="text-sm" style={{ fontWeight: 600 }}>모델</span>
          </div>
          <div className="flex-1 h-0.5 bg-[#F5F5F7] mx-3"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center text-sm" style={{ fontWeight: 600 }}>
              2
            </div>
            <span className="text-sm" style={{ fontWeight: 600 }}>서비스</span>
          </div>
          <div className="flex-1 h-0.5 bg-[#F5F5F7] mx-3"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F5F5F7] text-[#86868B] flex items-center justify-center text-sm" style={{ fontWeight: 600 }}>
              3
            </div>
            <span className="text-sm text-[#86868B]" style={{ fontWeight: 600 }}>배송</span>
          </div>
        </div>
      </div>

      {/* Service Cards */}
      <div className="max-w-md mx-auto px-6 space-y-3">
        {services.map((service) => (
          <div
            key={service.id}
            className={`w-full p-6 rounded-[28px] border-2 transition-all ${
              selectedServices.has(service.id)
                ? 'border-[#000000] bg-[#F5F5F7]'
                : 'border-[rgba(0,0,0,0.1)] bg-white'
            }`}
          >
            <button
              onClick={() => toggleService(service.id)}
              className="w-full text-left"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  selectedServices.has(service.id) ? 'bg-[#000000] text-white' : 'bg-[#F5F5F7]'
                }`}>
                  {service.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>
                    {service.name}
                  </h3>
                  <p className="text-sm text-[#86868B] mb-3">
                    {service.description}
                  </p>
                  <div className="text-lg" style={{ fontWeight: 600 }}>
                    ₩{service.price.toLocaleString()}
                  </div>
                </div>
              </div>
            </button>
            
            {/* Options - Only show if service is selected */}
            {selectedServices.has(service.id) && service.options && (
              <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.1)] space-y-2">
                <p className="text-sm text-[#86868B] mb-2">옵션 선택</p>
                {service.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={(e) => selectOption(service.id, option.id, e)}
                    className={`w-full text-left py-3 px-4 rounded-[16px] transition-all ${
                      selectedOptions[service.id] === option.id
                        ? 'bg-[#000000] text-white'
                        : 'bg-white hover:bg-[rgba(0,0,0,0.05)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm" style={{ fontWeight: 600 }}>
                          {option.name}
                        </div>
                        <div className={`text-xs ${
                          selectedOptions[service.id] === option.id ? 'text-[#86868B]' : 'text-[#86868B]'
                        }`}>
                          {option.description}
                        </div>
                      </div>
                      <div className="text-sm" style={{ fontWeight: 700 }}>
                        {option.price === 0 ? '기본' : `+${option.price.toLocaleString()}원`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* Info Button */}
            <button
              onClick={(e) => handleInfoClick(service.id, e)}
              className="w-full py-2 px-4 mt-4 rounded-[16px] bg-[#000000] text-white text-sm transition-all hover:scale-[0.98] active:scale-[0.96]"
            >
              <div className="flex items-center justify-center">
                <HelpCircle className="w-4 h-4 mr-1" />
                상세 정보
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto px-6 py-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[#86868B]">총 예상 금액</span>
            <span className="text-2xl" style={{ fontWeight: 700 }}>
              ₩{totalPrice.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => selectedServices.size > 0 && onNavigate('form')}
            disabled={selectedServices.size === 0}
            className={`w-full py-4 rounded-full transition-all ${
              selectedServices.size > 0
                ? 'bg-[#000000] text-white hover:scale-[0.98] active:scale-[0.96]'
                : 'bg-[#F5F5F7] text-[#86868B] cursor-not-allowed'
            }`}
            style={{ fontWeight: 600 }}
          >
            계속하기
          </button>
        </div>
      </div>

      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={selectedServiceInfo}
        isOpen={selectedServiceInfo !== null}
        onClose={() => setSelectedServiceInfo(null)}
        onBookService={handleBookService}
      />
    </div>
  );
}