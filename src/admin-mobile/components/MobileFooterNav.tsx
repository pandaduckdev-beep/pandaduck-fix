import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Wrench, Star, Boxes } from 'lucide-react'

const navItems = [
  { path: '/admin-mobile', label: '대시보드', icon: LayoutDashboard },
  { path: '/admin-mobile/repairs', label: '수리신청', icon: Wrench },
  { path: '/admin-mobile/reviews', label: '후기', icon: Star },
  { path: '/admin-mobile/models', label: '모델/서비스', icon: Boxes },
]

export function MobileFooterNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[rgba(0,0,0,0.08)] z-50 safe-area-pb">
      <div className="flex justify-around items-center px-4 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-[12px] transition-all ${
                isActive
                  ? 'text-[#1D1D1F]'
                  : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span
                className="text-[10px]"
                style={{ fontWeight: isActive ? 700 : 600 }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
