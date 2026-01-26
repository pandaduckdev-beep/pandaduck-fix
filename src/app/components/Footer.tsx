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
            게임 컨트롤러 수리 및 커스터마이징 전문
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
              <span>010-3971-9794</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#86868B]">
              <Mail className="w-4 h-4" />
              <span>contact@pandaduck.kr</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-[#86868B]">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>경기도 광주시 태전동</span>
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="space-y-2 text-xs text-[#86868B] pt-4 border-t border-[rgba(0,0,0,0.1)]">
          <p>대표자: 홍길동 | 사업자등록번호: 000-00-00000</p>
          <p>통신판매업신고번호: 제2026-가나다라-0000호</p>
          <p className="pt-2">© 2024 PandaDuck Fix. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
