import { ChevronLeft, Check } from "lucide-react";
import { useState } from "react";

interface RepairFormProps {
  onNavigate: (screen: string) => void;
}

export function RepairForm({ onNavigate }: RepairFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    pickupMethod: "express" as "express" | "dropoff",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Simulate submission
    setTimeout(() => {
      setSubmitted(false);
      onNavigate('home');
    }, 2000);
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#86868B]">홀 이펙트 센서</span>
              <span style={{ fontWeight: 600 }}>₩89,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#86868B]">헤어 트리거</span>
              <span style={{ fontWeight: 600 }}>₩45,000</span>
            </div>
            <div className="h-px bg-[rgba(0,0,0,0.1)]"></div>
            <div className="flex items-center justify-between">
              <span style={{ fontWeight: 600 }}>합계</span>
              <span className="text-xl" style={{ fontWeight: 700 }}>₩134,000</span>
            </div>
          </div>
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
              신청 완료
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
    </div>
  );
}