import { Menu } from 'lucide-react'
import {
  Gamepad2,
  Cpu,
  Zap,
  CircuitBoard,
  Keyboard,
  Battery,
  BatteryCharging,
  Power,
  Wrench,
  Palette,
  Settings,
  Cog,
  Hammer,
  RefreshCw,
  Gauge,
  Activity,
  Paintbrush,
  Brush,
  Sparkles,
  Star,
  Shield,
  CheckCircle,
  Clock,
  Package,
  Truck,
  Award,
  Trophy,
  Medal,
} from 'lucide-react'
import { Footer } from '@/app/components/Footer'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MenuDrawer } from '@/app/components/MenuDrawer'
import { ServiceDetailModal } from '@/app/components/ServiceDetailModal'
import { fetchControllerModels, fetchControllerServices } from '@/lib/api'
import type {
  ControllerModel,
  ControllerServiceOption,
  ControllerServiceWithOptions,
} from '@/types/database'

// Icon mapping helper - matches admin page iconMap
const iconMap: Record<string, React.ReactNode> = {
  controller: <Gamepad2 className="w-6 h-6" />,
  cpu: <Cpu className="w-6 h-6" />,
  sensor: <Zap className="w-6 h-6" />,
  circuit: <CircuitBoard className="w-6 h-6" />,
  button: <Keyboard className="w-6 h-6" />,
  battery: <Battery className="w-6 h-6" />,
  charging: <BatteryCharging className="w-6 h-6" />,
  power: <Power className="w-6 h-6" />,
  voltage: <Zap className="w-6 h-6" />,
  repair: <Wrench className="w-6 h-6" />,
  hammer: <Hammer className="w-6 h-6" />,
  settings: <Cog className="w-6 h-6" />,
  tool: <Settings className="w-6 h-6" />,
  refresh: <RefreshCw className="w-6 h-6" />,
  gauge: <Gauge className="w-6 h-6" />,
  activity: <Activity className="w-6 h-6" />,
  paint: <Palette className="w-6 h-6" />,
  paintbrush: <Paintbrush className="w-6 h-6" />,
  brush: <Brush className="w-6 h-6" />,
  sparkle: <Sparkles className="w-6 h-6" />,
  star: <Star className="w-6 h-6" />,
  shield: <Shield className="w-6 h-6" />,
  check: <CheckCircle className="w-6 h-6" />,
  clock: <Clock className="w-6 h-6" />,
  package: <Package className="w-6 h-6" />,
  truck: <Truck className="w-6 h-6" />,
  award: <Award className="w-6 h-6" />,
  trophy: <Trophy className="w-6 h-6" />,
  medal: <Medal className="w-6 h-6" />,
}

interface ServiceDetail {
  id: string
  icon: React.ReactNode
  title: string
  subtitle: string
  description: string
  features: string[]
  process: string[]
  price: string
  duration: string
  warranty: string
  image?: string
}

export function ServicesPage() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null)
  const [services, setServices] = useState<ControllerServiceWithOptions[]>([])
  const [controllers, setControllers] = useState<ControllerModel[]>([])
  const [selectedController, setSelectedController] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadControllers()
  }, [])

  useEffect(() => {
    loadServices()
  }, [selectedController])

  const loadControllers = async () => {
    try {
      const data = await fetchControllerModels()
      setControllers(data)
      if (data.length > 0 && !selectedController) {
        setSelectedController(data[0].id)
      }
    } catch (error) {
      console.error('Failed to load controllers:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadServices = async () => {
    if (!selectedController) {
      setServices([])
      return
    }

    try {
      setLoading(true)
      const data = await fetchControllerServices(selectedController)
      setServices(data)
    } catch (error) {
      console.error('Failed to load services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInfoClick = (serviceId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const service = services.find((s) => s.service_id === serviceId)
    if (service) {
      // Transform database service to ServiceDetail format
      const serviceDetail: ServiceDetail = {
        id: service.service_id,
        icon: iconMap[service.icon_name || service.service_id] || <Gamepad2 className="w-6 h-6" />,
        title: service.name,
        subtitle: service.subtitle || '',
        description: service.detailed_description || service.description,
        features: (service.features as string[]) || [],
        process: (service.process_steps as string[]) || [],
        price: `₩${service.base_price.toLocaleString()}`,
        duration: service.duration || '1일',
        warranty: service.warranty || '1년',
        image: service.image_url || undefined,
      }
      setSelectedService(serviceDetail)
    }
  }

  const handleBookService = () => {
    setSelectedService(null)
    navigate('/services')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-lg tracking-tight"
            style={{ fontWeight: 600 }}
          >
            PandaDuck Fix
          </button>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Menu Drawer */}
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Hero */}
      <section className="max-w-md mx-auto px-6 pt-12 pb-4">
        <h1 className="text-4xl mb-4" style={{ fontWeight: 700 }}>
          제공 서비스
        </h1>
        <p className="text-lg text-[#86868B]">
          프로게이머와 열정적인 게이머를 위한
          <br />
          최고 품질의 커스터마이징 서비스
        </p>
      </section>

      <section className="max-w-md mx-auto px-6 pb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {controllers.map((controller) => (
            <button
              key={controller.id}
              onClick={() => setSelectedController(controller.id)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                selectedController === controller.id
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {controller.model_name}
            </button>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-md mx-auto px-6 pb-8">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#86868B] border-t-black rounded-full animate-spin"></div>
            <p className="mt-4 text-[#86868B]">서비스 정보를 불러오는 중...</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="bg-[#F5F5F7] rounded-[28px] p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    {iconMap[service.icon_name || service.service_id] || <Gamepad2 className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>
                      {service.name}
                    </h3>
                    <p className="text-sm text-[#86868B] mb-3">{service.description}</p>
                    <div className="text-xl mb-3" style={{ fontWeight: 700 }}>
                      ₩{service.base_price.toLocaleString()}원
                    </div>

                    {/* Options */}
                    {service.options && service.options.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.1)]">
                        <p className="text-sm mb-3" style={{ fontWeight: 600 }}>
                          선택 옵션
                        </p>
                        <div className="space-y-2">
                          {service.options.map((option: ControllerServiceOption) => (
                            <div
                              key={option.id}
                              className="bg-white rounded-[16px] p-3 flex items-center justify-between"
                            >
                              <div>
                                <div className="text-sm" style={{ fontWeight: 600 }}>
                                  {option.option_name}
                                </div>
                                <div className="text-xs text-[#86868B]">
                                  {option.option_description}
                                </div>
                              </div>
                              <div className="text-sm" style={{ fontWeight: 700 }}>
                                {option.additional_price === 0
                                  ? '기본'
                                  : `+${option.additional_price.toLocaleString()}원`}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => handleInfoClick(service.service_id, e)}
                  className="w-full bg-[#000000] text-white py-2 rounded-full transition-transform hover:scale-[0.98] active:scale-[0.96] mt-4"
                  style={{ fontWeight: 600 }}
                >
                  상세 정보
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-md mx-auto px-6 pb-12">
        <div className="bg-[#000000] text-white rounded-[28px] p-8 text-center space-y-4">
          <h3 className="text-2xl" style={{ fontWeight: 700 }}>
            지금 바로 시작하세요
          </h3>
          <p className="text-[#86868B]">
            전문가의 손길로 완벽하게 커스터마이징된
            <br />
            나만의 컨트롤러를 만나보세요
          </p>
          <button
            onClick={() => navigate('/services')}
            className="w-full bg-white text-black py-4 rounded-full transition-transform hover:scale-[0.98] active:scale-[0.96] mt-6"
            style={{ fontWeight: 600 }}
          >
            수리 신청하기
          </button>
        </div>
      </section>

      <Footer />

      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={selectedService}
        isOpen={selectedService !== null}
        onClose={() => setSelectedService(null)}
        onBookService={handleBookService}
      />
    </div>
  )
}
