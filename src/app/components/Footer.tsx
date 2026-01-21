import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#F5F5F7] mt-20">
      <div className="max-w-md mx-auto px-6 py-12 space-y-8">
        {/* Brand */}
        <div>
          <div className="text-2xl mb-2" style={{ fontWeight: 700 }}>
            PandaDuck Fix
          </div>
          <p className="text-sm text-[#86868B]">
            프리미엄 게이밍 컨트롤러 커스터마이징 전문
          </p>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="text-sm" style={{ fontWeight: 600 }}>
            연락처
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-[#86868B]">
              <Phone className="w-4 h-4" />
              <span>1588-0000</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#86868B]">
              <Mail className="w-4 h-4" />
              <span>contact@pandaduckfix.com</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-[#86868B]">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>서울특별시 강남구 테헤란로 123, 4층</span>
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="space-y-2 text-xs text-[#86868B] pt-4 border-t border-[rgba(0,0,0,0.1)]">
          <p>대표자: 홍길동 | 사업자등록번호: 123-45-67890</p>
          <p>통신판매업신고번호: 제2024-서울강남-0000호</p>
          <p className="pt-2">© 2024 PandaDuck Fix. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
