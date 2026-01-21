import { ChevronLeft, Check, Tag, CheckCircle2, Package } from "lucide-react";
import { useState } from "react";
import type { ServiceSelectionData } from "@/app/App";
import { createRepairRequest } from "@/lib/api";

interface RepairFormProps {
  onNavigate: (screen: string) => void;
  selectionData: ServiceSelectionData | null;
  controllerModel: string | null;
}

export function RepairForm({ onNavigate, selectionData, controllerModel }: RepairFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    pickupMethod: "express" as "express" | "dropoff",
  });

  const [submitted, setSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectionData || selectionData.services.length === 0) {
      setError("선택된 서비스가 없습니다.");
      return;
    }

    setSubmitted(true);
    setError(null);

    try {
      // Supabase에 수리 신청 데이터 저장
      await createRepairRequest({
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: undefined,
        controllerModel: controllerModel || "DualSense", // 선택한 기종 사용
        issueDescription: `수거 방법: ${formData.pickupMethod === 'express' ? '택배' : '방문접수'}, 주소: ${formData.address}`,
        services: selectionData.services.map(service => ({
          serviceId: service.uuid, // UUID 사용
          optionId: service.selectedOption?.id,
          servicePrice: service.price,
          optionPrice: service.selectedOption?.price || 0
        })),
        totalAmount: selectionData.total
      });

      // 성공 시 모달 표시
      setTimeout(() => {
        setSubmitted(false);
        setShowSuccessModal(true);
      }, 500);
    } catch (err) {
      setSubmitted(false);
      setError(err instanceof Error ? err.message : '신청 중 오류가 발생했습니다.');
      console.error('Failed to submit repair request:', err);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    onNavigate('home');
  };

  const isFormValid = formData.name && formData.phone && formData.address;

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => onNavigate('service')}
            className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors -ml-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-lg tracking-tight" style={{ fontWeight: 600 }}>
            수리 신청
          </div>
          <div className="w-10"></div>
        </div>
      </nav>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto px-6 pt-8 space-y-8">
        {/* Service Summary Box */}
        <div className="bg-[#F5F5F7] rounded-[28px] p-6 space-y-4">
          <h3 className="text-lg" style={{ fontWeight: 600 }}>
            서비스 요약
          </h3>

          {selectionData ? (
            <div className="space-y-3">
              {/* 선택한 서비스 목록 */}
              {selectionData.services.map((service) => (
                <div key={service.id}>
                  <div className="flex items-center justify-between">
                    <span className="text-[#86868B]">{service.name}</span>
                    <span style={{ fontWeight: 600 }}>₩{service.price.toLocaleString()}</span>
                  </div>
                  {service.selectedOption && (
                    <div className="flex items-center justify-between mt-1 pl-4">
                      <span className="text-xs text-[#86868B]">ㄴ {service.selectedOption.name}</span>
                      <span className="text-xs" style={{ fontWeight: 600 }}>
                        {service.selectedOption.price === 0
                          ? '기본'
                          : `+₩${service.selectedOption.price.toLocaleString()}`}
                      </span>
                    </div>
                  )}
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
                    <span style={{ fontWeight: 600 }}>₩{selectionData.subtotal.toLocaleString()}</span>
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
            <div className="text-center text-[#86868B] py-4">
              선택된 서비스가 없습니다
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
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
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="010-1234-5678"
              className="w-full px-6 py-4 bg-[#F5F5F7] rounded-[28px] border-2 border-transparent focus:border-[#000000] focus:outline-none transition-colors"
              style={{ fontWeight: 500 }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[#86868B] pl-4">수거 주소</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="서울특별시 강남구..."
              className="w-full px-6 py-4 bg-[#F5F5F7] rounded-[28px] border-2 border-transparent focus:border-[#000000] focus:outline-none transition-colors"
              style={{ fontWeight: 500 }}
            />
          </div>

          {/* Pickup Method Toggle */}
          <div className="space-y-2">
            <label className="text-sm text-[#86868B] pl-4">수거 방법</label>
            <div className="bg-[#F5F5F7] rounded-[28px] p-1.5 flex gap-1.5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, pickupMethod: "express" })}
                className={`flex-1 py-3 rounded-[20px] transition-all ${
                  formData.pickupMethod === "express"
                    ? 'bg-white shadow-sm'
                    : 'bg-transparent text-[#86868B]'
                }`}
                style={{ fontWeight: 600 }}
              >
                택배
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, pickupMethod: "dropoff" })}
                className={`flex-1 py-3 rounded-[20px] transition-all ${
                  formData.pickupMethod === "dropoff"
                    ? 'bg-white shadow-sm'
                    : 'bg-transparent text-[#86868B]'
                }`}
                style={{ fontWeight: 600 }}
              >
                방문접수
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-[20px] p-4">
            <p className="text-sm text-[#FF3B30] text-center">
              {error}
            </p>
          </div>
        )}

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
              신청이 완료되었습니다!
            </h2>

            {/* Description */}
            <p className="text-center text-[#86868B] mb-6 leading-relaxed">
              수리 신청이 정상적으로 접수되었습니다.<br />
              빠른 시일 내에 연락드리겠습니다.
            </p>

            {/* Request Details */}
            <div className="bg-[#F5F5F7] rounded-[20px] p-4 mb-6 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-[#86868B]" />
                <span className="text-sm" style={{ fontWeight: 600 }}>신청 정보</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#86868B]">고객명</span>
                <span style={{ fontWeight: 600 }}>{formData.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#86868B]">연락처</span>
                <span style={{ fontWeight: 600 }}>{formData.phone}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#86868B]">수거 방법</span>
                <span style={{ fontWeight: 600 }}>
                  {formData.pickupMethod === 'express' ? '택배' : '방문접수'}
                </span>
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
    </div>
  );
}