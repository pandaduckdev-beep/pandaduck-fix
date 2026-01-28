import { ChevronLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { ServiceSelectionData, ConditionData } from '@/app/App'
import { useSlideUp } from '@/hooks/useSlideUp'

const CONDITIONS = [
  '조이스틱 오작동',
  '버튼 클릭감 이상',
  '트리거/범퍼 불량',
  '충전 포트 문제',
  '외관 손상',
  '기타',
]

export function ControllerCondition() {
  const navigate = useNavigate()
  const location = useLocation()
  const controllerModel = location.state?.controllerModel as string | null
  const selectionData = location.state?.selectionData as ServiceSelectionData | null

  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const { setRef } = useSlideUp(3)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const toggleCondition = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    )
  }

  const handleNext = () => {
    if (selectedConditions.length === 0) return

    const conditionData: ConditionData = {
      conditions: selectedConditions,
      notes: notes.trim(),
    }

    navigate('/repair/form', {
      state: { controllerModel, selectionData, conditionData },
    })
  }

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors -ml-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-lg tracking-tight" style={{ fontWeight: 600 }}>
            컨트롤러 상태
          </div>
          <div className="w-10"></div>
        </div>
      </nav>

      {/* Progress Indicator */}
      <div className="max-w-md mx-auto px-6 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div
              className="w-7 h-7 rounded-full bg-[#000000] text-white flex items-center justify-center text-xs"
              style={{ fontWeight: 600 }}
            >
              1
            </div>
            <span className="text-xs" style={{ fontWeight: 600 }}>
              모델
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-[#000000] mx-2"></div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-7 h-7 rounded-full bg-[#000000] text-white flex items-center justify-center text-xs"
              style={{ fontWeight: 600 }}
            >
              2
            </div>
            <span className="text-xs" style={{ fontWeight: 600 }}>
              서비스
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-[#000000] mx-2"></div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-7 h-7 rounded-full bg-[#000000] text-white flex items-center justify-center text-xs"
              style={{ fontWeight: 600 }}
            >
              3
            </div>
            <span className="text-xs" style={{ fontWeight: 600 }}>
              상태
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-[#F5F5F7] mx-2"></div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-7 h-7 rounded-full bg-[#F5F5F7] text-[#86868B] flex items-center justify-center text-xs"
              style={{ fontWeight: 600 }}
            >
              4
            </div>
            <span className="text-xs text-[#86868B]" style={{ fontWeight: 600 }}>
              배송
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 space-y-6">
        {/* Controller Status */}
        <div ref={setRef(0)} className="slide-up bg-[#F5F5F7] rounded-[28px] p-6 space-y-4" style={{ transitionDelay: '0s' }}>
          <h3 className="text-lg" style={{ fontWeight: 600 }}>
            현재 상태
          </h3>
          <p className="text-sm text-[#86868B]">해당하는 항목을 모두 선택해주세요</p>

          <div className="space-y-2">
            {CONDITIONS.map((condition) => {
              const isSelected = selectedConditions.includes(condition)
              return (
                <button
                  key={condition}
                  onClick={() => toggleCondition(condition)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[16px] transition-all ${
                    isSelected
                      ? 'bg-[#000000] text-white'
                      : 'bg-white hover:bg-[#F0F0F2]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-white bg-white'
                        : 'border-[#C7C7CC]'
                    }`}
                  >
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-left" style={{ fontWeight: 500 }}>
                    {condition}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Additional Notes */}
        <div ref={setRef(1)} className="slide-up bg-[#F5F5F7] rounded-[28px] p-6 space-y-4" style={{ transitionDelay: '0.1s' }}>
          <h3 className="text-lg" style={{ fontWeight: 600 }}>
            추가 요청사항
          </h3>
          <p className="text-sm text-[#86868B]">선택사항 - 구체적인 내용을 기술해주세요</p>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="예: 왼쪽 조이스틱이 자꾸 위로 간다, 특정 버튼만 안눌린다 등"
            rows={4}
            className="w-full bg-white rounded-[16px] p-4 text-sm resize-none outline-none border border-[rgba(0,0,0,0.08)] focus:border-[rgba(0,0,0,0.3)] transition-colors placeholder-[#C7C7CC]"
          />
        </div>

        {/* Next Button */}
        <div ref={setRef(2)} className="slide-up" style={{ transitionDelay: '0.2s' }}>
          <button
            onClick={handleNext}
            disabled={selectedConditions.length === 0}
            className="w-full py-4 bg-[#000000] text-white rounded-full transition-all disabled:opacity-40 hover:scale-[0.98] active:scale-[0.96]"
            style={{ fontWeight: 600 }}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  )
}
