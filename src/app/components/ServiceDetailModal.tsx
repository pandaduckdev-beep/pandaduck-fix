import { X, Check, Info } from 'lucide-react'
import { ImageCarousel, type CarouselImage } from './ImageCarousel'
import { type OptionItem } from './OptionAccordion'

interface ServiceDetail {
  id: string
  icon: React.ReactNode
  title: string
  subtitle: string
  summary?: string
  description: string
  features: string[]
  detailTags?: string[]
  expectedResults?: string[]
  process: string[]
  price: string
  duration: string
  warranty: string
  image?: string
}

interface ServiceDetailModalProps {
  service: ServiceDetail | null
  options?: OptionItem[]
  isOpen: boolean
  onClose: () => void
  onBookService: () => void
}

export function ServiceDetailModal({
  service,
  options = [],
  isOpen,
  onClose,
  onBookService,
}: ServiceDetailModalProps) {
  if (!isOpen || !service) return null

  const hasImages = !!(service.image || options.some((opt) => opt.imageUrl))
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

  const serviceSummary = service.summary?.trim() || service.description
  const detailTags = (service.detailTags || []).filter((tag) => tag.trim().length > 0)
  const expectedResults = (service.expectedResults || []).filter((item) => item.trim().length > 0)

  const servicePriceLabel = (() => {
    if (options.length === 0) return service.price

    const prices = options.map((option) => option.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    if (minPrice === maxPrice) {
      return `₩${minPrice.toLocaleString()}`
    }

    return `₩${minPrice.toLocaleString()} ~ ₩${maxPrice.toLocaleString()}`
  })()

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
        <div
          className="bg-white rounded-t-[28px] sm:rounded-[28px] w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
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

          <div className="p-6 space-y-6">
            {hasImages && carouselImages.length > 0 && <ImageCarousel images={carouselImages} />}

            <div>
              <p className="text-xs text-[#86868B] mb-1">한 줄 요약</p>
              <p
                className="text-sm bg-[#F5F5F7] rounded-[14px] px-3 py-2 inline-block"
                style={{ fontWeight: 600 }}
              >
                {serviceSummary}
              </p>
              {detailTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {detailTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-[#EEF1F5] text-[#4A4A4A] rounded-full px-2.5 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm text-[#86868B] leading-relaxed mt-3">{service.description}</p>
            </div>

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

            <div>
              <h3 className="text-base mb-3" style={{ fontWeight: 600 }}>
                진행 순서
              </h3>
              <div className="space-y-3">
                {service.process.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div
                      className="w-6 h-6 rounded-full bg-[#000000] text-white flex items-center justify-center text-xs flex-shrink-0"
                      style={{ fontWeight: 600 }}
                    >
                      {index + 1}
                    </div>
                    <span className="text-sm text-[#86868B]">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {options.length > 0 && (
              <div>
                <h3 className="text-base mb-3" style={{ fontWeight: 600 }}>
                  옵션 비교
                </h3>
                <div className="space-y-3">
                  {options.map((option) => (
                    <div
                      key={option.id}
                      className="bg-[#F5F5F7] rounded-[18px] p-4 border border-[rgba(0,0,0,0.05)]"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="text-sm" style={{ fontWeight: 700 }}>
                            {option.name}
                          </p>
                          {option.targetAudience && (
                            <p className="text-xs text-[#86868B] mt-1">{option.targetAudience}</p>
                          )}
                        </div>
                        <div
                          className="bg-white rounded-full px-3 py-1 text-sm"
                          style={{ fontWeight: 700 }}
                        >
                          ₩{option.price.toLocaleString()}
                        </div>
                      </div>

                      <div className="bg-white rounded-[12px] p-3">
                        <p className="text-[11px] text-[#86868B] mb-1">상세 설명</p>
                        <p
                          className="text-sm text-[#1D1D1F] leading-relaxed"
                          style={{ fontWeight: 500 }}
                        >
                          {option.detailedDescription || option.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expectedResults.length > 0 && (
              <div className="bg-[#F5F5F7] rounded-[16px] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-[#86868B]" />
                  <p className="text-sm" style={{ fontWeight: 700 }}>
                    수리 후 체감 변화
                  </p>
                </div>
                <div className="space-y-2 text-sm text-[#4A4A4A]">
                  {expectedResults.map((item) => (
                    <p key={item}>• {item}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm text-[#86868B]">서비스 가격</span>
                <span className="text-xl font-bold text-[#000000]">{servicePriceLabel}</span>
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
  )
}
