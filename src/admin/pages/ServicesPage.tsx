import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Plus,
  Settings,
  GripVertical,
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
import { toast } from 'sonner'
import { AddServiceModal } from '../components/AddServiceModal'
import { ServiceOptionsModal } from '../components/ServiceOptionsModal'
import { EditServiceModal } from '../components/EditServiceModal'
import type { ControllerModel, ControllerServiceWithOptions } from '@/types/database'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

interface SortableRowProps {
  service: ControllerServiceWithOptions
  onToggleStatus: (id: string, status: boolean) => void
  onEdit: (service: ControllerServiceWithOptions) => void
  onOpenOptions: (service: ControllerServiceWithOptions) => void
}

function SortableRow({ service, onToggleStatus, onEdit, onOpenOptions }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: service.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded inline-flex"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            {(() => {
              const IconComponent = iconMap[service.icon_name || service.service_id] || Gamepad2
              return <IconComponent className="w-5 h-5 text-gray-700" />
            })()}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{service.name}</div>
            <div className="text-sm text-gray-600">{service.description}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm font-semibold">
        ₩
        {(service.options && service.options.length > 0
          ? Math.min(
              ...service.options.map(
                (option: any) =>
                  option.final_price ?? service.base_price + (option.additional_price ?? 0)
              )
            )
          : service.base_price
        ).toLocaleString()}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{service.options?.length || 0}개</td>
      <td className="px-6 py-4">
        <button
          onClick={() => onToggleStatus(service.id, service.is_active)}
          className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
            service.is_active ? 'bg-green-600' : 'bg-gray-300'
          }`}
          title={
            service.is_active ? '활성 상태 (클릭하여 비활성화)' : '비활성 상태 (클릭하여 활성화)'
          }
        >
          <span
            className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${
              service.is_active ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => onEdit(service)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          title="서비스 수정"
        >
          <Settings className="w-4 h-4" />
        </button>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => onOpenOptions(service)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
          title="옵션 관리"
        >
          <Settings className="w-4 h-4" />
        </button>
      </td>
    </tr>
  )
}

export function ServicesPage() {
  const [services, setServices] = useState<ControllerServiceWithOptions[]>([])
  const [controllers, setControllers] = useState<ControllerModel[]>([])
  const [selectedController, setSelectedController] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ControllerServiceWithOptions | null>(null)

  useEffect(() => {
    loadControllers()
  }, [])

  useEffect(() => {
    loadServices()
  }, [selectedController])

  const loadControllers = async () => {
    try {
      const { data, error } = await supabase
        .from('controller_models')
        .select('*')
        .order('model_name', { ascending: true })

      if (error) throw error
      setControllers(data || [])

      if (!selectedController && data && data.length > 0) {
        setSelectedController(data[0].id)
      }
    } catch (error) {
      console.error('Failed to load controllers:', error)
    }
  }

  const loadServices = async () => {
    setLoading(true)
    try {
      if (!selectedController) {
        setServices([])
        return
      }

      const { data, error } = await supabase
        .from('controller_services')
        .select('*, controller_service_options(*)')
        .eq('controller_model_id', selectedController)
        .order('display_order', { ascending: true })

      if (error) throw error

      const servicesWithOptions = (data || []).map((service) => ({
        ...service,
        options: service.controller_service_options || [],
      }))

      setServices(servicesWithOptions)
    } catch (error) {
      console.error('Failed to load services:', error)
      toast.error('서비스 로드에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('controller_services')
        .update({ is_active: !currentStatus })
        .eq('id', serviceId)

      if (error) throw error
      await loadServices()
      toast.success('서비스 상태가 변경되었습니다.')
    } catch (error) {
      console.error('Failed to toggle service status:', error)
      toast.error('서비스 상태 변경에 실패했습니다.')
    }
  }

  const handleUpdateService = async (serviceId: string, data: any) => {
    try {
      const { error } = await supabase.from('controller_services').update(data).eq('id', serviceId)

      if (error) throw error
      await loadServices()
    } catch (error) {
      console.error('Failed to update service:', error)
      throw error
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    try {
      // 소프트 삭제: is_active를 false로 변경
      // 실제 삭제하면 repair_request_services와 외래 키 충돌 발생
      const { error } = await supabase
        .from('controller_services')
        .update({ is_active: false })
        .eq('id', serviceId)

      if (error) throw error
      await loadServices()
      toast.success('서비스가 비활성화되었습니다.')
    } catch (error) {
      console.error('Failed to soft delete service:', error)
      throw error
    }
  }

  const openEditModal = (service: any) => {
    setSelectedService(service)
    setIsEditModalOpen(true)
  }

  const handleAddService = async (service: any) => {
    const newService = {
      ...service,
      controller_model_id: selectedController,
    }
    const { error } = await supabase.from('controller_services').insert(newService)

    if (error) throw error
    await loadServices()
  }

  const openOptionsModal = async (service: ControllerServiceWithOptions) => {
    try {
      const { data, error } = await supabase
        .from('controller_services')
        .select('*, controller_service_options(*)')
        .eq('id', service.id)
        .single()

      if (error) throw error

      // 옵션 목록을 설정하고 모달을 엽니다
      setSelectedService(data)
      setIsOptionsModalOpen(true)
    } catch (error) {
      console.error('Failed to load service options:', error)
      toast.error('서비스 옵션 로드에 실패했습니다.')
    }
  }

  const handleAddOption = async (option: any) => {
    const parentService = services.find((service) => service.id === selectedService?.id)
    const basePrice = parentService?.base_price || 0

    const newOption = {
      ...option,
      controller_service_id: selectedService?.id,
      additional_price:
        typeof option.final_price === 'number'
          ? Math.max(option.final_price - basePrice, 0)
          : option.additional_price,
    }
    const { data, error } = await supabase
      .from('controller_service_options')
      .insert(newOption)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const handleUpdateOption = async (id: string, data: any) => {
    const parentService = services.find((service) => service.id === selectedService?.id)
    const basePrice = parentService?.base_price || 0
    const payload = {
      ...data,
      additional_price:
        typeof data.final_price === 'number'
          ? Math.max(data.final_price - basePrice, 0)
          : data.additional_price,
    }

    const { error } = await supabase.from('controller_service_options').update(payload).eq('id', id)

    if (error) throw error
  }

  const handleDeleteOption = async (id: string) => {
    const { error } = await supabase.from('controller_service_options').delete().eq('id', id)

    if (error) throw error
  }

  const handleReorderOptions = async (newOptions: any[]) => {
    const updates = newOptions.map((option, index) => ({
      id: option.id,
      display_order: index + 1,
    }))

    for (const update of updates) {
      await supabase
        .from('controller_service_options')
        .update({ display_order: update.display_order })
        .eq('id', update.id)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = services.findIndex((s) => s.id === active.id)
    const newIndex = services.findIndex((s) => s.id === over.id)

    const newServices = arrayMove(services, oldIndex, newIndex)
    setServices(newServices)

    try {
      const updates = newServices.map((service, index) => ({
        id: service.id,
        display_order: index + 1,
      }))

      for (const update of updates) {
        await supabase
          .from('controller_services')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
      }

      toast.success('서비스 순서가 변경되었습니다.')
    } catch (error) {
      console.error('Failed to update service order:', error)
      toast.error('서비스 순서 변경에 실패했습니다.')
      await loadServices() // 실패 시 다시 로드
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">서비스 관리</h1>
        <button
          disabled={!selectedController || loading}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-5 h-5" />
          서비스 추가
        </button>
      </div>

      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        controllerModelId={selectedController}
        onAdd={handleAddService}
      />

      <EditServiceModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedService(null)
        }}
        service={selectedService}
        onUpdate={handleUpdateService}
        onDelete={handleDeleteService}
      />

      <ServiceOptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => {
          setIsOptionsModalOpen(false)
          setSelectedService(null)
        }}
        service={selectedService}
        options={selectedService?.controller_service_options || []}
        onAddOption={handleAddOption}
        onUpdateOption={handleUpdateOption}
        onDeleteOption={handleDeleteOption}
        onReorderOption={handleReorderOptions}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Controller Selector */}
        <div className="p-6 pb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            컨트롤러 모델 선택
          </label>
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
        </div>

        {selectedController && (
          <div className="px-6 py-3 text-2xl font-semibold text-gray-900">
            {controllers.find((c) => c.id === selectedController)?.model_name || '선택된 모델'}
          </div>
        )}

        <div className="p-6 pt-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-12"></th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    서비스명
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    표시 가격
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    옵션 수
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">상태</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">작업</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    옵션 관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <SortableContext
                  items={services.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {services.map((service: any) => (
                    <SortableRow
                      key={service.id}
                      service={service}
                      onToggleStatus={toggleServiceStatus}
                      onEdit={openEditModal}
                      onOpenOptions={openOptionsModal}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>

            {services.length === 0 && (
              <div className="text-center py-12 text-gray-600">등록된 서비스가 없습니다.</div>
            )}
          </DndContext>
        </div>
      </div>
    </div>
  )
}
