import { ChevronLeft, Gamepad2, Zap, Settings, CircuitBoard, Plus, Battery, Wrench, Palette } from "lucide-react";
import { useState } from "react";

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

export function ServiceSelection({ onNavigate }: ServiceSelectionProps) {
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

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
    </div>
  );
}