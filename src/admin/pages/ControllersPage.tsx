import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Check, X, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import type { ControllerModel } from '@/types/database'
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

interface ControllerFormData {
  model_name: string
  model_id: string
  description: string
  display_order: number
  is_active: boolean
}

interface SortableRowProps {
  controller: ControllerModel
  onToggleStatus: (id: string, status: boolean) => void
  onEdit: (controller: ControllerModel) => void
  onEditClick?: () => void
}

function SortableRow({ controller, onToggleStatus, onEdit, onEditClick }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: controller.id,
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
      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{controller.display_order}</td>
      <td className="px-6 py-4">
        <div className="font-semibold text-gray-900">{controller.model_name}</div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{controller.model_id}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{controller.description || '-'}</td>
      <td className="px-6 py-4">
        <button
          onClick={() => onToggleStatus(controller.id, controller.is_active)}
          className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
            controller.is_active ? 'bg-green-600' : 'bg-gray-300'
          }`}
          title={
            controller.is_active ? '활성 상태 (클릭하여 비활성화)' : '비활성 상태 (클릭하여 활성화)'
          }
        >
          <span
            className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${
              controller.is_active ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditClick?.() || onEdit(controller)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            title="수정"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

export function ControllersPage() {
  const [controllers, setControllers] = useState<ControllerModel[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingController, setEditingController] = useState<ControllerModel | null>(null)
  const [formData, setFormData] = useState<ControllerFormData>({
    model_name: '',
    model_id: '',
    description: '',
    display_order: 0,
    is_active: true,
  })

  useEffect(() => {
    loadControllers()
  }, [])

  const loadControllers = async () => {
    try {
      const { data, error } = await supabase
        .from('controller_models')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setControllers(data || [])
    } catch (error) {
      console.error('Failed to load controllers:', error)
      toast.error('컨트롤러 로딩에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const toggleControllerStatus = async (controllerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('controller_models')
        .update({ is_active: !currentStatus })
        .eq('id', controllerId)

      if (error) throw error
      await loadControllers()
      toast.success(
        !currentStatus ? '컨트롤러가 활성화되었습니다.' : '컨트롤러가 비활성화되었습니다.'
      )
    } catch (error) {
      console.error('Failed to toggle controller status:', error)
      toast.error('컨트롤러 상태 변경에 실패했습니다.')
    }
  }

  const handleDelete = async (controllerId: string) => {
    if (!confirm('정말 이 컨트롤러 모델을 삭제하시겠습니까?')) {
      return
    }

    try {
      const { error } = await supabase.from('controller_models').delete().eq('id', controllerId)

      if (error) throw error
      await loadControllers()
      setShowModal(false)
      toast.success('컨트롤러 모델이 삭제되었습니다.')
    } catch (error) {
      console.error('Failed to delete controller:', error)
      toast.error('컨트롤러 삭제에 실패했습니다.')
    }
  }

  const openAddModal = () => {
    setEditingController(null)
    setFormData({
      model_name: '',
      model_id: '',
      description: '',
      display_order: controllers.length + 1,
      is_active: true,
    })
    setShowModal(true)
  }

  const openEditModal = (controller: ControllerModel) => {
    setEditingController(controller)
    setFormData({
      model_name: controller.model_name,
      model_id: controller.model_id,
      description: controller.description || '',
      display_order: controller.display_order,
      is_active: controller.is_active,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingController(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingController) {
        // 수정
        const { data, error } = await supabase
          .from('controller_models')
          .update({
            model_name: formData.model_name,
            description: formData.description,
            display_order: formData.display_order,
            is_active: formData.is_active,
          })
          .eq('id', editingController.id)

        if (error) throw error
        toast.success('컨트롤러가 수정되었습니다.')
      } else {
        // 추가
        const { data, error } = await supabase.from('controller_models').insert({
          model_name: formData.model_name,
          model_id: formData.model_id,
          description: formData.description,
          display_order: formData.display_order,
          is_active: formData.is_active,
        })

        if (error) throw error
        toast.success('컨트롤러가 추가되었습니다.')
      }

      closeModal()
      await loadControllers()
    } catch (error) {
      console.error('Failed to save controller:', error)
      toast.error('컨트롤러 저장에 실패했습니다.')
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

    const oldIndex = controllers.findIndex((c) => c.id === active.id)
    const newIndex = controllers.findIndex((c) => c.id === over.id)
    const newControllers = arrayMove(controllers, oldIndex, newIndex)
    setControllers(newControllers)

    // Update display_order in database
    try {
      const updates = newControllers.map((controller, index) => ({
        id: controller.id,
        display_order: index + 1,
      }))

      for (const update of updates) {
        await supabase
          .from('controller_models')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
      }

      toast.success('컨트롤러 순서가 변경되었습니다.')
    } catch (error) {
      console.error('Failed to update controller order:', error)
      toast.error('순서 변경에 실패했습니다.')
      await loadControllers()
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
        <h1 className="text-3xl font-bold">컨트롤러 모델 관리</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <Plus className="w-5 h-5" />
          모델 추가
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-12"></th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">순서</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">모델명</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">설명</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">상태</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <SortableContext
                items={controllers.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {controllers.map((controller: ControllerModel) => (
                  <SortableRow
                    key={controller.id}
                    controller={controller}
                    onToggleStatus={toggleControllerStatus}
                    onEdit={openEditModal}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>

          {controllers.length === 0 && (
            <div className="text-center py-12 text-gray-600">등록된 컨트롤러 모델이 없습니다.</div>
          )}
        </DndContext>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingController ? '컨트롤러 수정' : '컨트롤러 추가'}
              </h2>
              {editingController && (
                <button
                  onClick={() => handleDelete(editingController.id)}
                  className="text-red-600 hover:text-red-700 font-medium transition"
                >
                  삭제
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">모델명 *</label>
                <input
                  type="text"
                  value={formData.model_name}
                  onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 outline-none"
                  placeholder="예: DualSense"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  모델 ID * {editingController && '(수정 불가)'}
                </label>
                <input
                  type="text"
                  value={formData.model_id}
                  onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                  required
                  disabled={!!editingController}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 outline-none disabled:bg-gray-100"
                  placeholder="예: dualsense"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 outline-none"
                  placeholder="컨트롤러 설명"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">표시 순서</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-700">활성화</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                >
                  {editingController ? '수정' : '추가'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
