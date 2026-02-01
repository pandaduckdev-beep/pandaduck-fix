import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Tag, Percent } from 'lucide-react'
import type { ServiceCombo, ControllerModel } from '@/types/database'

interface ServiceComboWithController extends ServiceCombo {
  controller_models?: {
    model_name: string
  }
}

export function DiscountsPage() {
  const [combos, setCombos] = useState<ServiceComboWithController[]>([])
  const [controllers, setControllers] = useState<ControllerModel[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCombo, setEditingCombo] = useState<ServiceComboWithController | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load combos
      const { data: combosData, error: combosError } = await supabase
        .from('service_combos')
        .select('*, controller_models(model_name)')
        .order('priority', { ascending: false })

      if (combosError) throw combosError

      // Load controllers
      const { data: controllersData, error: controllersError } = await supabase
        .from('controller_models')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (controllersError) {
        console.error('Controller load error:', controllersError)
        throw controllersError
      }

      console.log('Loaded controllers:', controllersData)

      setCombos(combosData || [])
      setControllers(controllersData || [])
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('데이터 로드에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase.from('service_combos').delete().eq('id', id)

      if (error) throw error

      toast.success('할인이 삭제되었습니다.')
      loadData()
    } catch (error) {
      console.error('Failed to delete combo:', error)
      toast.error('삭제에 실패했습니다.')
    }
  }

  const handleToggleActive = async (combo: ServiceComboWithController) => {
    try {
      const { error } = await supabase
        .from('service_combos')
        .update({ is_active: !combo.is_active })
        .eq('id', combo.id)

      if (error) throw error

      toast.success(combo.is_active ? '할인이 비활성화되었습니다.' : '할인이 활성화되었습니다.')
      loadData()
    } catch (error) {
      console.error('Failed to toggle combo:', error)
      toast.error('상태 변경에 실패했습니다.')
    }
  }

  const handleEdit = (combo: ServiceComboWithController) => {
    setEditingCombo(combo)
    setShowModal(true)
  }

  const handleAdd = () => {
    setEditingCombo(null)
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">할인 설정</h1>
          <p className="text-gray-600 mt-1">서비스 조합 할인을 관리합니다</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          <Plus className="w-5 h-5" />
          할인 추가
        </button>
      </div>

      {/* Combos List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      ) : combos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Tag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">등록된 할인이 없습니다</p>
          <button
            onClick={handleAdd}
            className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            첫 할인 추가하기
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  할인명
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  컨트롤러
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  할인 타입
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  할인 금액
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  조건
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {combos.map((combo) => (
                <tr key={combo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{combo.combo_name}</div>
                    {combo.description && (
                      <div className="text-sm text-gray-600 mt-1">{combo.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {combo.controller_models?.model_name || '전체'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        combo.discount_type === 'percentage'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {combo.discount_type === 'percentage' ? (
                        <Percent className="w-3 h-3" />
                      ) : (
                        <Tag className="w-3 h-3" />
                      )}
                      {combo.discount_type === 'percentage' ? '퍼센트' : '정액'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {combo.discount_type === 'percentage'
                      ? `${combo.discount_value}%`
                      : `₩${Number(combo.discount_value).toLocaleString()}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {combo.min_service_count > 0
                      ? `${combo.min_service_count}개 이상`
                      : `${combo.required_service_ids?.length || 0}개 특정 서비스`}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(combo)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        combo.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {combo.is_active ? '활성' : '비활성'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(combo)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="수정"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(combo.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ComboModal
          combo={editingCombo}
          controllers={controllers}
          onClose={() => {
            setShowModal(false)
            setEditingCombo(null)
          }}
          onSuccess={() => {
            setShowModal(false)
            setEditingCombo(null)
            loadData()
          }}
        />
      )}
    </div>
  )
}

interface ComboModalProps {
  combo: ServiceComboWithController | null
  controllers: ControllerModel[]
  onClose: () => void
  onSuccess: () => void
}

function ComboModal({ combo, controllers, onClose, onSuccess }: ComboModalProps) {
  console.log('ComboModal - controllers:', controllers)
  console.log('ComboModal - controllers length:', controllers.length)

  const [formData, setFormData] = useState({
    combo_name: combo?.combo_name || '',
    description: combo?.description || '',
    discount_type: combo?.discount_type || 'percentage',
    discount_value: combo?.discount_value || 0,
    controller_model_id: combo?.controller_model_id || '',
    required_service_ids: combo?.required_service_ids || [],
    min_service_count: combo?.min_service_count || 0,
    priority: combo?.priority || 0,
    is_active: combo?.is_active ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [availableServices, setAvailableServices] = useState<any[]>([])
  const [loadingServices, setLoadingServices] = useState(false)

  // Load available services when controller is selected
  useEffect(() => {
    const loadServices = async () => {
      if (!formData.controller_model_id) {
        setAvailableServices([])
        return
      }

      setLoadingServices(true)
      try {
        const { data, error } = await supabase
          .from('controller_services')
          .select('service_id, name')
          .eq('controller_model_id', formData.controller_model_id)
          .eq('is_active', true)
          .order('display_order')

        if (error) throw error
        setAvailableServices(data || [])
      } catch (error) {
        console.error('Failed to load services:', error)
      } finally {
        setLoadingServices(false)
      }
    }

    loadServices()
  }, [formData.controller_model_id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.combo_name.trim()) {
      toast.error('할인명을 입력해주세요.')
      return
    }

    if (formData.discount_value <= 0) {
      toast.error('할인 금액을 입력해주세요.')
      return
    }

    if (formData.min_service_count === 0 && formData.required_service_ids.length === 0) {
      toast.error('할인 조건을 설정해주세요.')
      return
    }

    setLoading(true)
    try {
      const data = {
        ...formData,
        controller_model_id: formData.controller_model_id || null,
      }

      if (combo) {
        const { error } = await supabase.from('service_combos').update(data).eq('id', combo.id)
        if (error) throw error
        toast.success('할인이 수정되었습니다.')
      } else {
        const { error } = await supabase.from('service_combos').insert(data)
        if (error) throw error
        toast.success('할인이 추가되었습니다.')
      }

      onSuccess()
    } catch (error) {
      console.error('Failed to save combo:', error)
      toast.error('저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const addServiceId = () => {
    if (!serviceIdInput.trim()) return
    if (formData.required_service_ids.includes(serviceIdInput)) {
      toast.error('이미 추가된 서비스 ID입니다.')
      return
    }
    setFormData({
      ...formData,
      required_service_ids: [...formData.required_service_ids, serviceIdInput.trim()],
    })
    setServiceIdInput('')
  }

  const removeServiceId = (id: string) => {
    setFormData({
      ...formData,
      required_service_ids: formData.required_service_ids.filter((sid) => sid !== id),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <h2 className="text-xl font-bold">{combo ? '할인 수정' : '할인 추가'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Combo Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              할인명 *
            </label>
            <input
              type="text"
              value={formData.combo_name}
              onChange={(e) => setFormData({ ...formData, combo_name: e.target.value })}
              placeholder="예: 3개 이상 서비스 할인"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">설명</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="할인에 대한 설명을 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 min-h-[80px]"
            />
          </div>

          {/* Controller Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              컨트롤러 (선택) {controllers.length > 0 && `(${controllers.length}개)`}
            </label>
            <select
              value={formData.controller_model_id}
              onChange={(e) =>
                setFormData({ ...formData, controller_model_id: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400"
            >
              <option value="">전체 컨트롤러</option>
              {controllers.length === 0 ? (
                <option disabled>컨트롤러 로딩 중...</option>
              ) : (
                controllers.map((controller) => (
                  <option key={controller.id} value={controller.id}>
                    {controller.model_name}
                  </option>
                ))
              )}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              특정 컨트롤러에만 적용하려면 선택하세요
              {controllers.length === 0 && ' (컨트롤러가 로드되지 않았습니다)'}
            </p>
          </div>

          {/* Discount Type and Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                할인 타입 *
              </label>
              <select
                value={formData.discount_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount_type: e.target.value as 'percentage' | 'fixed',
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400"
              >
                <option value="percentage">퍼센트 (%)</option>
                <option value="fixed">정액 (원)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                할인 금액 *
              </label>
              <input
                type="number"
                value={formData.discount_value || ''}
                onChange={(e) =>
                  setFormData({ ...formData, discount_value: Number(e.target.value) })
                }
                placeholder={formData.discount_type === 'percentage' ? '10' : '5000'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400"
                min="0"
                step={formData.discount_type === 'percentage' ? '1' : '100'}
                required
              />
            </div>
          </div>

          {/* Condition Type */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">할인 조건</h3>

            {/* Discount Condition Type Selector */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">할인 조건 타입</label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, min_service_count: 0 })}
                  className={`p-4 border-2 rounded-lg text-left transition ${
                    formData.min_service_count === 0
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 mb-1">특정 서비스 조합</div>
                  <div className="text-xs text-gray-600">
                    홀센서 + 클릭키 함께 선택 시
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, min_service_count: 3 })}
                  className={`p-4 border-2 rounded-lg text-left transition ${
                    formData.min_service_count > 0
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 mb-1">개수 기반</div>
                  <div className="text-xs text-gray-600">
                    3개 이상 서비스 선택 시
                  </div>
                </button>
              </div>

              {formData.min_service_count > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    최소 서비스 개수
                  </label>
                  <input
                    type="number"
                    value={formData.min_service_count || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, min_service_count: Number(e.target.value) || 0 })
                    }
                    placeholder="예: 3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400"
                    min="1"
                  />
                  <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
                    <strong>💡 사용 예시:</strong> "3"을 입력하면 고객이 아무 서비스나 3개 이상 선택했을 때 할인이 적용됩니다.
                  </div>
                </div>
              )}
            </div>

            {/* Required Service IDs */}
            {formData.min_service_count === 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  필수 서비스 선택
                </label>

                {!formData.controller_model_id ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                    먼저 컨트롤러를 선택하세요
                  </div>
                ) : loadingServices ? (
                  <div className="text-center py-4 text-gray-500">서비스 로딩 중...</div>
                ) : availableServices.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
                    해당 컨트롤러에 등록된 서비스가 없습니다
                  </div>
                ) : (
                  <>
                    <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                      {availableServices.map((service) => {
                        const isSelected = formData.required_service_ids.includes(
                          service.service_id
                        )
                        return (
                          <label
                            key={service.service_id}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0 ${
                              isSelected ? 'bg-blue-50' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    required_service_ids: [
                                      ...formData.required_service_ids,
                                      service.service_id,
                                    ],
                                  })
                                } else {
                                  setFormData({
                                    ...formData,
                                    required_service_ids: formData.required_service_ids.filter(
                                      (id) => id !== service.service_id
                                    ),
                                  })
                                }
                              }}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{service.name}</div>
                              <div className="text-xs text-gray-500">{service.service_id}</div>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      선택한 서비스: {formData.required_service_ids.length}개
                    </p>
                  </>
                )}

                {formData.required_service_ids.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-medium text-gray-700 mb-2">
                      선택된 서비스 조합:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.required_service_ids.map((id) => {
                        const service = availableServices.find((s) => s.service_id === id)
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 text-gray-800 rounded-full text-sm"
                          >
                            {service?.name || id}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                  <strong>💡 사용 예시:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>홀센서 + 클릭키를 함께 선택 → 두 서비스를 모두 선택하면 할인</li>
                    <li>백버튼 + 헤어트리거 조합 → 두 서비스를 모두 선택하면 할인</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">우선순위</label>
            <input
              type="number"
              value={formData.priority || ''}
              onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) || 0 })}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400"
            />
            <p className="text-xs text-gray-500 mt-1">
              높을수록 먼저 적용됩니다 (여러 할인이 동시에 적용 가능할 때)
            </p>
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              활성화
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? '저장 중...' : combo ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
