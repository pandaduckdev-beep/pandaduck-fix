import { useState, useEffect } from 'react'
import { Trash2, Plus, X, Upload, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
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
import { Textarea } from '@/app/components/ui/textarea'

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
    subtitle: '',
    detailed_description: '',
    features: [] as string[],
    process_steps: [] as string[],
    duration: '',
    warranty: '',
    image_url: '',
  })
  const [newFeature, setNewFeature] = useState('')
  const [newStep, setNewStep] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (service) {
      setFormData({
        service_id: service.service_id || '',
        name: service.name || '',
        description: service.description || '',
        base_price: service.base_price || 0,
        subtitle: service.subtitle || '',
        detailed_description: service.detailed_description || '',
        features: service.features || [],
        process_steps: service.process_steps || [],
        duration: service.duration || '1일',
        warranty: service.warranty || '1년',
        image_url: service.image_url || '',
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

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      })
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    })
  }

  const addStep = () => {
    if (newStep.trim()) {
      setFormData({
        ...formData,
        process_steps: [...formData.process_steps, newStep.trim()],
      })
      setNewStep('')
    }
  }

  const removeStep = (index: number) => {
    setFormData({
      ...formData,
      process_steps: formData.process_steps.filter((_, i) => i !== index),
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('이미지 크기는 5MB 이하여야 합니다.')
      return
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드할 수 있습니다.')
      return
    }

    try {
      setUploading(true)

      // 파일명 생성 (타임스탬프 + 원본 파일명)
      const fileExt = file.name.split('.').pop()
      const fileName = `${service.service_id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from('service-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) throw error

      // Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('service-images')
        .getPublicUrl(filePath)

      // 폼 데이터에 URL 설정
      setFormData({ ...formData, image_url: publicUrl })
      toast.success('이미지가 업로드되었습니다.')
    } catch (error) {
      console.error('Failed to upload image:', error)
      toast.error('이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!formData.image_url) return

    try {
      // Supabase Storage URL에서 파일 경로 추출
      if (formData.image_url.includes('service-images')) {
        const urlParts = formData.image_url.split('service-images/')
        if (urlParts.length > 1) {
          const filePath = urlParts[1]

          // Storage에서 이미지 삭제
          const { error } = await supabase.storage
            .from('service-images')
            .remove([filePath])

          if (error) {
            console.error('Failed to delete image from storage:', error)
          }
        }
      }

      // 폼 데이터에서 URL 제거
      setFormData({ ...formData, image_url: '' })
      toast.success('이미지가 삭제되었습니다.')
    } catch (error) {
      console.error('Failed to remove image:', error)
      toast.error('이미지 삭제에 실패했습니다.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              placeholder="예: 홀 이펙트 센서"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">설명</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="서비스에 대한 간단한 설명"
            />
          </div>

          <div>
            <Label htmlFor="base_price">기본 가격 (원) *</Label>
            <Input
              id="base_price"
              type="number"
              value={formData.base_price}
              onChange={(e) =>
                setFormData({ ...formData, base_price: Number(e.target.value) || 0 })
              }
              placeholder="예: 25000"
              min="0"
              required
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">서비스 상세 정보</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="subtitle">부제목</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="예: 스틱 드리프트 영구 해결"
                />
              </div>

              <div>
                <Label htmlFor="detailed_description">상세 설명</Label>
                <Textarea
                  id="detailed_description"
                  value={formData.detailed_description}
                  onChange={(e) =>
                    setFormData({ ...formData, detailed_description: e.target.value })
                  }
                  placeholder="서비스에 대한 상세한 설명을 입력하세요"
                  rows={4}
                />
              </div>

              <div>
                <Label>주요 특징</Label>
                <div className="space-y-2 mt-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 bg-gray-50 rounded text-sm">
                        {feature}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="특징 입력"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addFeature()
                        }
                      }}
                    />
                    <Button type="button" onClick={addFeature} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label>작업 과정</Label>
                <div className="space-y-2 mt-2">
                  {formData.process_steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 px-3 py-2 bg-gray-50 rounded text-sm">{step}</div>
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newStep}
                      onChange={(e) => setNewStep(e.target.value)}
                      placeholder="작업 단계 입력"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addStep()
                        }
                      }}
                    />
                    <Button type="button" onClick={addStep} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">작업 시간</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="예: 1일"
                  />
                </div>
                <div>
                  <Label htmlFor="warranty">보증 기간</Label>
                  <Input
                    id="warranty"
                    value={formData.warranty}
                    onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                    placeholder="예: 1년"
                  />
                </div>
              </div>

              <div>
                <Label>서비스 이미지</Label>

                {/* 이미지 미리보기 */}
                {formData.image_url ? (
                  <div className="mt-2 relative">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                      title="이미지 삭제"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-4">
                      이미지를 업로드하세요 (최대 5MB)
                    </p>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50">
                        <Upload className="w-4 h-4" />
                        {uploading ? '업로드 중...' : '이미지 선택'}
                      </span>
                    </label>
                  </div>
                )}

                {/* 또는 URL 직접 입력 */}
                <div className="mt-4">
                  <Label htmlFor="image_url" className="text-sm text-gray-600">
                    또는 이미지 URL 직접 입력
                  </Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    disabled={uploading}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit">수정</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
