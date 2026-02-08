import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './app/App.tsx'
import { HomeScreen } from './app/components/HomeScreen'
import { ControllerSelection } from './app/components/ControllerSelection'
import { ServiceSelection } from './app/components/ServiceSelection'
import { RepairForm } from './app/components/RepairForm'
import { ControllerCondition } from './app/components/ControllerCondition'
import { ServicesPage } from './app/components/ServicesPage'
import { ReviewsPage } from './app/components/ReviewsPage'
import { RepairLogsPage } from './app/components/RepairLogsPage'
import { AboutPage } from './app/components/AboutPage'
import { ReviewPage } from './pages/ReviewPage'
import { AdminApp } from './admin/AdminApp.tsx'
import AdminMobileApp from './admin-mobile/AdminMobileApp'
import './styles/index.css'
import './styles/accessibility.css'
import './test-supabase'

// Admin PWA 설정
const setupAdminPWA = () => {
  const isAdminMobile = window.location.pathname.startsWith('/admin-mobile')

  if (isAdminMobile) {
    // manifest 변경
    const manifestLink = document.querySelector('link[rel="manifest"]')
    if (manifestLink) {
      manifestLink.setAttribute('href', '/admin-manifest.json')
    }

    // theme-color 변경
    const themeColor = document.querySelector('meta[name="theme-color"]')
    if (themeColor) {
      themeColor.setAttribute('content', '#007AFF')
    }

    // apple-mobile-web-app-title 변경
    const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]')
    if (appleTitle) {
      appleTitle.setAttribute('content', 'PD Admin')
    }

    // Service Worker 등록
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/admin-sw.js')
        .catch((error) => {
          console.error('Admin Service Worker registration failed:', error)
        })
    }
  }
}

// PWA 설정 실행
setupAdminPWA()

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<HomeScreen />} />
        <Route path="controllers" element={<ControllerSelection />} />
        <Route path="services" element={<ServiceSelection />} />
        <Route path="repair/condition" element={<ControllerCondition />} />
        <Route path="repair/form" element={<RepairForm />} />
        <Route path="services/list" element={<ServicesPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="repair-logs" element={<RepairLogsPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>
      <Route path="/review/:token" element={<ReviewPage />} />
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/admin-mobile/*" element={<AdminMobileApp />} />
    </Routes>
  </BrowserRouter>
)
