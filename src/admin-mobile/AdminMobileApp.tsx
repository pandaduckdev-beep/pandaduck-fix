import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/admin/contexts/AuthContext'
import { LoginPage } from '@/admin/components/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RepairRequestsPage from './pages/RepairRequestsPage'
import RepairRequestDetailPage from './pages/RepairRequestDetailPage'
import ReviewsPage from './pages/ReviewsPage'
import ModelServicePage from './pages/ModelServicePage'
import SettingsPage from './pages/SettingsPage'

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
      <Route path="models" element={<ModelServicePage />} />
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
