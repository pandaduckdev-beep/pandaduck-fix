import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Check, X, Settings, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { AddServiceModal } from '../components/AddServiceModal'
import { ServiceOptionsModal } from '../components/ServiceOptionsModal'
import { EditServiceModal } from '../components/EditServiceModal'
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

interface ServiceWithOptions extends any {
  options?: any[]
}

interface SortableRowProps {
  service: any
  onToggleStatus: (id: string, status: boolean) => void
  onEdit: (service: any) => void
  onOpenOptions: (service: any) => void
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
        <div>
          <div className="font-semibold text-gray-900">{service.name}</div>
          <div className="text-sm text-gray-600">{service.description}</div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{service.service_id}</td>
      <td className="px-6 py-4 text-sm font-semibold">₩{service.base_price.toLocaleString()}</td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {service.service_options?.length || 0}개
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => onToggleStatus(service.id, service.is_active)}
          className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
            service.is_active ? 'bg-green-600' : 'bg-gray-300'
          }`}
          title={service.is_active ? '활성 상태 (클릭하여 비활성화)' : '비활성 상태 (클릭하여 활성화)'}
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
  const [services, setServices] = useState<ServiceWithOptions[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*, service_options(*)')
        .order('display_order', { ascending: true })

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Failed to load services:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
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
      const { error } = await supabase.from('services').update(data).eq('id', serviceId)

      if (error) throw error
      await loadServices()
    } catch (error) {
      console.error('Failed to update service:', error)
      throw error
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase.from('services').delete().eq('id', serviceId)

      if (error) throw error
      await loadServices()
    } catch (error) {
      console.error('Failed to delete service:', error)
      throw error
    }
  }

  const openEditModal = (service: any) => {
    setSelectedService(service)
    setIsEditModalOpen(true)
  }

  const handleAddService = async (service: any) => {
    const { error } = await supabase.from('services').insert(service)

    if (error) throw error
    await loadServices()
  }

  const openOptionsModal = async (service: any) => {
    // 최신 옵션 데이터를 다시 로드
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*, service_options(*)')
        .eq('id', service.id)
        .single()

      if (error) throw error

      console.log('Loaded service with options:', data)
      setSelectedService(data)
      setIsOptionsModalOpen(true)
    } catch (error) {
      console.error('Failed to load service options:', error)
      toast.error('서비스 옵션 로드에 실패했습니다.')
    }
  }

  const refreshSelectedService = async (serviceId: string) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*, service_options(*)')
        .eq('id', serviceId)
        .single()

      if (error) throw error
      setSelectedService(data)
    } catch (error) {
      console.error('Failed to refresh service:', error)
    }
  }

  const handleAddOption = async (option: any) => {
    const { error } = await supabase.from('service_options').insert(option)

    if (error) throw error
    await loadServices()
    await refreshSelectedService(option.service_id)
  }

  const handleUpdateOption = async (id: string, data: any) => {
    const { error } = await supabase.from('service_options').update(data).eq('id', id)

    if (error) throw error
    await loadServices()
    if (selectedService) {
      await refreshSelectedService(selectedService.id)
    }
  }

  const handleDeleteOption = async (id: string) => {
    const { error } = await supabase.from('service_options').delete().eq('id', id)

    if (error) throw error
    await loadServices()
    if (selectedService) {
      await refreshSelectedService(selectedService.id)
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

    // Update display_order in database
    try {
      const updates = newServices.map((service, index) => ({
        id: service.id,
        display_order: index + 1,
      }))

      for (const update of updates) {
        await supabase
          .from('services')
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
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-5 h-5" />
          서비스 추가
        </button>
      </div>

      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={async (service) => {
          await handleAddService(service)
          toast.success('서비스가 추가되었습니다.')
        }}
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
        options={selectedService?.service_options || []}
        onAddOption={handleAddOption}
        onUpdateOption={handleUpdateOption}
        onDeleteOption={handleDeleteOption}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-12"></th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">서비스명</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">기본 가격</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">옵션 수</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">상태</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">작업</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">옵션 관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <SortableContext items={services.map((s) => s.id)} strategy={verticalListSortingStrategy}>
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
  )
}
