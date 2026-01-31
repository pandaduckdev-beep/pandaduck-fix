import { Menu, X, LogOut, ChevronLeft, LayoutDashboard, ClipboardList, Star, TrendingUp, Receipt, Tag, Gamepad2, Wrench } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/admin/contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

interface MobileHeaderProps {
  title: string
  showBackButton?: boolean
  onBack?: () => void
  rightAction?: React.ReactNode
}

export function MobileHeader({
  title,
  showBackButton = false,
  onBack,
  rightAction
}: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { path: '/admin-mobile', label: '대시보드', icon: LayoutDashboard },
    { path: '/admin-mobile/repairs', label: '수리 신청', icon: ClipboardList },
    { path: '/admin-mobile/reviews', label: '리뷰', icon: Star },
    { path: '/admin-mobile/revenue', label: '매출 통계', icon: TrendingUp },
    { path: '/admin-mobile/expenses', label: '지출 관리', icon: Receipt },
    { path: '/admin-mobile/controllers', label: '컨트롤러 모델', icon: Gamepad2 },
    { path: '/admin-mobile/services', label: '서비스 관리', icon: Wrench },
    { path: '/admin-mobile/discounts', label: '할인 설정', icon: Tag },
  ]

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      logout()
    }
  }

  return (
    <>
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)] safe-area-top">
        <div className="h-14 flex items-center justify-center px-5 relative">

          {/* Left: Back Button (only when needed) */}
          {showBackButton && (
            <button
              onClick={onBack}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-[#F5F5F7] rounded-full transition-ios btn-press flex items-center gap-1"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={3} />
              <span className="text-sm font-semibold text-[#007AFF]">뒤로</span>
            </button>
          )}

          {/* Center: Title */}
          <h1 className="text-ios-title text-[#1D1D1F]">{title}</h1>

          {/* Right: Actions */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {rightAction}
            {!showBackButton && (
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 hover:bg-[#F5F5F7] rounded-full transition-ios btn-press"
              >
                <Menu className="w-6 h-6 text-[#1D1D1F]" />
              </button>
            )}
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
          <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl safe-area-top">
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-[rgba(0,0,0,0.05)]">
                <span className="text-ios-title text-[#1D1D1F]">
                  메뉴
                </span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-[#F5F5F7] rounded-full transition-ios btn-press"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path

                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path)
                        setIsMenuOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-6 py-4 rounded-[20px] transition-ios btn-press font-semibold ${
                        isActive
                          ? 'bg-[#007AFF] text-white'
                          : 'text-[#1D1D1F] hover:bg-[#F5F5F7]'
                      }`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={2.5} />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  )
                })}
              </nav>

              {/* Footer */}
              <div className="border-t border-[rgba(0,0,0,0.05)]">
                <div className="px-6 py-5">
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full p-3 bg-[#F5F5F7] hover:bg-[#E8E8ED] rounded-[16px] transition-ios btn-press font-semibold text-[#1D1D1F]"
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
