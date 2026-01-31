import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Star, Settings, Wrench } from 'lucide-react'

const mainNavItems = [
  { path: '/admin-mobile', label: '대시보드', icon: LayoutDashboard },
  { path: '/admin-mobile/repairs', label: '수리 신청', icon: ClipboardList },
  { path: '/admin-mobile/services', label: '서비스 관리', icon: Wrench },
  { path: '/admin-mobile/reviews', label: '리뷰', icon: Star },
  { path: '/admin-mobile/settings', label: '설정', icon: Settings },
]

export function MobileFooterNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[rgba(0,0,0,0.08)] z-50 safe-area-bottom">
        <div className="flex justify-around items-center px-4 py-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-[12px] transition-ios btn-press ${
                  active
                    ? 'text-[#1D1D1D]'
                    : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                <span
                  className="text-[10px]"
                  style={{ fontWeight: active ? 700 : 600 }}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
