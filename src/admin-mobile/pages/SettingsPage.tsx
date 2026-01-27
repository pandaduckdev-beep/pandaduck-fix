import { MobileHeader } from '../components/MobileHeader'
import { MobileFooterNav } from '../components/MobileFooterNav'
import { useNavigate } from 'react-router-dom'
import { Person, Notifications, DarkMode, Info, Logout, ChevronRight } from '@mui/icons-material'

export default function SettingsPage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      // TODO: Implement logout logic
      navigate('/')
    }
  }

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen pb-24">
      <MobileHeader title="설정" />

      <main className="p-4 space-y-4">
        {/* Profile Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Person fontSize="medium" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white">관리자</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">admin@pandaduckfix.com</p>
            </div>
            <button className="text-blue-600 dark:text-blue-400">
              <ChevronRight fontSize="small" />
            </button>
          </div>
        </section>

        {/* Settings List */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
          <button
            onClick={() => navigate('/admin-mobile/notifications')}
            className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Notifications fontSize="small" className="text-gray-500 dark:text-gray-400" />
            <span className="flex-1 text-sm font-medium text-left">알림 설정</span>
            <ChevronRight fontSize="small" className="text-gray-400 dark:text-gray-500" />
          </button>
          <button
            onClick={toggleDarkMode}
            className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-t border-gray-50 dark:border-gray-700"
          >
            <DarkMode fontSize="small" className="text-gray-500 dark:text-gray-400" />
            <span className="flex-1 text-sm font-medium text-left">다크 모드</span>
            <div className="w-11 h-6 bg-gray-200 rounded-full relative">
              <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow"></div>
            </div>
          </button>
          <button
            onClick={() => navigate('/admin-mobile/about')}
            className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-t border-gray-50 dark:border-gray-700"
          >
            <Info fontSize="small" className="text-gray-500 dark:text-gray-400" />
            <span className="flex-1 text-sm font-medium text-left">앱 정보</span>
            <ChevronRight fontSize="small" className="text-gray-400 dark:text-gray-500" />
          </button>
        </section>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-semibold rounded-2xl flex items-center justify-center gap-2"
        >
          <Logout fontSize="small" />
          로그아웃
        </button>

        {/* Version Info */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            PandaDuck Fix Admin Mobile v1.0.0
          </p>
        </div>
      </main>

      <MobileFooterNav />
    </div>
  )
}
