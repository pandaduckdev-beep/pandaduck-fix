import { ReactNode } from 'react'
import {
  LayoutDashboard,
  Wrench,
  Gamepad2,
  ClipboardList,
  Star,
  LogOut,
  TrendingUp,
  Receipt,
  Tag,
  FileText,
  CalendarDays,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

interface AdminLayoutProps {
  children: ReactNode
}

const navItems = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { divider: true },
  { id: 'repairs', label: '수리 신청', icon: ClipboardList },
  { id: 'schedule', label: '일정 관리', icon: CalendarDays },
  { id: 'repair-logs', label: '수리 작업기', icon: FileText },
  { divider: true },
  { id: 'reviews', label: '리뷰 관리', icon: Star },
  { divider: true },
  { id: 'revenue', label: '매출 통계', icon: TrendingUp },
  { id: 'expenses', label: '지출 관리', icon: Receipt },
  { divider: true },
  { id: 'controllers', label: '컨트롤러 모델', icon: Gamepad2 },
  { id: 'services', label: '서비스 관리', icon: Wrench },
  { id: 'discounts', label: '할인 설정', icon: Tag },
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPage = location.pathname.split('/')[2] || 'dashboard'
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold">PandaDuck Fix</h1>
          <p className="text-sm text-gray-600">관리자 페이지</p>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item, index) => {
            // Render divider
            if ('divider' in item && item.divider) {
              return <div key={`divider-${index}`} className="h-px bg-gray-200 my-2"></div>
            }

            // Render menu item
            const Icon = item.icon
            const isActive = currentPage === item.id

            return (
              <button
                key={item.id}
                onClick={() => navigate(`/admin/${item.id === 'dashboard' ? '' : item.id}`)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
