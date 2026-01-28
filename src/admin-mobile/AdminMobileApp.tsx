import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/admin/contexts/AuthContext'
import { LoginPage } from '@/admin/components/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RepairRequestsPage from './pages/RepairRequestsPage'
import ReviewsPage from './pages/ReviewsPage'
import ModelServicePage from './pages/ModelServicePage'
import SettingsPage from './pages/SettingsPage'

function AdminMobileContent() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">인증 확인 중...</p>
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
      <Route path="repair-requests" element={<RepairRequestsPage />} />
      <Route path="reviews" element={<ReviewsPage />} />
      <Route path="model-service" element={<ModelServicePage />} />
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
