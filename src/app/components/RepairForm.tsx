import {
  ChevronLeft,
  Check,
  Tag,
  CheckCircle2,
  Package,
  Gamepad2,
  MapPin,
  Phone,
  User,
  Search,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { ServiceSelectionData, ConditionData } from '@/app/App'
import { createRepairRequest } from '@/lib/api'
import { getControllerModelName } from '@/utils/controllerModels'
import { getControllerModelById } from '@/services/pricingService'
import { toast } from 'sonner'
import { useSlideUp } from '@/hooks/useSlideUp'
import { AddressSearchModal } from '@/app/components/AddressSearchModal'

/**
 * 한국 전화번호 포맷 함수 (010-0000-0000)
 */
const formatPhoneNumber = (value: string): string => {
  // 숫자만 추출
  const numbers = value.replace(/\D/g, '')

  // 최대 11자리로 제한 (국내 휴대폰 번호)
  const maxLength = 11
  const trimmedNumbers = numbers.slice(0, maxLength)

  // 길이에 따라 포맷팅
  if (trimmedNumbers.length === 0) {
    return ''
  } else if (trimmedNumbers.length <= 3) {
    return trimmedNumbers
  } else if (trimmedNumbers.length <= 7) {
    return `${trimmedNumbers.slice(0, 3)}-${trimmedNumbers.slice(3)}`
  } else {
    return `${trimmedNumbers.slice(0, 3)}-${trimmedNumbers.slice(3, 7)}-${trimmedNumbers.slice(7, 11)}`
  }
}

export function RepairForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const controllerModel = location.state?.controllerModel as string | null
  const selectionData = location.state?.selectionData as ServiceSelectionData | null
  const conditionData = location.state?.conditionData as ConditionData | null
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    postalCode: '',
    address: '',
    detailAddress: '',
    pickupMethod: 'express' as 'express' | 'dropoff',
  })

  const [submitted, setSubmitted] = useState(false)
  const { setRef } = useSlideUp(3)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showConvenienceModal, setShowConvenienceModal] = useState(false)
  const [showAddressSearch, setShowAddressSearch] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 페이지 진입 시 스크롤 위치를 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectionData || selectionData.services.length === 0) {
      setError('선택된 서비스가 없습니다.')
      return
    }

    // 폼 제출 시 확인 모달 표시
    setShowConfirmModal(true)
  }

  const confirmSubmit = async () => {
    setSubmitted(true)
    setError(null)
    setShowConfirmModal(false)

    try {
      // Convert model_id to UUID
      let controllerModelUuid = controllerModel || 'DualSense'
      if (controllerModel && !controllerModel.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const model = await getControllerModelById(controllerModel)
        if (model) {
          controllerModelUuid = model.id
        }
      }

      // Supabase에 수리 신청 데이터 저장
      await createRepairRequest({
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: undefined,
        controllerModel: controllerModelUuid, // UUID 사용
        controllerModelName: controllerModel ? getControllerModelName(controllerModel) : undefined,
        postalCode: formData.postalCode,
        address: formData.address,
        detailAddress: formData.detailAddress,
        issueDescription: [
          conditionData?.conditions.length
            ? `상태: [${conditionData.conditions.join(', ')}]`
            : '',
          conditionData?.notes ? `요청사항: ${conditionData.notes}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
        services: selectionData.services.map((service) => ({
          serviceId: service.uuid, // UUID 사용
          serviceName: service.name,
          optionId: service.selectedOption?.id,
          optionName: service.selectedOption?.name,
          servicePrice: service.price,
          optionPrice: service.selectedOption?.price || 0,
        })),
        totalAmount: selectionData.total,
      })

      // 성공 시 모달 표시
      setTimeout(() => {
        setSubmitted(false)
        setShowSuccessModal(true)
      }, 500)
    } catch (err) {
      setSubmitted(false)
      setError(err instanceof Error ? err.message : '신청 중 오류가 발생했습니다.')
      console.error('Failed to submit repair request:', err)
    }
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    navigate('/')
  }

  const isFormValid = formData.name && formData.phone && formData.postalCode && formData.address && formData.detailAddress

  const handleAddressComplete = (data: { postalCode: string; address: string }) => {
    setFormData({
      ...formData,
      postalCode: data.postalCode,
      address: data.address,
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
            배송지 입력
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
          <div className="flex-1 h-0.5 bg-[#000000] mx-2"></div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-7 h-7 rounded-full bg-[#000000] text-white flex items-center justify-center text-xs"
              style={{ fontWeight: 600 }}
            >
              4
            </div>
            <span className="text-xs" style={{ fontWeight: 600 }}>
              배송
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto px-6 space-y-8">
        {/* Service Summary Box */}
        <div ref={setRef(0)} className="slide-up bg-[#F5F5F7] rounded-[28px] p-6 space-y-4" style={{ transitionDelay: '0s' }}>
          <h3 className="text-lg" style={{ fontWeight: 600 }}>
            서비스 요약
          </h3>

          {selectionData ? (
            <div className="space-y-3">
              {/* 선택한 컨트롤러 모델 */}
              {controllerModel && (
                <div className="flex items-center gap-2 pb-3 border-b border-[rgba(0,0,0,0.1)]">
                  <Gamepad2 className="w-4 h-4 text-[#86868B]" />
                  <span className="text-sm text-[#86868B]">컨트롤러:</span>
                  <span className="text-sm font-semibold">
                    {getControllerModelName(controllerModel)}
                  </span>
                </div>
              )}

              {/* 선택한 서비스 목록 - 카드형 */}
              {selectionData.services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-[12px] p-3 border border-[rgba(0,0,0,0.06)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* 서비스명 및 옵션 */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm mb-1">{service.name}</div>
                      {service.selectedOption && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-[#86868B]"></div>
                          <span className="text-xs text-[#86868B]">
                            {service.selectedOption.name}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* 금액 */}
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        ₩{(service.price + (service.selectedOption?.price || 0)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 할인 정보 */}
              {selectionData.discount > 0 && (
                <>
                  <div className="h-px bg-[rgba(0,0,0,0.1)]"></div>
                  <div className="bg-white/60 rounded-[16px] p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="w-3.5 h-3.5 text-[#FF3B30]" />
                      <span className="text-[#FF3B30]" style={{ fontWeight: 600 }}>
                        {selectionData.discountName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#86868B]">서비스 금액</span>
                    <span style={{ fontWeight: 600 }}>
                      ₩{selectionData.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#FF3B30]">할인 금액</span>
                    <span className="text-[#FF3B30]" style={{ fontWeight: 600 }}>
                      -₩{selectionData.discount.toLocaleString()}
                    </span>
                  </div>
                </>
              )}

              <div className="h-px bg-[rgba(0,0,0,0.1)]"></div>
              <div className="flex items-center justify-between">
                <span style={{ fontWeight: 600 }}>총 금액</span>
                <span className="text-xl" style={{ fontWeight: 700 }}>
                  ₩{selectionData.total.toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center text-[#86868B] py-4">선택된 서비스가 없습니다</div>
          )}
        </div>

        {/* Form Fields */}
        <div ref={setRef(1)} className="slide-up space-y-6" style={{ transitionDelay: '0.1s' }}>
          <div className="space-y-2">
            <label className="text-sm text-[#86868B] pl-4">이름</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="홍길동"
              className="w-full px-6 py-4 bg-[#F5F5F7] rounded-[28px] border-2 border-transparent focus:border-[#000000] focus:outline-none transition-colors"
              style={{ fontWeight: 500 }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[#86868B] pl-4">연락처</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })
              }
              placeholder="010-1234-5678"
              className="w-full px-6 py-4 bg-[#F5F5F7] rounded-[28px] border-2 border-transparent focus:border-[#000000] focus:outline-none transition-colors"
              style={{ fontWeight: 500 }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[#86868B] pl-4">배송 주소</label>

            {/* Postal Code and Address Search Button */}
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.postalCode}
                readOnly
                placeholder="우편번호"
                className="w-32 px-6 py-4 bg-[#F5F5F7] rounded-[28px] border-2 border-transparent text-center"
                style={{ fontWeight: 500 }}
              />
              <button
                type="button"
                onClick={() => setShowAddressSearch(true)}
                className="flex-1 px-6 py-4 bg-[#000000] text-white rounded-[28px] transition-all hover:scale-[0.98] active:scale-[0.96] flex items-center justify-center gap-2"
                style={{ fontWeight: 600 }}
              >
                <Search className="w-4 h-4" />
                주소 검색
              </button>
            </div>

            {/* Main Address (read-only, filled from search) */}
            <input
              type="text"
              value={formData.address}
              readOnly
              placeholder="주소를 검색해주세요"
              className="w-full px-6 py-4 bg-[#F5F5F7] rounded-[28px] border-2 border-transparent"
              style={{ fontWeight: 500 }}
            />

            {/* Detail Address (user input) */}
            <input
              type="text"
              value={formData.detailAddress}
              onChange={(e) => setFormData({ ...formData, detailAddress: e.target.value })}
              placeholder="상세 주소 (동/호수 등)"
              disabled={!formData.address}
              className="w-full px-6 py-4 bg-[#F5F5F7] rounded-[28px] border-2 border-transparent focus:border-[#000000] focus:outline-none transition-colors disabled:opacity-50"
              style={{ fontWeight: 500 }}
            />
          </div>
        </div>

        {/* Shipping Method Section - 일시 숨김 */}
        {/*
        <div ref={setRef(2)} className="slide-up space-y-4" style={{ transitionDelay: '0.2s' }}>
          <h3 className="text-lg pl-4" style={{ fontWeight: 600 }}>
            발송 방법
          </h3>

          <div className="bg-[#F5F5F7] rounded-[28px] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#86868B] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-[#86868B] mb-1">보내실 주소</p>
                <p className="text-sm" style={{ fontWeight: 600 }}>
                  경기도 광주시 태전동
                  <br />
                  PandaDuck Fix (우편번호: 06234)
                </p>
              </div>
            </div>

            <div className="h-px bg-[rgba(0,0,0,0.1)]"></div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-[#86868B] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-[#86868B] mb-1">받는 사람</p>
                <p className="text-sm" style={{ fontWeight: 600 }}>
                  PandaDuck Fix
                </p>
              </div>
            </div>

            <div className="h-px bg-[rgba(0,0,0,0.1)]"></div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#86868B] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-[#86868B] mb-1">연락처</p>
                <p className="text-sm" style={{ fontWeight: 600 }}>
                  010-3971-9794
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowConvenienceModal(true)}
            className="w-full py-4 bg-white border-2 border-[#000000] rounded-full transition-all hover:scale-[0.98] active:scale-[0.96]"
            style={{ fontWeight: 600 }}
          >
            <div className="flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              <span>편의점 택배 예약하기</span>
            </div>
          </button>

          <p className="text-xs text-center text-[#86868B] px-4">
            편의점 택배 또는 직접 방문하여 컨트롤러를 보내주세요.
            <br />
            접수 후 영업일 기준 1-3일 내 수리가 완료됩니다.
          </p>
        </div>
        */}

        {/* Error Message */}
        {error && (
          <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-[20px] p-4">
            <p className="text-sm text-[#FF3B30] text-center">{error}</p>
          </div>
        )}

        {/* Submit Notice */}
        <div className="bg-[#F5F5F7] border border-[rgba(0,0,0,0.1)] rounded-[20px] p-5">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[#86868B] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs" style={{ fontWeight: 700 }}>!</span>
            </div>
            <p className="text-sm text-[#86868B] leading-relaxed flex-1">
              신청 접수 후 기재해 주신 연락처로 금액과 발송 주소를 안내해 드립니다. 안내받은 주소로 컨트롤러를 발송해 주시면 됩니다.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || submitted}
          className={`w-full py-4 rounded-full transition-all flex items-center justify-center gap-2 ${
            isFormValid && !submitted
              ? 'bg-[#000000] text-white hover:scale-[0.98] active:scale-[0.96]'
              : 'bg-[#F5F5F7] text-[#86868B] cursor-not-allowed'
          }`}
          style={{ fontWeight: 600 }}
        >
          {submitted ? (
            <>
              <Check className="w-5 h-5" />
              처리중...
            </>
          ) : (
            '수리 신청하기'
          )}
        </button>

        {/* Terms Text */}
        <p className="text-xs text-center text-[#86868B] px-4">
          신청 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </form>

      {/* Convenience Store Modal */}
      {showConvenienceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowConvenienceModal(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Info Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#F5F5F7] rounded-full flex items-center justify-center">
                <Package className="w-10 h-10" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl text-center mb-3" style={{ fontWeight: 700 }}>
              준비 중인 서비스입니다
            </h2>

            {/* Description */}
            <p className="text-center text-[#86868B] mb-6 leading-relaxed">
              편의점 택배 예약 서비스는 현재 준비 중입니다.
              <br />
              <span style={{ fontWeight: 600 }}>아래 주소로 직접 보내주시기 바랍니다.</span>
            </p>

            {/* Company Info */}
            <div className="bg-[#F5F5F7] rounded-[20px] p-4 mb-6 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[#86868B]" />
                <span className="text-sm" style={{ fontWeight: 600 }}>
                  보내실 주소
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                경기도 광주시 태전동
                <br />
                PandaDuck Fix (우편번호: 06234)
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowConvenienceModal(false)}
              className="w-full py-4 bg-[#000000] text-white rounded-full hover:scale-[0.98] active:scale-[0.96] transition-all"
              style={{ fontWeight: 600 }}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-[28px] p-5 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            {/* Title */}
            <h2 className="text-2xl text-center mb-3" style={{ fontWeight: 700 }}>
              신청 정보 확인
            </h2>

            {/* Description */}
            <p className="text-center text-[#86868B] mb-4">입력하신 정보가 맞는지 확인해주세요</p>

            {/* Order Details */}
            <div className="space-y-3 mb-4">
              {/* Controller Model */}
              {controllerModel && (
                <div className="bg-[#F5F5F7] rounded-[16px] p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Gamepad2 className="w-3.5 h-3.5 text-[#86868B]" />
                    <span className="text-sm" style={{ fontWeight: 600 }}>
                      컨트롤러 모델
                    </span>
                  </div>
                  <p className="text-sm pl-5">{getControllerModelName(controllerModel)}</p>
                </div>
              )}

              {/* Services */}
              {selectionData && (
                <div className="bg-[#F5F5F7] rounded-[16px] p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-3.5 h-3.5 text-[#86868B]" />
                    <span className="text-sm" style={{ fontWeight: 600 }}>
                      선택한 서비스
                    </span>
                  </div>
                  <div className="space-y-2">
                    {selectionData.services.map((service) => (
                      <div
                        key={service.id}
                        className="bg-white rounded-[12px] p-2.5 border border-[rgba(0,0,0,0.06)]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm mb-0.5">{service.name}</div>
                            {service.selectedOption && (
                              <div className="flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-[#86868B]"></div>
                                <span className="text-xs text-[#86868B]">
                                  {service.selectedOption.name}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm">
                              ₩{(service.price + (service.selectedOption?.price || 0)).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {selectionData.discount > 0 && (
                      <>
                        <div className="h-px bg-[rgba(0,0,0,0.1)] my-2"></div>
                        <div className="flex items-center justify-between text-sm px-1">
                          <span className="text-[#FF3B30]">할인</span>
                          <span className="text-[#FF3B30]" style={{ fontWeight: 600 }}>
                            -₩{selectionData.discount.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="h-px bg-[rgba(0,0,0,0.1)] my-2"></div>
                    <div className="flex items-center justify-between px-1">
                      <span style={{ fontWeight: 600 }}>총 금액</span>
                      <span className="text-lg" style={{ fontWeight: 700 }}>
                        ₩{selectionData.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Condition Info */}
              {conditionData && (
                <div className="bg-[#F5F5F7] rounded-[16px] p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Gamepad2 className="w-3.5 h-3.5 text-[#86868B]" />
                    <span className="text-sm" style={{ fontWeight: 600 }}>
                      컨트롤러 상태
                    </span>
                  </div>
                  <div className="space-y-2 pl-5 text-sm">
                    <div className="flex flex-wrap gap-1.5">
                      {conditionData.conditions.map((c) => (
                        <span
                          key={c}
                          className="bg-white px-3 py-1 rounded-full border border-[rgba(0,0,0,0.1)]"
                          style={{ fontWeight: 500 }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                    {conditionData.notes && (
                      <div className="pt-2 border-t border-[rgba(0,0,0,0.1)]">
                        <span className="text-[#86868B]">요청사항</span>
                        <p className="mt-1 text-[#1D1D1F]">{conditionData.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className="bg-[#F5F5F7] rounded-[16px] p-3">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-3.5 h-3.5 text-[#86868B]" />
                  <span className="text-sm" style={{ fontWeight: 600 }}>
                    고객 정보
                  </span>
                </div>
                <div className="space-y-2 pl-5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#86868B]">이름</span>
                    <span style={{ fontWeight: 600 }}>{formData.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#86868B]">연락처</span>
                    <span style={{ fontWeight: 600 }}>{formData.phone}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-[#86868B]">주소</span>
                    <span className="text-right" style={{ fontWeight: 600 }}>
                      ({formData.postalCode}) {formData.address} {formData.detailAddress}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={submitted}
                className="flex-1 py-4 bg-white border-2 border-[#000000] text-[#000000] rounded-full hover:scale-[0.98] active:scale-[0.96] transition-all disabled:opacity-50"
                style={{ fontWeight: 600 }}
              >
                다시입력
              </button>
              <button
                onClick={confirmSubmit}
                disabled={submitted}
                className="flex-1 py-4 bg-[#000000] text-white rounded-full hover:scale-[0.98] active:scale-[0.96] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ fontWeight: 600 }}
              >
                {submitted ? (
                  <>
                    <Check className="w-5 h-5" />
                    처리중...
                  </>
                ) : (
                  '신청하기'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#34C759] rounded-full flex items-center justify-center animate-in zoom-in duration-500 delay-100">
                <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl text-center mb-3" style={{ fontWeight: 700 }}>
              수리 신청이 접수되었습니다!
            </h2>

            {/* Description */}
            <p className="text-center text-[#86868B] mb-6 leading-relaxed">
              신청해주셔서 감사합니다.
              <br />
              빠른 시일 내에 연락드리겠습니다.
            </p>

            {/* Request Details */}
            <div className="bg-[#F5F5F7] rounded-[20px] p-4 mb-4 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-[#86868B]" />
                <span className="text-sm" style={{ fontWeight: 600 }}>
                  신청 정보
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#86868B]">고객명</span>
                <span style={{ fontWeight: 600 }}>{formData.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#86868B]">연락처</span>
                <span style={{ fontWeight: 600 }}>{formData.phone}</span>
              </div>
              {selectionData && (
                <div className="flex items-center justify-between text-sm pt-2 border-t border-[rgba(0,0,0,0.1)]">
                  <span className="text-[#86868B]">결제 예정 금액</span>
                  <span className="text-lg" style={{ fontWeight: 700 }}>
                    ₩{selectionData.total.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Shipping Info */}
            <div className="bg-[#F5F5F7] rounded-[20px] p-4 mb-6 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#86868B]" />
                <span className="text-sm" style={{ fontWeight: 600 }}>
                  발송 안내
                </span>
              </div>
              <div className="text-xs text-[#86868B] leading-relaxed space-y-1">
                <p>아래 주소로 컨트롤러를 보내주세요</p>
                <p>연락처로 발송 안내 메시지를 추가로 보내드리겠습니다</p>
              </div>
              <div className="bg-white/60 rounded-[16px] p-3 space-y-2 text-sm">
                <div>
                  <p className="text-[#86868B] text-xs mb-1">보내실 주소</p>
                  <p style={{ fontWeight: 600 }}>
                    경기도 광주시 태전동
                    <br />
                    판다덕 픽스 (우편번호: 06234)
                  </p>
                </div>
                <div className="h-px bg-[rgba(0,0,0,0.1)]"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#86868B] text-xs mb-1">받는 사람</p>
                    <p style={{ fontWeight: 600 }}>판다덕 픽스</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#86868B] text-xs mb-1">연락처</p>
                    <p style={{ fontWeight: 600 }}>010-3971-9794</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="w-full py-4 bg-[#000000] text-white rounded-full hover:scale-[0.98] active:scale-[0.96] transition-all"
              style={{ fontWeight: 600 }}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* Address Search Modal */}
      <AddressSearchModal
        isOpen={showAddressSearch}
        onClose={() => setShowAddressSearch(false)}
        onComplete={handleAddressComplete}
      />
    </div>
  )
}
