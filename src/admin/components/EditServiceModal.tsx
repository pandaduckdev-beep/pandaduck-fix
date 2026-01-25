import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  X,
  Pencil,
  Trash2,
  Check as CheckIcon,
  Zap,
  CircuitBoard,
  Plus,
  Battery,
  Wrench,
  Palette,
  Gamepad2,
  Cpu,
  Settings,
  Cog,
  Hammer,
  Keyboard,
  BatteryCharging,
  Power,
  Shield,
  CheckCircle,
  Award,
  Trophy,
  Medal,
  Gauge,
  Activity,
  RefreshCw,
  Package,
  Truck,
  Clock,
  Paintbrush,
  Brush,
  Sparkles,
  Star,
} from 'lucide-react'
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
import { supabase } from '@/lib/supabase'

interface EditServiceModalProps {
  isOpen: boolean
  onClose: () => void
  service: any
  onUpdate: (id: string, data: any) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

interface FeatureItem {
  id: string
  text: string
  isEditing: boolean
}

interface ProcessStepItem {
  id: string
  text: string
  isEditing: boolean
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
    image_url: '',
    base_price: 0,
  })
  const [features, setFeatures] = useState<FeatureItem[]>([])
  const [processSteps, setProcessSteps] = useState<ProcessStepItem[]>([])
  const [newFeature, setNewFeature] = useState('')
  const [newProcessStep, setNewProcessStep] = useState('')
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false)

  const iconOptions = [
    { name: 'controller', icon: Gamepad2, category: 'controller' },
    { name: 'cpu', icon: Cpu, category: 'electronics' },
    { name: 'sensor', icon: Zap, category: 'electronics' },
    { name: 'circuit', icon: CircuitBoard, category: 'electronics' },
    { name: 'button', icon: Keyboard, category: 'input' },
    { name: 'plus', icon: Plus, category: 'input' },
    { name: 'battery', icon: Battery, category: 'power' },
    { name: 'charging', icon: BatteryCharging, category: 'power' },
    { name: 'power', icon: Power, category: 'power' },
    { name: 'voltage', icon: Zap, category: 'power' },
    { name: 'repair', icon: Wrench, category: 'tools' },
    { name: 'hammer', icon: Hammer, category: 'tools' },
    { name: 'settings', icon: Cog, category: 'tools' },
    { name: 'tool', icon: Settings, category: 'tools' },
    { name: 'refresh', icon: RefreshCw, category: 'tools' },
    { name: 'gauge', icon: Gauge, category: 'tools' },
    { name: 'activity', icon: Activity, category: 'tools' },
    { name: 'paint', icon: Palette, category: 'custom' },
    { name: 'paintbrush', icon: Paintbrush, category: 'custom' },
    { name: 'brush', icon: Brush, category: 'custom' },
    { name: 'sparkle', icon: Sparkles, category: 'custom' },
    { name: 'star', icon: Star, category: 'custom' },
    { name: 'shield', icon: Shield, category: 'quality' },
    { name: 'check', icon: CheckCircle, category: 'quality' },
    { name: 'clock', icon: Clock, category: 'time' },
    { name: 'package', icon: Package, category: 'delivery' },
    { name: 'truck', icon: Truck, category: 'delivery' },
    { name: 'award', icon: Award, category: 'achievement' },
    { name: 'trophy', icon: Trophy, category: 'achievement' },
    { name: 'medal', icon: Medal, category: 'achievement' },
  ]

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
        image_url: service.image_url || '',
        base_price: service.base_price || 0,
      })
      setFeatures(
        (service.features as string[])?.map((text, index) => ({
          id: `feature-${index}`,
          text,
          isEditing: false,
        })) || []
      )
      setProcessSteps(
        (service.process_steps as string[])?.map((text, index) => ({
          id: `step-${index}`,
          text,
          isEditing: false,
        })) || []
      )
      setImagePreview(service.image_url || null)
    }
  }, [service])

  const handleImageUpload = async (file: File) => {
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `service-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('service-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('service-images').getPublicUrl(filePath)

      setFormData({ ...formData, image_url: publicUrl })
      setImagePreview(publicUrl)
      toast.success('이미지가 업로드되었습니다.')
    } catch (error) {
      console.error('Failed to upload image:', error)
      toast.error('이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file)
    } else {
      toast.error('이미지 파일만 업로드할 수 있습니다.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('서비스명을 입력해주세요.')
      return
    }

    try {
      await onUpdate(service.id, {
        ...formData,
        features: features.map((f) => f.text),
        process_steps: processSteps.map((s) => s.text),
      })
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

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([
        ...features,
        {
          id: `feature-${Date.now()}`,
          text: newFeature.trim(),
          isEditing: false,
        },
      ])
      setNewFeature('')
    }
  }

  const updateFeature = (id: string, text: string) => {
    setFeatures(features.map((f) => (f.id === id ? { ...f, text } : f)))
  }

  const deleteFeature = (id: string) => {
    setFeatures(features.filter((f) => f.id !== id))
  }

  const toggleFeatureEdit = (id: string) => {
    setFeatures(features.map((f) => (f.id === id ? { ...f, isEditing: !f.isEditing } : f)))
  }

  const addProcessStep = () => {
    if (newProcessStep.trim()) {
      setProcessSteps([
        ...processSteps,
        {
          id: `step-${Date.now()}`,
          text: newProcessStep.trim(),
          isEditing: false,
        },
      ])
      setNewProcessStep('')
    }
  }

  const updateProcessStep = (id: string, text: string) => {
    setProcessSteps(processSteps.map((s) => (s.id === id ? { ...s, text } : s)))
  }

  const deleteProcessStep = (id: string) => {
    setProcessSteps(processSteps.filter((s) => s.id !== id))
  }

  const toggleProcessStepEdit = (id: string) => {
    setProcessSteps(processSteps.map((s) => (s.id === id ? { ...s, isEditing: !s.isEditing } : s)))
  }

  if (!service) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>서비스 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="service_id">서비스 ID *</Label>
            <div className="flex gap-2">
              <Input
                id="service_id"
                value={formData.service_id}
                onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                placeholder="예: hall-effect"
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setIsIconSelectorOpen(!isIconSelectorOpen)}
              >
                <Gamepad2 className="w-4 h-4" />
              </Button>
            </div>
            {isIconSelectorOpen && (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-3">원하는 아이콘을 클릭하여 선택하세요</p>
                <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto">
                  {iconOptions.map((option, index) => {
                    const IconComponent = option.icon
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            service_id: option.name,
                          })
                          setIsIconSelectorOpen(false)
                        }}
                        className={`p-3 rounded-lg hover:bg-blue-100 transition-colors ${
                          formData.service_id === option.name
                            ? 'bg-blue-100 ring-2 ring-blue-500'
                            : 'bg-white'
                        }`}
                        title={option.name}
                      >
                        <IconComponent className="w-5 h-5" />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
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
            <Label>주요 특징</Label>
            <div className="space-y-2">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-center gap-2">
                  {feature.isEditing ? (
                    <>
                      <Input
                        value={feature.text}
                        onChange={(e) => updateFeature(feature.id, e.target.value)}
                        className="flex-1"
                        placeholder="특징 입력"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleFeatureEdit(feature.id)}
                      >
                        <CheckIcon className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 flex items-start gap-2 px-3 py-2 bg-gray-100 rounded-md text-sm">
                        <CheckIcon className="w-5 h-5 text-[#000000] flex-shrink-0 mt-0.5" />
                        <span>{feature.text}</span>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleFeatureEdit(feature.id)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteFeature(feature.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="새 특징 추가"
                  className="flex-1"
                />
                <Button type="button" onClick={addFeature} disabled={!newFeature.trim()}>
                  추가
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label>작업 과정</Label>
            <div className="space-y-2">
              {processSteps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-2">
                  {step.isEditing ? (
                    <>
                      <Input
                        value={step.text}
                        onChange={(e) => updateProcessStep(step.id, e.target.value)}
                        className="flex-1"
                        placeholder="과정 입력"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleProcessStepEdit(step.id)}
                      >
                        <CheckIcon className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-gray-100 rounded-md text-sm">
                        <div
                          className="w-6 h-6 rounded-full bg-[#000000] text-white flex items-center justify-center text-xs flex-shrink-0"
                          style={{ fontWeight: 600 }}
                        >
                          {index + 1}
                        </div>
                        <span className="text-sm text-[#86868B]">{step.text}</span>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleProcessStepEdit(step.id)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteProcessStep(step.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newProcessStep}
                  onChange={(e) => setNewProcessStep(e.target.value)}
                  placeholder="새 과정 추가"
                  className="flex-1"
                />
                <Button type="button" onClick={addProcessStep} disabled={!newProcessStep.trim()}>
                  추가
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label>서비스 이미지</Label>
            <div className="space-y-3">
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Service preview"
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setFormData({ ...formData, image_url: '' })
                      setImagePreview(null)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center
                  transition-colors cursor-pointer
                  ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                  }
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {uploading ? (
                    <span className="text-sm text-gray-500">업로드 중...</span>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600">
                        {isDragging
                          ? '이미지를 놓으세요'
                          : '이미지를 드래그하거나 클릭하여 선택하세요'}
                      </p>
                      <p className="text-xs text-gray-400">JPG, PNG, GIF (최대 10MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>
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
