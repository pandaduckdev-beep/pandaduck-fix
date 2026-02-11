import { X, ChevronDown, Gamepad2, Package, CircuitBoard, Plus } from 'lucide-react'

interface ProcessGuideModalProps {
  isOpen: boolean
  onClose: () => void
  onStartRepair: () => void
}

interface ProcessStep {
  step: number
  icon: React.ReactNode
  title: string
  description: string
}

const PROCESS_STEPS: ProcessStep[] = [
  {
    step: 1,
    icon: <Gamepad2 className="w-5 h-5" />,
    title: '컨트롤러 모델 선택',
    description: '수리할 기종을 선택하세요',
  },
  {
    step: 2,
    icon: <Package className="w-5 h-5" />,
    title: '수리 서비스 선택',
    description: '필요한 서비스를 골라주세요',
  },
  {
    step: 3,
    icon: <CircuitBoard className="w-5 h-5" />,
    title: '컨트롤러 상태 입력',
    description: '현재 상태를 알려주세요',
  },
  {
    step: 4,
    icon: <Plus className="w-5 h-5" />,
    title: '배송지 정보 입력',
    description: '주소와 연락처를 입력하세요',
  },
]

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
      <div className="relative w-full max-w-lg bg-[#F5F5F7] sm:rounded-[28px] rounded-t-[28px] max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom fade-in-0 duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)] px-6 py-4 flex items-center justify-between">
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
        <div className="px-6 py-6 overflow-y-auto">
          <p className="text-center text-sm text-[#86868B] mb-6">
            간단한 4단계로 수리를 신청하세요
          </p>

          {/* Steps */}
          <div className="space-y-4">
            {PROCESS_STEPS.map((stepItem, index) => (
              <div key={stepItem.step} className="relative">
                {/* Step Card */}
                <div
                  className="bg-white rounded-[20px] p-5 border border-[rgba(0,0,0,0.05)] flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDuration: '300ms', animationDelay: `${index * 100}ms` }}
                >
                  {/* Step Number with Icon */}
                  <div className="w-10 h-10 rounded-full bg-[#000000] text-white flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                    {stepItem.icon}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <h3 className="text-base font-semibold mb-1">
                      {stepItem.title}
                    </h3>
                    <p className="text-sm text-[#86868B]">
                      {stepItem.description}
                    </p>
                  </div>
                </div>

                {/* Arrow (except last step) */}
                {index < PROCESS_STEPS.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ChevronDown className="w-5 h-5 text-[#86868B]" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={onStartRepair}
            className="w-full bg-[#000000] text-white py-4 rounded-full font-semibold transition-transform hover:scale-[0.98] active:scale-[0.96] mt-6"
          >
            수리 시작하기
          </button>
        </div>
      </div>
    </div>
  )
}
