import { useState } from 'react'
import { ChevronDown, Image as ImageIcon } from 'lucide-react'

export interface OptionItem {
  id: string
  name: string
  description: string
  detailedDescription?: string
  price: number
  imageUrl?: string
}

interface OptionAccordionProps {
  options: OptionItem[]
  selectedOptionId?: string
  onSelectOption?: (optionId: string) => void
  isExpanded?: boolean
  showSelection?: boolean
}

export function OptionAccordion({
  options,
  selectedOptionId,
  onSelectOption,
  isExpanded: initialExpanded = true,
  showSelection = false,
}: OptionAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  if (!options || options.length === 0) {
    return null
  }

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  const handleOptionClick = (optionId: string) => {
    if (showSelection && onSelectOption) {
      onSelectOption(optionId)
    }
  }

  return (
    <>
      <div className="border border-[rgba(0,0,0,0.1)] rounded-[20px] overflow-hidden">
        {/* Header */}
        <button
          onClick={handleToggle}
          className="w-full px-5 py-4 flex items-center justify-between bg-[#F5F5F7] hover:bg-[#E8E8ED] transition-colors"
          aria-expanded={isExpanded}
          aria-controls="options-content"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">옵션 선택</h3>
            <span className="text-xs text-[#86868B] bg-white px-2 py-1 rounded-full">
              {options.length}개
            </span>
          </div>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Content */}
        <div
          id="options-content"
          className={`transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
          role="region"
          aria-labelledby="options-header"
        >
          <div className="p-5 space-y-3 bg-white">
            {options.map((option, index) => {
              const isSelected = showSelection && selectedOptionId === option.id
              const isFree = option.price === 0

              return (
                <div
                  key={option.id}
                  className={`relative p-4 rounded-[16px] border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#000000] bg-[#F5F5F7]'
                      : 'border-[rgba(0,0,0,0.1)] hover:border-[#86868B] bg-white'
                  }`}
                  onClick={() => handleOptionClick(option.id)}
                  role={showSelection ? 'radio' : 'article'}
                  aria-checked={showSelection ? isSelected : undefined}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleOptionClick(option.id)
                    }
                  }}
                >
                  {/* Radio Button (if selection enabled) */}
                  {showSelection && (
                    <div className="absolute top-4 right-4">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-[#000000] bg-[#000000]'
                            : 'border-[#86868B] bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  )}

                  {/* Option Content */}
                  <div className={showSelection ? 'pr-8' : ''}>
                    {/* Header with Name and Price */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-semibold text-base">{option.name}</h4>
                      <span
                        className={`text-sm font-semibold whitespace-nowrap ${
                          isFree ? 'text-[#86868B]' : 'text-[#000000]'
                        }`}
                      >
                        {isFree ? '기본' : `+₩${option.price.toLocaleString()}`}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-[#86868B] leading-relaxed mb-3">
                      {option.description}
                    </p>

                    {/* Image Thumbnail */}
                    {option.imageUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setLightboxImage(option.imageUrl!)
                        }}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-[#F5F5F7] hover:bg-[#E8E8ED] rounded-full text-xs font-medium transition-colors"
                        aria-label={`${option.name} 이미지 보기`}
                      >
                        <ImageIcon className="w-4 h-4" />
                        이미지 보기
                      </button>
                    )}
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#000000] rounded-b-[14px]" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="옵션 이미지 확대 보기"
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white"
            aria-label="닫기"
          >
            ✕
          </button>
          <img
            src={lightboxImage}
            alt="옵션 이미지"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
