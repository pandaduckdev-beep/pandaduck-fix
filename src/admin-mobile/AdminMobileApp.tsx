import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/admin/contexts/AuthContext'
import { LoginPage } from '@/admin/components/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RepairRequestsPage from './pages/RepairRequestsPage'
import ReviewsPage from './pages/ReviewsPage'
import ModelServicePage from './pages/ModelServicePage'
import SettingsPage from './pages/SettingsPage'

function AdminMobileContent() {
  const { isAuthenticated } = useAuth()

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
