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
  Info,
  ChevronDown,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useServicesWithPricing } from '@/hooks/useServicesWithPricing'
import { useServiceCombos } from '@/hooks/useServiceCombos'
import { useSlideUp } from '@/hooks/useSlideUp'
import { ServiceDetailModal } from '@/app/components/ServiceDetailModal'
import type { OptionItem } from '@/app/components/OptionAccordion'
import type { ServiceCombo } from '@/types/database'
import type { ControllerServiceWithPricing } from '@/types/database'
import type { ServiceSelectionData } from '@/app/App'

interface ServiceOption {
  id: string
  name: string
  price: number
  description: string
  detailedDescription?: string
  targetAudience?: string
  imageUrl?: string
}

interface Service {
  id: string
  name: string
  subtitle: string
  summary: string
  description: string
  detailedDescription: string
  price: number
  duration: string
  warranty: string
  features: string[]
  detailTags: string[]
  expectedResults: string[]
  process: string[]
  image?: string
  icon: React.ReactNode
  options?: ServiceOption[]
}

interface SymptomOption {
  id: string
  label: string
  hint: string
  keywords: string[]
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
  const [expandedOptionDescriptions, setExpandedOptionDescriptions] = useState<
    Record<string, boolean>
  >({})
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null)
  const [detailServiceId, setDetailServiceId] = useState<string | null>(null)
  const { services: supabaseServices, loading } = useServicesWithPricing(controllerModel)
  const { combos } = useServiceCombos()
  const { setRef } = useSlideUp(supabaseServices.length + 1)

  const toStringList = (value: unknown): string[] => {
    if (!Array.isArray(value)) return []
    return value.filter((item): item is string => typeof item === 'string')
  }

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
      setExpandedOptionDescriptions({})
    }
  }, [controllerModel, navigate])

  const services: Service[] = supabaseServices.map((service: ControllerServiceWithPricing) => ({
    id: service.service_id,
    name: service.name,
    subtitle: service.subtitle || '',
    summary: service.summary || '',
    description: service.description,
    detailedDescription: service.detailed_description || service.description,
    price: service.pricing?.price || service.base_price,
    duration: service.duration || '1일',
    warranty: service.warranty || '1년',
    features: toStringList(service.features),
    detailTags: toStringList(service.detail_tags),
    expectedResults: toStringList(service.expected_results),
    process: toStringList(service.process_steps),
    image: service.image_url || undefined,
    icon: iconMap[service.icon_name || service.service_id] || <Gamepad2 className="w-6 h-6" />,
    options: service.options?.map((option) => ({
      id: option.id,
      name: option.option_name,
      price:
        option.final_price ??
        service.base_price + (option.pricing?.additional_price ?? option.additional_price ?? 0),
      description: option.option_description,
      detailedDescription: option.detailed_description || undefined,
      targetAudience: option.target_audience || undefined,
      imageUrl: option.image_url || undefined,
    })),
  }))

  const detailService = detailServiceId
    ? services.find((service) => service.id === detailServiceId)
    : null

  const detailOptions: OptionItem[] = detailService
    ? (detailService.options || []).map((option) => ({
        id: option.id,
        name: option.name,
        description: option.description,
        detailedDescription: option.detailedDescription,
        targetAudience: option.targetAudience,
        price: option.price,
        imageUrl: option.imageUrl,
      }))
    : []

  const detailPayload = detailService
    ? {
        id: detailService.id,
        icon: detailService.icon,
        title: detailService.name,
        subtitle: detailService.subtitle,
        summary: detailService.summary,
        description: detailService.detailedDescription,
        features: detailService.features,
        detailTags: detailService.detailTags,
        expectedResults: detailService.expectedResults,
        process: detailService.process,
        price: `₩${detailService.price.toLocaleString()}`,
        duration: detailService.duration,
        warranty: detailService.warranty,
        image: detailService.image,
      }
    : null

  const getServiceDisplayPrice = (service: Service) => {
    if (service.options && service.options.length > 0) {
      return Math.min(...service.options.map((opt) => opt.price))
    }
    return service.price
  }

  const getServicePriceLabel = (service: Service) => {
    const selectedOptionId = selectedOptions[service.id]

    if (service.options && service.options.length > 0) {
      if (selectedOptionId) {
        const selectedOption = service.options.find((opt) => opt.id === selectedOptionId)
        if (selectedOption) {
          return `₩${selectedOption.price.toLocaleString()}`
        }
      }

      const prices = service.options.map((opt) => opt.price)
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)

      if (minPrice !== maxPrice) {
        return `₩${minPrice.toLocaleString()} ~ ₩${maxPrice.toLocaleString()}`
      }

      return `₩${minPrice.toLocaleString()}`
    }

    return `₩${service.price.toLocaleString()}`
  }

  const symptomOptions: SymptomOption[] = [
    {
      id: 'drift',
      label: '스틱 쏠림',
      hint: '조작하지 않아도 커서/캐릭터가 움직임',
      keywords: ['스틱', '쏠림', '드리프트', '아날로그'],
    },
    {
      id: 'button',
      label: '버튼 씹힘',
      hint: '눌렀는데 입력이 안 되거나 중복 입력됨',
      keywords: ['버튼', '트리거', '범퍼', '패들', '입력'],
    },
    {
      id: 'latency',
      label: '입력 지연',
      hint: '반응이 늦거나 끊김이 느껴짐',
      keywords: ['지연', '반응', '응답', '센서', '입력'],
    },
    {
      id: 'power',
      label: '전원/충전',
      hint: '배터리, 충전, 전원 인식 문제',
      keywords: ['배터리', '충전', '전원', '포트'],
    },
  ]

  const getServiceProblemSummary = (service: Service): string => {
    if (service.summary.trim()) {
      return service.summary
    }
    return service.description || '서비스 내용을 확인해 주세요.'
  }

  const isServiceMatchedBySymptom = (service: Service, symptomId: string | null): boolean => {
    if (!symptomId) return true
    const symptom = symptomOptions.find((item) => item.id === symptomId)
    if (!symptom) return true
    const source = `${service.name} ${service.description}`.toLowerCase()
    return symptom.keywords.some((keyword) => source.includes(keyword.toLowerCase()))
  }

  const displayedServices = services.filter((service) =>
    isServiceMatchedBySymptom(service, selectedSymptom)
  )

  const getOptionKey = (serviceId: string, optionId: string) => `${serviceId}:${optionId}`

  const toggleOptionDescription = (serviceId: string, optionId: string) => {
    const key = getOptionKey(serviceId, optionId)
    setExpandedOptionDescriptions((prev: Record<string, boolean>) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const ensureServiceSelected = (serviceId: string) => {
    if (selectedServices.has(serviceId)) return

    const newSelected = new Set(selectedServices)
    newSelected.add(serviceId)
    setSelectedServices(newSelected)

    const service = services.find((item) => item.id === serviceId)
    const defaultOptionId = service?.options?.[0]?.id
    if (defaultOptionId) {
      setSelectedOptions((prev: Record<string, string>) => ({
        ...prev,
        [serviceId]: prev[serviceId] || defaultOptionId,
      }))
    }
  }

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
      if (service.options && selectedOptions[service.id]) {
        const option = service.options.find((opt) => opt.id === selectedOptions[service.id])
        if (option) {
          return sum + option.price
        }
      }
      return sum + getServiceDisplayPrice(service)
    }, 0)

  type BookingCombo = ServiceCombo & { min_service_count?: number }

  const applicableCombos = combos.filter((combo: BookingCombo) => {
    const selectedServiceIds = Array.from(selectedServices)

    // Check count-based discount (min_service_count > 0)
    if ((combo.min_service_count ?? 0) > 0) {
      return selectedServiceIds.length >= (combo.min_service_count ?? 0)
    }

    // Check specific service combination discount
    if (combo.required_service_ids && combo.required_service_ids.length > 0) {
      return combo.required_service_ids.every((requiredId: string) =>
        selectedServiceIds.includes(requiredId)
      )
    }

    return false
  })

  const bestCombo = applicableCombos.reduce<BookingCombo | null>(
    (best: BookingCombo | null, current: BookingCombo) => {
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
    },
    null
  )

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
        const selectedPrice = selectedOption
          ? selectedOption.price
          : getServiceDisplayPrice(service)

        const supabaseService = supabaseServices.find((s: any) => s.service_id === service.id)

        return {
          id: service.id,
          uuid: supabaseService?.id || '',
          name: service.name,
          price: selectedPrice,
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

    navigate('/repair/condition', { state: { controllerModel, selectionData } })
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
          <div className="flex items-center gap-1.5">
            <div
              className="w-7 h-7 rounded-full bg-[#000000] text-white flex items-center justify-center text-xs"
              style={{ fontWeight: 600 }}
            >
              1
            </div>
            <span className="text-xs" style={{ fontWeight: 600 }}>
              모델
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-[#F5F5F7] mx-2"></div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-7 h-7 rounded-full bg-[#000000] text-white flex items-center justify-center text-xs"
              style={{ fontWeight: 600 }}
            >
              2
            </div>
            <span className="text-xs" style={{ fontWeight: 600 }}>
              서비스
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-[#F5F5F7] mx-2"></div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-7 h-7 rounded-full bg-[#F5F5F7] text-[#86868B] flex items-center justify-center text-xs"
              style={{ fontWeight: 600 }}
            >
              3
            </div>
            <span className="text-xs text-[#86868B]" style={{ fontWeight: 600 }}>
              상태
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-[#F5F5F7] mx-2"></div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-7 h-7 rounded-full bg-[#F5F5F7] text-[#86868B] flex items-center justify-center text-xs"
              style={{ fontWeight: 600 }}
            >
              4
            </div>
            <span className="text-xs text-[#86868B]" style={{ fontWeight: 600 }}>
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
          <div className="rounded-[20px] border border-[rgba(0,0,0,0.08)] p-4 bg-[#FAFAFB]">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-[#86868B]" />
              <p className="text-sm" style={{ fontWeight: 600 }}>
                이런 증상인가요?
              </p>
            </div>
            <p className="text-xs text-[#86868B] mb-3">증상에 맞는 서비스만 먼저 볼 수 있어요.</p>
            <div className="-mx-1 overflow-x-auto pb-1">
              <div className="flex gap-2 px-1 min-w-max">
                <button
                  onClick={() => setSelectedSymptom(null)}
                  className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-xs transition ${
                    selectedSymptom === null
                      ? 'bg-black text-white'
                      : 'bg-white text-[#4A4A4A] border border-[rgba(0,0,0,0.1)]'
                  }`}
                >
                  전체 보기
                </button>
                {symptomOptions.map((symptom) => (
                  <button
                    key={symptom.id}
                    onClick={() => setSelectedSymptom(symptom.id)}
                    className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-xs transition ${
                      selectedSymptom === symptom.id
                        ? 'bg-black text-white'
                        : 'bg-white text-[#4A4A4A] border border-[rgba(0,0,0,0.1)]'
                    }`}
                    title={symptom.hint}
                  >
                    {symptom.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {displayedServices.length === 0 && (
            <div className="text-center py-10 text-sm text-[#86868B] bg-[#F5F5F7] rounded-[20px]">
              선택한 증상에 맞는 서비스를 찾지 못했어요. `전체 보기`로 확인해 주세요.
            </div>
          )}

          {displayedServices.map((service, index) => (
            <div
              key={service.id}
              ref={setRef(index)}
              className={`slide-up w-full p-6 rounded-[28px] border-2 transition-all ${
                selectedServices.has(service.id)
                  ? 'border-[#000000] bg-[#F5F5F7]'
                  : 'border-[rgba(0,0,0,0.1)] bg-white'
              }`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div
                className="w-full text-left cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => toggleService(service.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleService(service.id)
                  }
                }}
              >
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
                    <p className="text-xs bg-[#EDEEF2] text-[#4A4A4A] rounded-full px-3 py-1 inline-block mb-3">
                      {getServiceProblemSummary(service)}
                    </p>

                    <div className="bg-white rounded-[14px] p-3">
                      <p className="text-xs text-[#86868B] mb-1">예상 비용</p>
                      <p className="text-lg" style={{ fontWeight: 700 }}>
                        {getServicePriceLabel(service)}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDetailServiceId(service.id)
                        }}
                        className="px-3 py-1.5 rounded-full text-xs border border-[rgba(0,0,0,0.12)] bg-white text-[#4A4A4A]"
                        style={{ fontWeight: 600 }}
                      >
                        설명 보기
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {selectedServices.has(service.id) &&
                service.options &&
                service.options.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.1)] space-y-2">
                    <p className="text-sm text-[#86868B] mb-2">세부 선택</p>
                    {service.options.map((option) => {
                      const isSelectedOption = selectedOptions[service.id] === option.id
                      const optionKey = getOptionKey(service.id, option.id)
                      const isExpanded = !!expandedOptionDescriptions[optionKey]
                      const hasDetailedDescription =
                        !!option.detailedDescription &&
                        option.detailedDescription !== option.description

                      return (
                        <div
                          key={option.id}
                          className={`w-full py-3 px-4 rounded-[16px] transition-all ${
                            isSelectedOption
                              ? 'bg-[#000000] text-white'
                              : 'bg-white hover:bg-[rgba(0,0,0,0.05)]'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => selectOption(service.id, option.id, e)}
                            className="w-full text-left"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-sm" style={{ fontWeight: 600 }}>
                                  {option.name}
                                </div>
                                <div
                                  className={`text-xs ${
                                    isSelectedOption ? 'text-[#CFCFCF]' : 'text-[#86868B]'
                                  }`}
                                >
                                  {option.description}
                                </div>
                              </div>
                              <div className="text-sm" style={{ fontWeight: 700 }}>
                                {option.price === 0 ? '무료' : `${option.price.toLocaleString()}원`}
                              </div>
                            </div>
                          </button>

                          {hasDetailedDescription && (
                            <button
                              type="button"
                              onClick={() => toggleOptionDescription(service.id, option.id)}
                              className={`mt-2 text-xs inline-flex items-center gap-1 ${
                                isSelectedOption ? 'text-[#DCDCDC]' : 'text-[#666]'
                              }`}
                              style={{ fontWeight: 600 }}
                            >
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                              {isExpanded ? '자세히 접기' : '자세히 보기'}
                            </button>
                          )}

                          {hasDetailedDescription && isExpanded && (
                            <div
                              className={`mt-2 text-xs leading-relaxed ${
                                isSelectedOption ? 'text-[#DCDCDC]' : 'text-[#666]'
                              }`}
                            >
                              {option.detailedDescription}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
            </div>
          ))}
        </div>
      )}

      <ServiceDetailModal
        service={detailPayload}
        options={detailOptions}
        isOpen={detailPayload !== null}
        onClose={() => setDetailServiceId(null)}
        onBookService={() => {
          if (!detailService) return
          ensureServiceSelected(detailService.id)
          setDetailServiceId(null)
        }}
      />

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
