import { useState } from 'react'
import { Plus, Trash2, Edit, PlusCircle } from 'lucide-react'
import type { Service, ServiceOption } from '@/types/database'
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

interface ServiceOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  service: Service | null
  options: ServiceOption[]
  onAddOption: (option: Omit<ServiceOption, 'id'>) => Promise<void>
  onUpdateOption: (id: string, data: Partial<ServiceOption>) => Promise<void>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.option_name.trim()) {
      toast.error('옵션명을 입력해주세요.')
      return
    }

    try {
      await onAddOption({
        service_id: service!.id,
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

  const handleUpdate = async (option: ServiceOption) => {
    const newPrice = prompt('추가 가격을 입력하세요:', option.additional_price.toString())
    if (newPrice === null) return

    try {
      await onUpdateOption(option.id, { additional_price: Number(newPrice) })
      toast.success('옵션이 수정되었습니다.')
    } catch (error) {
      console.error('Failed to update option:', error)
      toast.error('옵션 수정에 실패했습니다.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 옵션을 삭제하시겠습니까?')) return

    try {
      await onDeleteOption(id)
      toast.success('옵션이 삭제되었습니다.')
    } catch (error) {
      console.error('Failed to delete option:', error)
      toast.error('옵션 삭제에 실패했습니다.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
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
                  {options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{option.option_name}</div>
                        <div className="text-sm text-gray-600">{option.option_description}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">추가가</div>
                          <div className="font-semibold">
                            ₩{option.additional_price.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdate(option)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            title="가격 수정"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(option.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
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
