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
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <AdminLayout user={user}>
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
