import { Menu, X, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/admin/contexts/AuthContext'

interface MobileHeaderProps {
  title: string
  subtitle?: string
  rightAction?: React.ReactNode
}

export function MobileHeader({ title, subtitle, rightAction }: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { logout } = useAuth()

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      logout()
    }
  }

  return (
    <>
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)]">
        <div className="px-5 h-16 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-lg tracking-tight" style={{ fontWeight: 700 }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-[#86868B] mt-0.5">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {rightAction}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Menu Drawer */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl">
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-[rgba(0,0,0,0.05)]">
                <span className="text-lg tracking-tight" style={{ fontWeight: 700 }}>
                  관리자 메뉴
                </span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 px-3 py-6 space-y-1">
                <a
                  href="/admin-mobile"
                  className="block w-full text-left px-6 py-4 rounded-[20px] hover:bg-[#F5F5F7] transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  대시보드
                </a>
                <a
                  href="/admin-mobile/repairs"
                  className="block w-full text-left px-6 py-4 rounded-[20px] hover:bg-[#F5F5F7] transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  수리 신청 관리
                </a>
                <a
                  href="/admin-mobile/reviews"
                  className="block w-full text-left px-6 py-4 rounded-[20px] hover:bg-[#F5F5F7] transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  후기 관리
                </a>
                <a
                  href="/admin-mobile/models"
                  className="block w-full text-left px-6 py-4 rounded-[20px] hover:bg-[#F5F5F7] transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  모델/서비스 관리
                </a>
              </nav>

              {/* Footer */}
              <div className="border-t border-[rgba(0,0,0,0.05)]">
                <div className="px-6 py-5">
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full p-3 bg-[#F5F5F7] hover:bg-[#E8E8ED] rounded-[16px] transition-all hover:scale-[0.98] active:scale-[0.96]"
                    style={{ fontWeight: 600 }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">로그아웃</span>
                  </button>

                  <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.08)]">
                    <p className="text-xs text-[#86868B] text-center">
                      PandaDuckPix Admin Mobile
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
