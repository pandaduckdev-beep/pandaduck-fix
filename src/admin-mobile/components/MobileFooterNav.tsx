import { useNavigate, useLocation } from 'react-router-dom'
import {
  Dashboard as DashboardIcon,
  Build,
  RateReview,
  SettingsSuggest,
  Settings,
} from '@mui/icons-material'

const navItems = [
  { path: '/admin-mobile/dashboard', label: '홈', icon: DashboardIcon },
  { path: '/admin-mobile/repair-requests', label: '수리신청', icon: Build },
  { path: '/admin-mobile/reviews', label: '리뷰', icon: RateReview },
  { path: '/admin-mobile/model-service', label: '모델/서비스', icon: SettingsSuggest },
  { path: '/admin-mobile/settings', label: '설정', icon: Settings },
]

export function MobileFooterNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 px-6 py-3 z-50">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          const Icon = item.icon

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-primary dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <Icon fontSize="small" />
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
