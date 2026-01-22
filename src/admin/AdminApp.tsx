import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { AdminLayout } from './components/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { ServicesPage } from './pages/ServicesPage';
import { RepairsPage } from './pages/RepairsPage';
import { ControllersPage } from './pages/ControllersPage';
import { PricingPage } from './pages/PricingPage';

function AdminContent() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AdminLayout user={user}>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="controllers" element={<ControllersPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="repairs" element={<RepairsPage />} />
        <Route path="reviews" element={<div className="text-center py-12 text-gray-600">리뷰 관리 페이지 (개발 예정)</div>} />
      </Routes>
    </AdminLayout>
  );
}

export function AdminApp() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
}

export default AdminApp;
