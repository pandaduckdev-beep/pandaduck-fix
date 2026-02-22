import { MobileHeader } from '../components/MobileHeader'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import {
  Plus,
  Trash2,
  Edit,
  X,
  Check,
  Upload,
  Image as ImageIcon,
  GripVertical,
} from 'lucide-react'
import { useToast } from '@/hooks/useToast.tsx'

interface OptionItem {
  id: string
  option_name: string
  option_description: string
  detailed_description: string
  additional_price?: number
  final_price: number
  image_url: string
  display_order: number
}

interface EditingOption {
  id: string
  option_name: string
  option_description: string
  detailed_description: string
  final_price: number
  image_url: string
}

export default function ServiceOptionsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { warning, error } = useToast()
  const [serviceName, setServiceName] = useState('')
  const [serviceBasePrice, setServiceBasePrice] = useState(0)
  const [options, setOptions] = useState<OptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<EditingOption | null>(null)

  useEffect(() => {
    fetchServiceAndOptions()
  }, [id])

  const fetchServiceAndOptions = async () => {
    // 서비스 정보 가져오기
    const { data: serviceData } = await supabase
      .from('controller_services')
      .select('name, base_price')
      .eq('id', id)
      .single()

    if (serviceData) {
      setServiceName(serviceData.name)
      setServiceBasePrice(serviceData.base_price || 0)
    }

    // 옵션 목록 가져오기
    const { data: optionsData } = await supabase
      .from('controller_service_options')
      .select('*')
      .eq('controller_service_id', id)
      .order('display_order')

    if (optionsData) {
      setOptions(optionsData as OptionItem[])
    }
    setLoading(false)
  }

  const handleAddOption = async () => {
    const maxOrder = options.length > 0 ? Math.max(...options.map((o) => o.display_order)) : 0

    const { data } = await supabase
      .from('controller_service_options')
      .insert({
        controller_service_id: id,
        option_name: '새 옵션',
        option_description: '',
        detailed_description: '',
        additional_price: 0,
        final_price: serviceBasePrice,
        display_order: maxOrder + 1,
        is_active: true,
      })
      .select()
      .single()

    if (data) {
      setOptions([...options, data as OptionItem])
      setEditingId(data.id)
      setEditingData({
        id: data.id,
        option_name: data.option_name,
        option_description: data.option_description || '',
        detailed_description: data.detailed_description || '',
        final_price: data.final_price ?? serviceBasePrice + (data.additional_price ?? 0),
        image_url: data.image_url || '',
      })
    }
  }

  const handleSaveOption = async () => {
    if (!editingData?.option_name.trim()) {
      warning('입력 필요', '옵션명을 입력해주세요.')
      return
    }

    const { error } = await supabase
      .from('controller_service_options')
      .update({
        option_name: editingData.option_name,
        option_description: editingData.option_description,
        detailed_description: editingData.detailed_description,
        final_price: editingData.final_price,
        additional_price: Math.max(editingData.final_price - serviceBasePrice, 0),
        image_url: editingData.image_url,
      })
      .eq('id', editingId)

    if (!error) {
      setOptions(
        options.map((o) =>
          o.id === editingId
            ? {
                ...o,
                option_name: editingData.option_name,
                option_description: editingData.option_description,
                detailed_description: editingData.detailed_description,
                final_price: editingData.final_price,
                image_url: editingData.image_url,
              }
            : o
        )
      )
      setEditingId(null)
      setEditingData(null)
    }
  }

  const handleDeleteOption = async (optionId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    const { error } = await supabase.from('controller_service_options').delete().eq('id', optionId)

    if (!error) {
      setOptions(options.filter((o) => o.id !== optionId))
    }
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `service-option-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('service-option-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('service-option-images').getPublicUrl(filePath)

      setEditingData({ ...editingData!, image_url: publicUrl })
    } catch (error) {
      console.error('Failed to upload image:', error)
      error('업로드 실패', '이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const startEdit = (option: OptionItem) => {
    setEditingId(option.id)
    setEditingData({
      id: option.id,
      option_name: option.option_name,
      option_description: option.option_description || '',
      detailed_description: option.detailed_description || '',
      final_price: option.final_price ?? serviceBasePrice + (option.additional_price ?? 0),
      image_url: option.image_url || '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingData(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#007AFF] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-20">
      <MobileHeader
        title="옵션 관리"
        showBackButton
        onBack={() => navigate(-1)}
        rightAction={
          <button onClick={handleAddOption} className="p-2 bg-[#007AFF] rounded-full">
            <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>
        }
      />

      <main className="p-5">
        {/* 서비스명 표시 */}
        <div className="mb-4">
          <p className="text-[13px] text-[#86868B] font-semibold mb-1">서비스</p>
          <p className="text-[17px] font-semibold text-[#1D1D1F]">{serviceName}</p>
        </div>

        {/* 옵션 목록 */}
        <div className="space-y-3">
          {options.length === 0 ? (
            <div className="bg-[#F5F5F7] rounded-2xl p-8 text-center">
              <p className="text-[#86868B] text-sm">등록된 옵션이 없습니다</p>
            </div>
          ) : (
            options.map((option, index) => {
              const isEditing = editingId === option.id

              return (
                <div
                  key={option.id}
                  className={`bg-white rounded-2xl overflow-hidden ${isEditing ? 'p-4' : ''}`}
                >
                  {isEditing ? (
                    // 편집 모드
                    <div className="space-y-4">
                      {/* 옵션명 */}
                      <div>
                        <label className="text-[13px] text-[#86868B] font-semibold mb-2 block">
                          옵션명 *
                        </label>
                        <input
                          type="text"
                          value={editingData?.option_name || ''}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData!,
                              option_name: e.target.value,
                            })
                          }
                          placeholder="옵션명 입력"
                          className="w-full px-4 py-3 bg-white rounded-xl border border-[rgba(0,0,0,0.06)] text-[15px] focus:outline-none"
                          style={{ fontWeight: 500 }}
                        />
                      </div>

                      {/* 옵션 설명 */}
                      <div>
                        <label className="text-[13px] text-[#86868B] font-semibold mb-2 block">
                          옵션 설명 (간단)
                        </label>
                        <input
                          type="text"
                          value={editingData?.option_description || ''}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData!,
                              option_description: e.target.value,
                            })
                          }
                          placeholder="선택 화면에 표시될 간단 설명"
                          className="w-full px-4 py-3 bg-white rounded-xl border border-[rgba(0,0,0,0.06)] text-[15px] focus:outline-none"
                          style={{ fontWeight: 500 }}
                        />
                      </div>

                      {/* 상세 설명 */}
                      <div>
                        <label className="text-[13px] text-[#86868B] font-semibold mb-2 block">
                          상세 설명 (선택)
                          <span className="text-xs text-[#86868B] ml-2">서비스 상세 페이지용</span>
                        </label>
                        <textarea
                          value={editingData?.detailed_description || ''}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData!,
                              detailed_description: e.target.value,
                            })
                          }
                          placeholder="서비스 상세보기에서 표시될 자세한 설명"
                          rows={3}
                          className="w-full px-4 py-3 bg-white rounded-xl border border-[rgba(0,0,0,0.06)] text-[15px] focus:outline-none resize-none"
                          style={{ fontWeight: 500 }}
                        />
                      </div>

                      <div>
                        <label className="text-[13px] text-[#86868B] font-semibold mb-2 block">
                          옵션 최종 가격 (원)
                        </label>
                        <input
                          type="number"
                          value={editingData?.final_price ?? 0}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData!,
                              final_price: Number(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                          min="0"
                          className="w-full px-4 py-3 bg-white rounded-xl border border-[rgba(0,0,0,0.06)] text-[15px] focus:outline-none"
                          style={{ fontWeight: 500 }}
                        />
                      </div>

                      {/* 옵션 이미지 */}
                      <div>
                        <label className="text-[13px] text-[#86868B] font-semibold mb-2 block">
                          옵션 이미지 (선택)
                        </label>
                        <div className="space-y-2">
                          {editingData?.image_url && (
                            <div className="relative w-full h-32 rounded-xl overflow-hidden">
                              <img
                                src={editingData.image_url}
                                alt="옵션 이미지"
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() =>
                                  setEditingData({
                                    ...editingData!,
                                    image_url: '',
                                  })
                                }
                                className="absolute top-2 right-2 p-1.5 bg-[#FF3B30] text-white rounded-full"
                              >
                                <X className="w-4 h-4" strokeWidth={2} />
                              </button>
                            </div>
                          )}
                          <label className="flex items-center justify-center gap-2 px-4 py-3 bg-[#F5F5F7] rounded-xl cursor-pointer hover:bg-[#E8E8ED] transition-ios">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(file)
                              }}
                              disabled={uploading}
                              className="hidden"
                            />
                            <Upload className="w-5 h-5 text-[#86868B]" strokeWidth={2} />
                            <span className="text-[15px]" style={{ fontWeight: 500 }}>
                              {uploading ? '업로드 중...' : '이미지 업로드'}
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* 버튼들 */}
                      <div className="flex gap-2">
                        <button
                          onClick={cancelEdit}
                          className="flex-1 py-3 bg-[#F5F5F7] text-[#1D1D1F] rounded-xl font-semibold flex items-center justify-center gap-1"
                        >
                          <X className="w-4 h-4" strokeWidth={2} />
                          취소
                        </button>
                        <button
                          onClick={handleSaveOption}
                          disabled={!editingData?.option_name}
                          className="flex-1 py-3 bg-[#007AFF] text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <Check className="w-4 h-4" strokeWidth={2} />
                          저장
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 보기 모드
                    <>
                      <div className="flex items-start gap-3">
                        {/* 드래그 핸들 (모바일에서는 숨김) */}
                        <div className="p-1 text-[#C7C7CC]">
                          <GripVertical className="w-5 h-5" strokeWidth={2} />
                        </div>

                        {/* 이미지 */}
                        {option.image_url && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <img
                              src={option.image_url}
                              alt={option.option_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* 내용 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-[15px] font-semibold text-[#1D1D1F]">
                              {option.option_name}
                            </h3>
                            {option.image_url && (
                              <ImageIcon className="w-4 h-4 text-[#86868B]" strokeWidth={2} />
                            )}
                          </div>
                          <p className="text-[13px] text-[#86868B] line-clamp-2">
                            {option.option_description || '설명 없음'}
                          </p>
                        </div>

                        {/* 가격과 버튼 */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-[10px] text-[#86868B]">최종가</p>
                            <p className="text-[15px] font-semibold text-[#1D1D1F]">
                              ₩{(option.final_price ?? 0).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => startEdit(option)}
                            className="p-2 bg-[#F5F5F7] rounded-xl"
                          >
                            <Edit className="w-4 h-4 text-[#86868B]" strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => handleDeleteOption(option.id)}
                            className="p-2 bg-[#FFEBEE] rounded-xl"
                          >
                            <Trash2 className="w-4 h-4 text-[#FF3B30]" strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
