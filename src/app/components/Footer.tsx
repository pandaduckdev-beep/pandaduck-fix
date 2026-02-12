import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

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
            문의하기
          </h4>
          <div className="space-y-3">
            {/* 전화번호 - 일시 제거 */}
            {/*
            <a
              href="tel:010-3971-9794"
              className="flex items-center gap-3 text-sm text-[#86868B] hover:text-[#007AFF] transition-colors"
              aria-label="전화 걸기: 010-3971-9794"
            >
              <Phone className="w-4 h-4" />
              <span>010-3971-9794</span>
            </a>
            */}
            <a
              href="mailto:contact@pandaduck.kr"
              className="flex items-center gap-3 text-sm text-[#86868B] hover:text-[#007AFF] transition-colors"
              aria-label="이메일 보내기: contact@pandaduck.kr"
            >
              <Mail className="w-4 h-4" />
              <span>contact@pandaduck.kr</span>
            </a>
            {/*
            <div className="flex items-start gap-3 text-sm text-[#86868B]">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <address className="not-italic">경기도 광주시 태전동</address>
            </div>
            */}
            <a
              href="https://open.kakao.com/o/sWidj5ei"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full p-3 bg-[#FEE500] hover:bg-[#FDD835] rounded-[16px] transition-all hover:scale-[0.98] active:scale-[0.96]"
              style={{ fontWeight: 600 }}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">카카오톡 상담</span>
            </a>
          </div>
        </div>

        {/* Business Info - 일시 숨김 */}
        {/*
        <div className="space-y-2 text-xs text-[#86868B] pt-4 border-t border-[rgba(0,0,0,0.1)]">
          <p>대표자: 홍길동 | 사업자등록번호: 000-00-00000</p>
          <p>통신판매업신고번호: 제2026-가나다라-0000호</p>
          <p className="pt-2">© 2024 PandaDuck Fix. All rights reserved.</p>
        </div>
        */}

        {/* Copyright only */}
        <div className="text-xs text-[#86868B] pt-4 border-t border-[rgba(0,0,0,0.1)]">
          <p>© 2024 PandaDuck Fix. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
