import { X, Check } from "lucide-react";
import { ImageCarousel, type CarouselImage } from "./ImageCarousel";
import { OptionAccordion, type OptionItem } from "./OptionAccordion";

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
  options?: OptionItem[];
  isOpen: boolean;
  onClose: () => void;
  onBookService: () => void;
}

export function ServiceDetailModal({ service, options = [], isOpen, onClose, onBookService }: ServiceDetailModalProps) {
  if (!isOpen || !service) return null;

  // Determine if we should show carousel (if any images exist)
  const hasImages = !!(service.image || options.some((opt) => opt.imageUrl))

  // Collect all images for carousel
  const carouselImages: CarouselImage[] = []
  if (service.image) {
    carouselImages.push({
      url: service.image,
      alt: service.title,
      label: '서비스 메인',
    })
  }
  options.forEach((opt) => {
    if (opt.imageUrl) {
      carouselImages.push({
        url: opt.imageUrl,
        alt: opt.name,
        label: opt.name,
      })
    }
  })

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
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)] px-6 py-4 flex items-center justify-between rounded-t-[28px]">
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
            {/* Image Carousel or Single Image */}
            {hasImages && carouselImages.length > 0 && (
              <ImageCarousel images={carouselImages} />
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

            {/* Options Section - Horizontal Scrolling Cards */}
            {options.length > 0 && (
              <div>
                <h3 className="text-base mb-3" style={{ fontWeight: 600 }}>
                  옵션 정보
                </h3>
                <div className="relative -mx-6 px-6">
                  <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
                    {options.map((option) => (
                      <div
                        key={option.id}
                        className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start bg-[#F5F5F7] rounded-[20px] p-5"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-semibold">{option.name}</h4>
                          <span className="text-sm font-semibold text-[#000000]">
                            +₩{option.price.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-[#86868B] leading-relaxed">
                          {option.detailedDescription || option.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CTA Section with Price */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm text-[#86868B]">기본 가격</span>
                <span className="text-xl font-bold text-[#000000]">{service.price}</span>
              </div>
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
      </div>
    </>
  );
}
