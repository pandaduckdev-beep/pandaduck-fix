import { MobileHeader } from '../components/MobileHeader'
import { MobileFooterNav } from '../components/MobileFooterNav'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/admin/contexts/AuthContext'
import { User, LogOut, ChevronRight, FileText, Gamepad2, Tag } from 'lucide-react'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const menuItems = [
    {
      title: '계정 정보',
      description: '관리자 계정 정보 수정',
      icon: User,
      action: () => navigate('/admin-mobile/profile'),
    },
  ]

  const managementMenuItems = [
    {
      title: '수리 작업기',
      description: '수리 작업 블로그 관리',
      icon: FileText,
      action: () => navigate('/admin-mobile/repair-logs'),
    },
    {
      title: '컨트롤러 모델',
      description: '컨트롤러 모델 관리',
      icon: Gamepad2,
      action: () => navigate('/admin-mobile/controllers'),
    },
    {
      title: '할인 설정',
      description: '할인 및 프로모션 관리',
      icon: Tag,
      action: () => navigate('/admin-mobile/discounts'),
    },
  ]

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      logout()
    }
  }

  return (
    <div className="bg-[#F5F5F7] min-h-screen pb-20">
      <MobileHeader title="설정" />

      <main className="p-4 space-y-4">
        {/* Profile Section */}
        <div className="bg-white rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#E6F2FF] flex items-center justify-center">
              <User className="w-7 h-7 text-[#007AFF]" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h3 className="text-base text-[#1D1D1F]" style={{ fontWeight: 700 }}>
                관리자
              </h3>
              <p className="text-xs text-[#86868B]" style={{ fontWeight: 500 }}>
                admin@pandaduckfix.com
              </p>
            </div>
          </div>
        </div>

        {/* Management Menu */}
        <div>
          <h3 className="text-xs text-[#86868B] px-4 mb-2" style={{ fontWeight: 600 }}>
            관리 메뉴
          </h3>
          <div className="bg-white rounded-2xl overflow-hidden">
            {managementMenuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#F5F5F7] transition-ios btn-press border-b border-[rgba(0,0,0,0.06)] last:border-0"
                >
                  <Icon className="w-5 h-5 text-[#007AFF]" strokeWidth={2} />
                  <div className="flex-1 text-left">
                    <p className="text-sm text-[#1D1D1F]" style={{ fontWeight: 600 }}>
                      {item.title}
                    </p>
                    <p className="text-xs text-[#86868B]" style={{ fontWeight: 500 }}>
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#86868B]" strokeWidth={2} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Account Menu */}
        <div>
          <h3 className="text-xs text-[#86868B] px-4 mb-2" style={{ fontWeight: 600 }}>
            계정
          </h3>
          <div className="bg-white rounded-2xl overflow-hidden">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#F5F5F7] transition-ios btn-press border-b border-[rgba(0,0,0,0.06)] last:border-0"
                >
                  <Icon className="w-5 h-5 text-[#86868B]" strokeWidth={2} />
                  <div className="flex-1 text-left">
                    <p className="text-sm text-[#1D1D1F]" style={{ fontWeight: 600 }}>
                      {item.title}
                    </p>
                    <p className="text-xs text-[#86868B]" style={{ fontWeight: 500 }}>
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#86868B]" strokeWidth={2} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-[#FF3B30] text-white rounded-2xl transition-all active:scale-98 flex items-center justify-center gap-2"
          style={{ fontWeight: 600 }}
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </button>

        {/* Version Info */}
        <div className="text-center py-4">
          <p className="text-xs text-[#86868B]" style={{ fontWeight: 500 }}>
            PandaDuck Fix Admin Mobile v1.0.0
          </p>
        </div>
      </main>

      <MobileFooterNav />
    </div>
  )
}
