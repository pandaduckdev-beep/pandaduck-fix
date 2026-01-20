import { X } from "lucide-react";

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

export function MenuDrawer({ isOpen, onClose, onNavigate }: MenuDrawerProps) {
  const handleNavigate = (screen: string) => {
    onNavigate(screen);
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
              onClick={() => handleNavigate('home')}
              className="w-full text-left px-6 py-4 rounded-[20px] hover:bg-[#F5F5F7] transition-colors"
              style={{ fontWeight: 600 }}
            >
              홈
            </button>
            <button
              onClick={() => handleNavigate('services')}
              className="w-full text-left px-6 py-4 rounded-[20px] hover:bg-[#F5F5F7] transition-colors"
              style={{ fontWeight: 600 }}
            >
              제공서비스
            </button>
            <button
              onClick={() => handleNavigate('reviews')}
              className="w-full text-left px-6 py-4 rounded-[20px] hover:bg-[#F5F5F7] transition-colors"
              style={{ fontWeight: 600 }}
            >
              후기
            </button>
            <button
              onClick={() => handleNavigate('about')}
              className="w-full text-left px-6 py-4 rounded-[20px] hover:bg-[#F5F5F7] transition-colors"
              style={{ fontWeight: 600 }}
            >
              회사소개
            </button>
          </nav>

          {/* Footer in Menu */}
          <div className="px-6 py-6 border-t border-[rgba(0,0,0,0.05)]">
            <p className="text-xs text-[#86868B]">
              고객센터: 1588-0000
            </p>
            <p className="text-xs text-[#86868B] mt-1">
              평일 10:00 - 18:00
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
