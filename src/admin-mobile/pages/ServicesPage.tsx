import { MobileHeader } from '../components/MobileHeader'
import { MobileFooterNav } from '../components/MobileFooterNav'
import { useEffect, useState } from 'react'
import { ControllerService, ControllerModel } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { SkeletonCard } from '@/components/common/Skeleton'
import {
  Gamepad2,
  Cpu,
  Zap,
  CircuitBoard,
  Keyboard,
  BatteryCharging,
  Power,
  Wrench,
  Hammer,
  Cog,
  RefreshCw,
  Gauge,
  Activity,
  Palette,
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

const iconMap: Record<string, any> = {
  controller: Gamepad2,
  cpu: Cpu,
  sensor: Zap,
  circuit: CircuitBoard,
  button: Keyboard,
  battery: BatteryCharging,
  charging: BatteryCharging,
  power: Power,
  voltage: Zap,
  repair: Wrench,
  hammer: Hammer,
  settings: Cog,
  tool: Cog,
  refresh: RefreshCw,
  gauge: Gauge,
  activity: Activity,
  paint: Palette,
  paintbrush: Paintbrush,
  brush: Brush,
  sparkle: Sparkles,
  star: Star,
  shield: Shield,
  check: CheckCircle,
  clock: Clock,
  package: Package,
  truck: Truck,
  award: Award,
  trophy: Trophy,
  medal: Medal,
}

interface ServiceWithOptions extends ControllerService {
  options: any[]
}

export default function ServicesPage() {
  const navigate = useNavigate()
  const [models, setModels] = useState<ControllerModel[]>([])
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [services, setServices] = useState<ServiceWithOptions[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModels()
  }, [])

  useEffect(() => {
    if (selectedModel) {
      fetchServices(selectedModel)
    }
  }, [selectedModel])

  const fetchModels = async () => {
    const { data } = await supabase
      .from('controller_models')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    if (data) {
      setModels(data as ControllerModel[])
      if (data.length > 0) {
        setSelectedModel(data[0].id)
      }
    }
    setLoading(false)
  }

  const fetchServices = async (modelId: string) => {
    const { data } = await supabase
      .from('controller_services')
      .select('*, controller_service_options(*)')
      .eq('controller_model_id', modelId)
      .order('display_order')

    if (data) {
      const servicesWithOptions = (data || []).map((service) => ({
        ...service,
        options: service.controller_service_options || [],
      }))
      setServices(servicesWithOptions as ServiceWithOptions[])
    }
  }

  const handleToggleActive = async (service: ControllerService) => {
    const { error } = await supabase
      .from('controller_services')
      .update({ is_active: !service.is_active })
      .eq('id', service.id)

    if (!error) {
      setServices(
        services.map((s) => (s.id === service.id ? { ...s, is_active: !s.is_active } : s))
      )
    }
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <MobileHeader title="서비스 관리" />

      <main className="p-5 space-y-4">
        {loading ? (
          <div className="space-y-4 py-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <div className="text-center py-4">
              <p className="text-[#86868B] text-sm font-medium">불러오는 중...</p>
            </div>
          </div>
        ) : (
          <>
            {/* 모델 선택 필터 */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`px-4 py-2 rounded-[14px] text-xs whitespace-nowrap transition-all ${
                    selectedModel === model.id
                      ? 'bg-[#007AFF] text-white'
                      : 'bg-white border border-[rgba(0,0,0,0.08)] text-[#86868B]'
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {model.model_name}
                </button>
              ))}
            </div>

            {/* 서비스 목록 */}
            <div>
              <p className="text-sm text-[#86868B] mb-3" style={{ fontWeight: 600 }}>
                총 {services.length}개의 서비스
              </p>

              {services.length === 0 ? (
                <div className="bg-[#F5F5F7] rounded-2xl p-8 text-center">
                  <p className="text-[#86868B] text-sm">서비스가 없습니다</p>
                </div>
              ) : (
                <div className="bg-[#F5F5F7] rounded-xl overflow-hidden">
                  {services.map((service, index) => {
                    const IconComponent =
                      iconMap[service.icon_name || service.service_id] || Gamepad2

                    return (
                      <div
                        key={service.id}
                        onClick={() => navigate(`/admin-mobile/services/${service.id}/edit`)}
                        className={`bg-white py-4 border-b border-[rgba(0,0,0,0.06)] px-4 active:bg-[#F5F5F7] cursor-pointer ${
                          index === services.length - 1 ? 'border-b-0' : ''
                        }`}
                      >
                        <div className="flex gap-3 items-start">
                          {/* 아이콘 */}
                          <div className="w-9 h-9 rounded-lg bg-[#F5F5F7] flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-4.5 h-4.5 text-[#1D1D1F]" strokeWidth={2} />
                          </div>

                          {/* 내용 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="text-[15px] font-semibold text-[#1D1D1F]">
                                {service.name}
                              </h3>
                              {service.options && service.options.length > 0 && (
                                <span className="text-[10px] px-2 py-0.5 bg-[#E6F2FF] text-[#007AFF] rounded-md font-semibold">
                                  옵션 +{service.options.length}
                                </span>
                              )}
                            </div>
                            <p className="text-[13px] text-[#86868B] mb-2 line-clamp-2">
                              {service.description || service.subtitle || '설명 없음'}
                            </p>
                            <p className="text-[17px] font-bold text-[#1D1D1F]">
                              ₩
                              {service.options && service.options.length > 0
                                ? Math.min(
                                    ...service.options.map(
                                      (opt: any) =>
                                        opt.final_price ??
                                        service.base_price + (opt.additional_price ?? 0)
                                    )
                                  ).toLocaleString()
                                : service.base_price.toLocaleString()}
                            </p>
                          </div>

                          {/* 우측 버튼 영역 */}
                          <div className="flex flex-col gap-2 items-end">
                            {/* 활성/비활성 토글 스위치 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleActive(service)
                              }}
                              className={`flex-shrink-0 w-12 h-7 rounded-full p-1 transition-colors ${
                                service.is_active ? 'bg-[#34C759]' : 'bg-[#C7C7CC]'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                                  service.is_active ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>

                            {/* 옵션관리 버튼 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/admin-mobile/services/${service.id}/options`)
                              }}
                              className="w-16 px-2 py-1.5 bg-[#F5F5F7] text-[#1D1D1F] text-[11px] font-semibold rounded-lg text-center"
                            >
                              옵션관리
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <MobileFooterNav />
    </div>
  )
}
