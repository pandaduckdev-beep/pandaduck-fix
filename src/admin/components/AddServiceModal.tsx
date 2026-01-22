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
import type { Service } from '@/types/database'
import { toast } from 'sonner'

interface AddServiceModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (service: Omit<Service, 'id'>) => Promise<void>
}

export function AddServiceModal({ isOpen, onClose, onAdd }: AddServiceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    service_id: '',
    description: '',
    base_price: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
        base_price: Number(formData.base_price) || 0,
        duration: '1-2일',
        warranty: '30일',
        features: [],
        process: [],
        icon: null,
        image_url: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      setFormData({ name: '', service_id: '', description: '', base_price: 0 })
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
            <Label htmlFor="base_price">기본 가격</Label>
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
