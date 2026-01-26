import { X, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MenuDrawer({ isOpen, onClose }: MenuDrawerProps) {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-[rgba(0,0,0,0.05)]">
            <span className="text-lg" style={{ fontWeight: 700 }}>
              메뉴
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-3 py-6 space-y-1">
            <button
              onClick={() => handleNavigate('/')}
              className="w-full text-left px-6 py-4 rounded-[20px] hover:bg-[#F5F5F7] transition-colors"
              style={{ fontWeight: 600 }}
            >
              홈
            </button>
            <button
              onClick={() => handleNavigate('/services/list')}
              className="w-full text-left px-6 py-4 rounded-[20px] hover:bg-[#F5F5F7] transition-colors"
              style={{ fontWeight: 600 }}
            >
              제공서비스
            </button>
            <button
              onClick={() => handleNavigate('/reviews')}
              className="w-full text-left px-6 py-4 rounded-[20px] hover:bg-[#F5F5F7] transition-colors"
              style={{ fontWeight: 600 }}
            >
              후기
            </button>
            <button
              onClick={() => handleNavigate('/about')}
              className="w-full text-left px-6 py-4 rounded-[20px] hover:bg-[#F5F5F7] transition-colors"
              style={{ fontWeight: 600 }}
            >
              회사소개
            </button>
          </nav>

          {/* Footer in Menu */}
          <div className="border-t border-[rgba(0,0,0,0.05)]">
            <div className="px-6 py-5">
              <h4 className="text-xs tracking-wider mb-4" style={{ fontWeight: 700, color: '#1D1D1F' }}>
                고객지원
              </h4>

              <div className="space-y-3">
                {/* Phone */}
                <a
                  href="tel:010-3971-9794"
                  className="flex items-center justify-between p-3 bg-[#F5F5F7] hover:bg-[#E8E8ED] rounded-[16px] transition-colors group"
                >
                  <div className="flex-1">
                    <p className="text-xs text-[#86868B] mb-0.5">전화 문의</p>
                    <p className="text-base" style={{ fontWeight: 600, color: '#1D1D1F' }}>
                      010-3971-9794
                    </p>
                  </div>
                  <div className="text-xs text-[#86868B] group-hover:text-[#1D1D1F] transition-colors">
                    전화하기 →
                  </div>
                </a>

                {/* KakaoTalk */}
                <a
                  href="https://pf.kakao.com/_your_kakao_id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full p-3 bg-[#FEE500] hover:bg-[#FDD835] rounded-[16px] transition-all hover:scale-[0.98] active:scale-[0.96]"
                  style={{ fontWeight: 600 }}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">카카오톡 상담</span>
                </a>
              </div>

              {/* Business Hours */}
              <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.08)]">
                <p className="text-xs text-[#86868B] text-center">
                  평일 10:00 - 18:00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
