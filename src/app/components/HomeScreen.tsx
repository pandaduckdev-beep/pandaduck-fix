import { Menu, Zap, CircuitBoard, Plus, Battery } from "lucide-react";
import { Footer } from "@/app/components/Footer";
import { useState } from "react";
import { MenuDrawer } from "@/app/components/MenuDrawer";

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-lg tracking-tight" style={{ fontWeight: 600 }}>
            PandaDuck Pix
          </div>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Menu Drawer */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={onNavigate}
      />

      {/* Hero Section */}
      <section className="max-w-md mx-auto px-6 pt-12 pb-16">
        <div className="text-center space-y-6">
          <h1
            className="text-5xl tracking-tight leading-[1.1]"
            style={{ fontWeight: 700 }}
          >
            완벽함,<br />그 이상으로
          </h1>
          <p
            className="text-lg text-[#86868B] max-w-xs mx-auto"
            style={{ fontWeight: 400 }}
          >
            프로 게이머를 위한 전문 컨트롤러 수리 및 커스터마이징
          </p>
          <div className="pt-4">
            <img
              src="https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=1200&auto=format&fit=crop"
              alt="DualSense Controller"
              className="w-full h-64 object-cover rounded-[28px]"
            />
          </div>
          <button
            onClick={() => onNavigate('service')}
            className="w-full bg-[#000000] text-white py-4 rounded-full transition-transform hover:scale-[0.98] active:scale-[0.96]"
            style={{ fontWeight: 600 }}
          >
            수리 시작하기
          </button>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="max-w-md mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 gap-3">
          {/* Stick Drift Fix */}
          <div className="bg-[#F5F5F7] rounded-[28px] p-6 space-y-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>
                스틱 드리프트 해결
              </h3>
              <p className="text-sm text-[#86868B]">
                홀 이펙트 센서로 영구적 해결
              </p>
            </div>
          </div>

          {/* Clicky Buttons */}
          <div className="bg-[#F5F5F7] rounded-[28px] p-6 space-y-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <CircuitBoard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>
                클릭키 버튼
              </h3>
              <p className="text-sm text-[#86868B]">
                eXtremeRate 프리미엄 스위치
              </p>
            </div>
          </div>

          {/* Back Button Mod */}
          <div className="bg-[#F5F5F7] rounded-[28px] p-6 space-y-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>
                백버튼 모드
              </h3>
              <p className="text-sm text-[#86868B]">
                프로급 후면 패들 장착
              </p>
            </div>
          </div>

          {/* High-Capacity Battery */}
          <div className="bg-[#F5F5F7] rounded-[28px] p-6 space-y-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Battery className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>
                배터리 업그레이드
              </h3>
              <p className="text-sm text-[#86868B]">
                최대 3배 더 긴 플레이타임
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}