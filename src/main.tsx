import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './app/App.tsx'
import { HomeScreen } from './app/components/HomeScreen'
import { ControllerSelection } from './app/components/ControllerSelection'
import { ServiceSelection } from './app/components/ServiceSelection'
import { RepairForm } from './app/components/RepairForm'
import { ServicesPage } from './app/components/ServicesPage'
import { ReviewsPage } from './app/components/ReviewsPage'
import { AboutPage } from './app/components/AboutPage'
import { ReviewPage } from './pages/ReviewPage'
import { AdminApp } from './admin/AdminApp.tsx'
import './styles/index.css'
import './test-supabase'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<HomeScreen />} />
        <Route path="controllers" element={<ControllerSelection />} />
        <Route path="services" element={<ServiceSelection />} />
        <Route path="repair/form" element={<RepairForm />} />
        <Route path="services/list" element={<ServicesPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>
      <Route path="/review/:token" element={<ReviewPage />} />
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  </BrowserRouter>
)
