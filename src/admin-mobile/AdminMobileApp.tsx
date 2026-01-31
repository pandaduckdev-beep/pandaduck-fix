import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/admin/contexts/AuthContext'
import { LoginPage } from '@/admin/components/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RepairRequestsPage from './pages/RepairRequestsPage'
import RepairRequestDetailPage from './pages/RepairRequestDetailPage'
import ReviewsPage from './pages/ReviewsPage'
import ReviewDetailPage from './pages/ReviewDetailPage'
import SettingsPage from './pages/SettingsPage'
import ControllerModelsPage from './pages/ControllerModelsPage'
import ServicesPage from './pages/ServicesPage'
import EditServicePage from './pages/EditServicePage'
import ServiceOptionsPage from './pages/ServiceOptionsPage'

// Placeholders for new pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="min-h-screen bg-white flex items-center justify-center p-5">
    <div className="text-center">
      <p className="text-[#86868B] text-sm" style={{ fontWeight: 600 }}>
        {title}
      </p>
      <p className="text-[#86868B] text-xs mt-2">준비 중입니다...</p>
    </div>
  </div>
)

function AdminMobileContent() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F5F5F7] border-t-[#007AFF] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#86868B] text-sm" style={{ fontWeight: 600 }}>인증 확인 중...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="repairs" element={<RepairRequestsPage />} />
      <Route path="repairs/:id" element={<RepairRequestDetailPage />} />
      <Route path="reviews" element={<ReviewsPage />} />
      <Route path="reviews/:id" element={<ReviewDetailPage />} />
      <Route path="revenue" element={<PlaceholderPage title="매출 통계" />} />
      <Route path="expenses" element={<PlaceholderPage title="지출 관리" />} />
      <Route path="controllers" element={<ControllerModelsPage />} />
      <Route path="services" element={<ServicesPage />} />
      <Route path="services/:id/edit" element={<EditServicePage />} />
      <Route path="services/:id/options" element={<ServiceOptionsPage />} />
      <Route path="discounts" element={<PlaceholderPage title="할인 설정" />} />
      <Route path="settings" element={<SettingsPage />} />
    </Routes>
  )
}

export default function AdminMobileApp() {
  return (
    <AuthProvider>
      <AdminMobileContent />
    </AuthProvider>
  )
}
