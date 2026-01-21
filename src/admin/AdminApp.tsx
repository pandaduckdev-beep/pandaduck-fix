import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { AdminLayout } from './components/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { ServicesPage } from './pages/ServicesPage';
import { ControllersPage } from './pages/ControllersPage';
import { PricingPage } from './pages/PricingPage';

type Page = 'dashboard' | 'services' | 'controllers' | 'pricing' | 'repairs' | 'reviews';

function AdminContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'services':
        return <ServicesPage />;
      case 'controllers':
        return <ControllersPage />;
      case 'pricing':
        return <PricingPage />;
      case 'repairs':
        return <div className="text-center py-12 text-gray-600">수리 신청 관리 페이지 (개발 예정)</div>;
      case 'reviews':
        return <div className="text-center py-12 text-gray-600">리뷰 관리 페이지 (개발 예정)</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onNavigate={(page) => setCurrentPage(page as Page)}>
      {renderPage()}
    </AdminLayout>
  );
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
}
