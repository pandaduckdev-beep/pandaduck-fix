import { useState } from 'react'
import { X } from 'lucide-react'
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
import { toast } from 'sonner'

interface AddServiceModalProps {
  isOpen: boolean
  onClose: () => void
  controllerModelId: string
  onAdd: (service: {
    name: string
    service_id: string
    description: string
    summary: string
    detail_tags: string[]
    expected_results: string[]
    base_price: number
    is_active: boolean
    display_order: number
    controller_model_id: string
  }) => Promise<void>
}

export function AddServiceModal({
  isOpen,
  onClose,
  controllerModelId,
  onAdd,
}: AddServiceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    service_id: '',
    description: '',
    summary: '',
    detail_tags: '',
    expected_results: '',
    base_price: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!controllerModelId) {
      toast.error('컨트롤러 모델을 먼저 선택해주세요.')
      return
    }

    if (!formData.name.trim()) {
      toast.error('서비스명을 입력해주세요.')
      return
    }

    if (!formData.service_id.trim()) {
      toast.error('서비스 ID를 입력해주세요.')
      return
    }

    try {
      await onAdd({
        name: formData.name,
        service_id: formData.service_id,
        description: formData.description,
        summary: formData.summary,
        detail_tags: formData.detail_tags
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        expected_results: formData.expected_results
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        base_price: Number(formData.base_price) || 0,
        is_active: true,
        display_order: 0,
        controller_model_id: controllerModelId,
      })

      setFormData({
        name: '',
        service_id: '',
        description: '',
        summary: '',
        detail_tags: '',
        expected_results: '',
        base_price: 0,
      })
      toast.success('서비스가 추가되었습니다.')
      onClose()
    } catch (error) {
      console.error('Failed to add service:', error)
      toast.error('서비스 추가에 실패했습니다.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>서비스 추가</DialogTitle>
          <button onClick={onClose} className="rounded-full opacity-50 hover:opacity-70 transition">
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">서비스명</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: 홀 이펙트 센서 업그레이드"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="service_id">서비스 ID</Label>
            <Input
              id="service_id"
              value={formData.service_id}
              onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
              placeholder="예: hall-effect, clicky-buttons..."
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="description">설명</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="서비스에 대한 간단 설명"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="summary">한 줄 요약</Label>
            <Input
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="선택 화면에서 보여줄 요약"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="detail_tags">상세 태그 (줄바꿈으로 구분)</Label>
            <textarea
              id="detail_tags"
              value={formData.detail_tags}
              onChange={(e) => setFormData({ ...formData, detail_tags: e.target.value })}
              placeholder={'예: 데드존 보정\n캘리브레이션'}
              className="w-full min-h-[72px] px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <Label htmlFor="expected_results">체감 변화 (줄바꿈으로 구분)</Label>
            <textarea
              id="expected_results"
              value={formData.expected_results}
              onChange={(e) => setFormData({ ...formData, expected_results: e.target.value })}
              placeholder={'예: 입력 안정감 향상\n반응성 개선'}
              className="w-full min-h-[72px] px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <Label htmlFor="base_price">단독 서비스 가격 (옵션 미사용 시)</Label>
            <Input
              id="base_price"
              type="number"
              value={formData.base_price}
              onChange={(e) =>
                setFormData({ ...formData, base_price: Number(e.target.value) || 0 })
              }
              placeholder="0"
              min="0"
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={!formData.name || !formData.service_id}>
              추가
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
