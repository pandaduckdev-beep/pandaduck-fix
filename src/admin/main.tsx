import React from 'react'
import ReactDOM from 'react-dom/client'
import AdminApp from './AdminApp.tsx'
import '@/styles/index.css'

ReactDOM.createRoot(document.getElementById('admin-root')!).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>,
)
