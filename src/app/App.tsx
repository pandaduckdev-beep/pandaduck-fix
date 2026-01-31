import { Outlet } from 'react-router-dom'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export interface SelectedService {
  id: string // service_id (TEXT)
  uuid: string // controller_services.id (UUID)
  name: string
  price: number
  selectedOption?: {
    id: string // controller_service_options.id (UUID)
    name: string
    price: number
  }
}

export interface ServiceSelectionData {
  services: SelectedService[]
  subtotal: number
  discount: number
  total: number
  discountName?: string
}

export interface ConditionData {
  conditions: string[]
  notes: string
}

export default function App() {
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  )
}
