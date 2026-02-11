import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

export function ProcessInfoBanner() {
  const [isVisible, setIsVisible] = useState(true)

  // 로컬 스토리지에서 닫기 상태 확인
  useEffect(() => {
    const dismissed = localStorage.getItem('processInfoBannerDismissed')
    if (dismissed === 'true') {
      setIsVisible(false)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('processInfoBannerDismissed', 'true')
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#F5F5F7] border-t border-[rgba(0,0,0,0.05)] px-4 py-3 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-md mx-auto flex items-start gap-3">
        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#1d1d1f] leading-snug">
            수리 신청 양식을 작성하시면 예상 금액과 함께 패드를 보내주실 주소를 안내해드립니다. 그리고 패드를 보내시면 상태 확인과 테스트 후 수리를 진행합니다.
          </p>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-[rgba(0,0,0,0.05)] rounded-full transition-colors"
          aria-label="닫기"
        >
          <X className="w-4 h-4 text-[#86868B]" />
        </button>
      </div>
    </div>
  )
}
