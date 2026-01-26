import {
  ChevronLeft,
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
  Tag,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useServicesWithPricing } from '@/hooks/useServicesWithPricing'
import { useServiceCombos } from '@/hooks/useServiceCombos'
import type { ServiceCombo } from '@/types/database'
import type { ControllerServiceWithPricing } from '@/types/database'
import type { ServiceSelectionData } from '@/app/App'

interface ServiceOption {
  id: string
  name: string
  price: number
  description: string
}

interface Service {
  id: string
  name: string
  description: string
  price: number
  icon: React.ReactNode
  options?: ServiceOption[]
}

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
  tool: <Cog className="w-6 h-6" />,
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

export function ServiceSelection() {
  const navigate = useNavigate()
  const location = useLocation()
  const controllerModel = location.state?.controllerModel as string | null

  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set())
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const { services: supabaseServices, loading } = useServicesWithPricing(controllerModel)
  const { combos } = useServiceCombos()

  useEffect(() => {
    if (!controllerModel) {
      navigate('/controllers')
    }

    // 페이지 진입 시 스크롤 위치를 최상단으로 이동
    window.scrollTo(0, 0)

    return () => {
      // 페이지 나갈 때 state 초기화 (캐싱 문제 해결)
      setSelectedServices(new Set())
      setSelectedOptions({})
    }
  }, [controllerModel, navigate])

  const services: Service[] = supabaseServices.map((service: ControllerServiceWithPricing) => ({
    id: service.service_id,
    name: service.name,
    description: service.description,
    price: service.pricing?.price || service.base_price,
    icon: iconMap[service.service_id] || <Gamepad2 className="w-6 h-6" />,
    options: service.options?.map((option) => ({
      id: option.id,
      name: option.option_name,
      price: option.pricing?.additional_price || option.additional_price,
      description: option.option_description,
    })),
  }))

  const toggleService = (serviceId: string) => {
    const newSelected = new Set(selectedServices)
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId)
      const newOptions = { ...selectedOptions }
      delete newOptions[serviceId]
      setSelectedOptions(newOptions)
    } else {
      newSelected.add(serviceId)
      const service = services.find((s) => s.id === serviceId)
      if (service?.options && service.options.length > 0) {
        setSelectedOptions({
          ...selectedOptions,
          [serviceId]: service.options[0].id,
        })
      }
    }
    setSelectedServices(newSelected)
  }

  const selectOption = (serviceId: string, optionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedOptions({
      ...selectedOptions,
      [serviceId]: optionId,
    })
  }

  const subtotalPrice = services
    .filter((service) => selectedServices.has(service.id))
    .reduce((sum, service) => {
      let price = service.price
      if (service.options && selectedOptions[service.id]) {
        const option = service.options.find((opt) => opt.id === selectedOptions[service.id])
        if (option) {
          price += option.price
        }
      }
      return sum + price
    }, 0)

  const applicableCombos = combos.filter((combo) => {
    const selectedServiceIds = Array.from(selectedServices)
    if (combo.combo_name.includes('3개 이상') && selectedServiceIds.length >= 3) {
      return true
    }
    return combo.required_service_ids.every((requiredId) => selectedServiceIds.includes(requiredId))
  })

  const bestCombo = applicableCombos.reduce<ServiceCombo | null>((best, current) => {
    if (!best) return current
    const currentDiscount =
      current.discount_type === 'percentage'
        ? subtotalPrice * (current.discount_value / 100)
        : current.discount_value
    const bestDiscount =
      best.discount_type === 'percentage'
        ? subtotalPrice * (best.discount_value / 100)
        : best.discount_value
    return currentDiscount > bestDiscount ? current : best
  }, null)

  const discountAmount = bestCombo
    ? bestCombo.discount_type === 'percentage'
      ? Math.floor(subtotalPrice * (bestCombo.discount_value / 100))
      : bestCombo.discount_value
    : 0

  const totalPrice = subtotalPrice - discountAmount

  const handleContinue = () => {
    if (selectedServices.size === 0) return

    const selectedServicesList = services
      .filter((service) => selectedServices.has(service.id))
      .map((service) => {
        const selectedOptionId = selectedOptions[service.id]
        const selectedOption = service.options?.find((opt) => opt.id === selectedOptionId)

        const supabaseService = supabaseServices.find((s: any) => s.service_id === service.id)

        return {
          id: service.id,
          uuid: supabaseService?.id || '',
          name: service.name,
          price: service.price,
          selectedOption: selectedOption
            ? {
                id: selectedOption.id,
                name: selectedOption.name,
                price: selectedOption.price,
              }
            : undefined,
        }
      })

    const selectionData: ServiceSelectionData = {
      services: selectedServicesList,
      subtotal: subtotalPrice,
      discount: discountAmount,
      total: totalPrice,
      discountName: bestCombo?.combo_name,
    }

    navigate('/repair/form', { state: { controllerModel, selectionData } })
  }

  return (
    <div className="min-h-screen bg-white pb-60">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/controllers')}
            className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors -ml-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-lg tracking-tight" style={{ fontWeight: 600 }}>
            서비스 선택
          </div>
          <div className="w-10"></div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-6 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center text-sm"
              style={{ fontWeight: 600 }}
            >
              1
            </div>
            <span className="text-sm" style={{ fontWeight: 600 }}>
              모델
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-[#F5F5F7] mx-3"></div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center text-sm"
              style={{ fontWeight: 600 }}
            >
              2
            </div>
            <span className="text-sm" style={{ fontWeight: 600 }}>
              서비스
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-[#F5F5F7] mx-3"></div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-[#F5F5F7] text-[#86868B] flex items-center justify-center text-sm"
              style={{ fontWeight: 600 }}
            >
              3
            </div>
            <span className="text-sm text-[#86868B]" style={{ fontWeight: 600 }}>
              배송
            </span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="max-w-md mx-auto px-6 py-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#86868B] border-t-black rounded-full animate-spin"></div>
          <p className="mt-4 text-[#86868B]">서비스 정보를 불러오는 중...</p>
        </div>
      )}

      {!loading && (
        <div className="max-w-md mx-auto px-6 space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className={`w-full p-6 rounded-[28px] border-2 transition-all ${
                selectedServices.has(service.id)
                  ? 'border-[#000000] bg-[#F5F5F7]'
                  : 'border-[rgba(0,0,0,0.1)] bg-white'
              }`}
            >
              <button onClick={() => toggleService(service.id)} className="w-full text-left">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedServices.has(service.id) ? 'bg-[#000000] text-white' : 'bg-[#F5F5F7]'
                    }`}
                  >
                    {service.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>
                      {service.name}
                    </h3>
                    <p className="text-sm text-[#86868B] mb-3">{service.description}</p>
                    <div className="text-lg" style={{ fontWeight: 600 }}>
                      ₩{service.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </button>

              {selectedServices.has(service.id) &&
                service.options &&
                service.options.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.1)] space-y-2">
                    <p className="text-sm text-[#86868B] mb-2">옵션 선택</p>
                    {service.options.map((option) => (
                      <button
                        key={option.id}
                        onClick={(e) => selectOption(service.id, option.id, e)}
                        className={`w-full text-left py-3 px-4 rounded-[16px] transition-all ${
                          selectedOptions[service.id] === option.id
                            ? 'bg-[#000000] text-white'
                            : 'bg-white hover:bg-[rgba(0,0,0,0.05)]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm" style={{ fontWeight: 600 }}>
                              {option.name}
                            </div>
                            <div
                              className={`text-xs ${
                                selectedOptions[service.id] === option.id
                                  ? 'text-[#86868B]'
                                  : 'text-[#86868B]'
                              }`}
                            >
                              {option.description}
                            </div>
                          </div>
                          <div className="text-sm" style={{ fontWeight: 700 }}>
                            {option.price === 0 ? '기본' : `+${option.price.toLocaleString()}원`}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto px-6 py-6 space-y-3">
          <div className="space-y-2">
            {bestCombo && discountAmount > 0 && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#86868B]">서비스 금액</span>
                  <span style={{ fontWeight: 600 }}>₩{subtotalPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#FF3B30]" />
                    <span className="text-[#FF3B30]">{bestCombo.combo_name}</span>
                  </div>
                  <span className="text-[#FF3B30]" style={{ fontWeight: 600 }}>
                    -₩{discountAmount.toLocaleString()}
                  </span>
                </div>
                <div className="h-px bg-[rgba(0,0,0,0.1)] my-2"></div>
              </>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[#86868B]">총 예상 금액</span>
              <span className="text-2xl" style={{ fontWeight: 700 }}>
                ₩{totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={selectedServices.size === 0}
            className={`w-full py-4 rounded-full transition-all ${
              selectedServices.size > 0
                ? 'bg-[#000000] text-white hover:scale-[0.98] active:scale-[0.96]'
                : 'bg-[#F5F5F7] text-[#86868B] cursor-not-allowed'
            }`}
            style={{ fontWeight: 600 }}
          >
            계속하기
          </button>
        </div>
      </div>
    </div>
  )
}
