import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
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

// Service Worker 등록 (개발 중에는 비활성화)
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then((registration) => {
//         console.log('Service Worker registered: ', registration)
//       })
//       .catch((registrationError) => {
//         console.log('Service Worker registration failed: ', registrationError)
//       })
//   })
// }

createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
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
  </HelmetProvider>
)
