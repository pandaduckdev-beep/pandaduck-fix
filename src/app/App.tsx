import { Outlet } from 'react-router-dom'

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

export default function App() {
  return <Outlet />
}
