import { useState } from 'react'
import { Plus, Trash2, Edit, X, Check, PlusCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/button'
import type { ControllerServiceWithOptions } from '@/types/database'

interface ServiceOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  service: ControllerServiceWithOptions | null
  options: any[]
  onAddOption: (option: any) => Promise<void>
  onUpdateOption: (id: string, data: any) => Promise<void>
  onDeleteOption: (id: string) => Promise<void>
}

export function ServiceOptionsModal({
  isOpen,
  onClose,
  service,
  options,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
}: ServiceOptionsModalProps) {
  const [formData, setFormData] = useState({
    option_name: '',
    option_description: '',
    additional_price: 0,
  })

  const [editingOptionId, setEditingOptionId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<{
    option_name?: string
    option_description?: string
    additional_price?: number
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.option_name.trim()) {
      toast.error('옵션명을 입력해주세요.')
      return
    }

    if (!service) {
      toast.error('서비스를 선택해주세요.')
      return
    }

    try {
      await onAddOption({
        controller_service_id: service.id,
        option_name: formData.option_name,
        option_description: formData.option_description,
        additional_price: Number(formData.additional_price) || 0,
        is_active: true,
      })

      setFormData({ option_name: '', option_description: '', additional_price: 0 })
      toast.success('옵션이 추가되었습니다.')
    } catch (error) {
      console.error('Failed to add option:', error)
      toast.error('옵션 추가에 실패했습니다.')
    }
  }

  const handleSaveEdit = async (optionId: string) => {
    if (!editingData) return

    try {
      await onUpdateOption(optionId, editingData)
      toast.success('옵션이 수정되었습니다.')
      setEditingOptionId(null)
      setEditingData(null)
    } catch (error) {
      console.error('Failed to update option:', error)
      toast.error('옵션 수정에 실패했습니다.')
    }
  }

  const startEditing = (option: any) => {
    setEditingOptionId(option.id)
    setEditingData({
      option_name: option.option_name,
      option_description: option.option_description,
      additional_price: option.additional_price,
    })
  }

  const cancelEditing = () => {
    setEditingOptionId(null)
    setEditingData(null)
  }

  if (!service) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>서비스 옵션 관리</DialogTitle>
        </DialogHeader>

        {service && (
          <div className="space-y-6">
            {/* 서비스 정보 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{service.name}</h3>
              <p className="text-sm text-gray-600">{service.description}</p>
              <p className="text-sm text-gray-500 mt-1">
                기본 가격: ₩{service.base_price.toLocaleString()}
              </p>
            </div>

            {/* 옵션 추가 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />새 옵션 추가
              </h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="option_name">옵션명 *</Label>
                    <Input
                      id="option_name"
                      value={formData.option_name}
                      onChange={(e) => setFormData({ ...formData, option_name: e.target.value })}
                      placeholder="예: 기본형, 굴리킷 TMR"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="additional_price">추가 가격 (원) *</Label>
                    <Input
                      id="additional_price"
                      type="number"
                      value={formData.additional_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          additional_price: Number(e.target.value) || 0,
                        })
                      }
                      placeholder="예: 15000"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="option_description">옵션 설명</Label>
                  <Input
                    id="option_description"
                    value={formData.option_description}
                    onChange={(e) =>
                      setFormData({ ...formData, option_description: e.target.value })
                    }
                    placeholder="옵션에 대한 간단 설명"
                  />
                </div>
                <Button type="submit" disabled={!formData.option_name} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  옵션 추가
                </Button>
              </form>
            </div>

            {/* 옵션 목록 */}
            <div className="space-y-2">
              <h4 className="font-medium">등록된 옵션 ({options.length}개)</h4>
              {options.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                  등록된 옵션이 없습니다.
                </div>
              ) : (
                <div className="space-y-2">
                  {options.map((option: any) => (
                    <div
                      key={option.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                    >
                      {editingOptionId === option.id ? (
                        // 편집 모드
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor={`edit_name_${option.id}`}>옵션명</Label>
                            <Input
                              id={`edit_name_${option.id}`}
                              value={editingData?.option_name || ''}
                              onChange={(e) =>
                                setEditingData({
                                  ...editingData,
                                  option_name: e.target.value,
                                })
                              }
                              className="w-full"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_desc_${option.id}`}>옵션 설명</Label>
                            <Input
                              id={`edit_desc_${option.id}`}
                              value={editingData?.option_description || ''}
                              onChange={(e) =>
                                setEditingData({
                                  ...editingData,
                                  option_description: e.target.value,
                                })
                              }
                              className="w-full"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_price_${option.id}`}>추가 가격 (원)</Label>
                            <Input
                              id={`edit_price_${option.id}`}
                              type="number"
                              value={editingData?.additional_price || ''}
                              onChange={(e) =>
                                setEditingData({
                                  ...editingData,
                                  additional_price: Number(e.target.value) || 0,
                                })
                              }
                              className="w-full"
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={cancelEditing} className="flex-1">
                              <X className="w-4 h-4" />
                              취소
                            </Button>
                            <Button
                              onClick={() => handleSaveEdit(option.id)}
                              disabled={!editingData?.option_name}
                              className="flex-1"
                            >
                              <Check className="w-4 h-4" />
                              저장
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // 보기 모드
                        <>
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{option.option_name}</div>
                              <div className="text-sm text-gray-600">
                                {option.option_description}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-sm text-gray-500">추가</div>
                                <div className="font-semibold">
                                  ₩{option.additional_price.toLocaleString()}
                                </div>
                              </div>
                              <button
                                onClick={() => startEditing(option)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                title="수정"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteOption(option.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
