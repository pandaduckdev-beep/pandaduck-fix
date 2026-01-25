import { useState, useEffect } from 'react'
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

interface EditServiceModalProps {
  isOpen: boolean
  onClose: () => void
  service: any
  onUpdate: (id: string, data: any) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function EditServiceModal({
  isOpen,
  onClose,
  service,
  onUpdate,
  onDelete,
}: EditServiceModalProps) {
  const [formData, setFormData] = useState({
    service_id: '',
    name: '',
    description: '',
    subtitle: '',
    detailed_description: '',
    duration: '1일',
    warranty: '1년',
    features: [] as string[],
    process_steps: [] as string[],
    image_url: '',
    base_price: 0,
  })

  useEffect(() => {
    if (service) {
      setFormData({
        service_id: service.service_id || '',
        name: service.name || '',
        description: service.description || '',
        subtitle: service.subtitle || '',
        detailed_description: service.detailed_description || '',
        duration: service.duration || '1일',
        warranty: service.warranty || '1년',
        features: (service.features as string[]) || [],
        process_steps: (service.process_steps as string[]) || [],
        image_url: service.image_url || '',
        base_price: service.base_price || 0,
      })
    }
  }, [service])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('서비스명을 입력해주세요.')
      return
    }

    try {
      await onUpdate(service.id, formData)
      toast.success('서비스가 수정되었습니다.')
      onClose()
    } catch (error) {
      console.error('Failed to update service:', error)
      toast.error('서비스 수정에 실패했습니다.')
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 이 서비스를 삭제하시겠습니까?')) return

    try {
      await onDelete(service.id)
      toast.success('서비스가 삭제되었습니다.')
      onClose()
    } catch (error) {
      console.error('Failed to delete service:', error)
      toast.error('서비스 삭제에 실패했습니다.')
    }
  }

  if (!service) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>서비스 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="service_id">서비스 ID *</Label>
            <Input
              id="service_id"
              value={formData.service_id}
              onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
              placeholder="예: hall-effect"
              required
            />
          </div>

          <div>
            <Label htmlFor="name">서비스명 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: 홀 이펙트 센서 업그레이드"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">설명</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="서비스에 대한 간단 설명"
            />
          </div>

          <div>
            <Label htmlFor="base_price">기본 가격 *</Label>
            <Input
              id="base_price"
              type="number"
              value={formData.base_price}
              onChange={(e) =>
                setFormData({ ...formData, base_price: Number(e.target.value) || 0 })
              }
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div>
            <Label htmlFor="subtitle">부제목</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="서비스 부제목 (선택사항)"
            />
          </div>

          <div>
            <Label htmlFor="detailed_description">상세 설명</Label>
            <textarea
              id="detailed_description"
              value={formData.detailed_description}
              onChange={(e) => setFormData({ ...formData, detailed_description: e.target.value })}
              placeholder="서비스에 대한 상세 설명"
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <Label htmlFor="duration">작업 소요 시간</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="예: 1일, 2~3일"
            />
          </div>

          <div>
            <Label htmlFor="warranty">보증 기간</Label>
            <Input
              id="warranty"
              value={formData.warranty}
              onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
              placeholder="예: 1년, 6개월"
            />
          </div>

          <div>
            <Label htmlFor="features">주요 특징 (한 줄에 하나씩)</Label>
            <textarea
              id="features"
              value={formData.features.join('\n')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  features: e.target.value.split('\n').filter((line) => line.trim() !== ''),
                })
              }
              placeholder="예:&#10;정밀한 센서 교체&#10;정품 호환 부품 사용&#10;전문 기사 작업"
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <Label htmlFor="process_steps">작업 과정 (한 줄에 하나씩)</Label>
            <textarea
              id="process_steps"
              value={formData.process_steps.join('\n')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  process_steps: e.target.value.split('\n').filter((line) => line.trim() !== ''),
                })
              }
              placeholder="예:&#10;1. 센서 분해&#10;2. 기존 센서 제거&#10;3. 새 센서 장착&#10;4. 테스트 검사"
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <Label htmlFor="image_url">이미지 URL</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} className="mr-auto">
              삭제
            </Button>
            <Button type="submit" disabled={!formData.name || !formData.service_id}>
              저장
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
