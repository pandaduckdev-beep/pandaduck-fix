import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LoginPage } from './components/LoginPage'
import { AdminLayout } from './components/AdminLayout'
import { Dashboard } from './pages/Dashboard'
import { ServicesPage } from './pages/ServicesPage'
import { RepairsPage } from './pages/RepairsPage'
import { ControllersPage } from './pages/ControllersPage'
import { ReviewsPage } from './pages/ReviewsPage'
import { RevenuePage } from './pages/RevenuePage'
import { ExpensesPage } from './pages/ExpensesPage'
import { DiscountsPage } from './pages/DiscountsPage'

function AdminContent() {
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
    <AdminLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="revenue" element={<RevenuePage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="controllers" element={<ControllersPage />} />
        <Route path="discounts" element={<DiscountsPage />} />
        <Route path="repairs" element={<RepairsPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
      </Routes>
    </AdminLayout>
  )
}

export function AdminApp() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  )
}

export default AdminApp
