import { X, Check } from "lucide-react";

interface ServiceDetail {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  process: string[];
  price: string;
  duration: string;
  warranty: string;
  image?: string;
}

interface ServiceDetailModalProps {
  service: ServiceDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onBookService: () => void;
}

export function ServiceDetailModal({ service, isOpen, onClose, onBookService }: ServiceDetailModalProps) {
  if (!isOpen || !service) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
        <div 
          className="bg-white rounded-t-[28px] sm:rounded-[28px] w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)] px-6 py-4 flex items-center justify-between rounded-t-[28px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F5F5F7] rounded-full flex items-center justify-center">
                {service.icon}
              </div>
              <div>
                <h2 className="text-lg" style={{ fontWeight: 700 }}>
                  {service.title}
                </h2>
                <p className="text-xs text-[#86868B]">{service.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Image */}
            {service.image && (
              <img 
                src={service.image}
                alt={service.title}
                className="w-full h-48 object-cover rounded-[20px]"
              />
            )}

            {/* Description */}
            <div>
              <h3 className="text-base mb-2" style={{ fontWeight: 600 }}>
                서비스 설명
              </h3>
              <p className="text-sm text-[#86868B] leading-relaxed">
                {service.description}
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-base mb-3" style={{ fontWeight: 600 }}>
                주요 특징
              </h3>
              <div className="space-y-2">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#000000] flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Process */}
            <div>
              <h3 className="text-base mb-3" style={{ fontWeight: 600 }}>
                작업 과정
              </h3>
              <div className="space-y-3">
                {service.process.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#000000] text-white flex items-center justify-center text-xs flex-shrink-0" style={{ fontWeight: 600 }}>
                      {index + 1}
                    </div>
                    <span className="text-sm text-[#86868B]">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#F5F5F7] rounded-[20px] p-4 text-center">
                <div className="text-lg mb-1" style={{ fontWeight: 700 }}>
                  {service.price}
                </div>
                <div className="text-xs text-[#86868B]">가격</div>
              </div>
              <div className="bg-[#F5F5F7] rounded-[20px] p-4 text-center">
                <div className="text-lg mb-1" style={{ fontWeight: 700 }}>
                  {service.duration}
                </div>
                <div className="text-xs text-[#86868B]">작업시간</div>
              </div>
              <div className="bg-[#F5F5F7] rounded-[20px] p-4 text-center">
                <div className="text-lg mb-1" style={{ fontWeight: 700 }}>
                  {service.warranty}
                </div>
                <div className="text-xs text-[#86868B]">보증기간</div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={onBookService}
              className="w-full bg-[#000000] text-white py-4 rounded-full transition-transform hover:scale-[0.98] active:scale-[0.96]"
              style={{ fontWeight: 600 }}
            >
              이 서비스 신청하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
