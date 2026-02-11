import { X } from 'lucide-react'

interface ProcessGuideModalProps {
  isOpen: boolean
  onClose: () => void
  onStartRepair: () => void
}

export function ProcessGuideModal({ isOpen, onClose, onStartRepair }: ProcessGuideModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md mx-auto bg-white sm:rounded-[28px] rounded-t-[28px] max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom fade-in-0 duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-[rgba(0,0,0,0.05)] px-6 py-4 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold">
            수리 신청 안내
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <p className="text-base text-[#1d1d1f] leading-relaxed mb-8">
            수리 신청 양식을 작성하시면 예상 금액과 함께 패드를 보내주실 주소를 안내해드립니다.
            그리고 패드를 보내시면 상태 확인과 테스트 후 수리를 진행합니다.
          </p>

          {/* CTA Button */}
          <button
            onClick={onStartRepair}
            className="w-full bg-[#000000] text-white py-4 rounded-full font-semibold transition-transform hover:scale-[0.98] active:scale-[0.96]"
          >
            수리 신청 시작하기
          </button>
        </div>
      </div>
    </div>
  )
}
