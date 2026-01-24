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
    base_price: 0,
  })

  useEffect(() => {
    if (service) {
      setFormData({
        service_id: service.service_id || '',
        name: service.name || '',
        description: service.description || '',
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
