import { MobileHeader } from '../components/MobileHeader'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ControllerService } from '@/types/database'
import { supabase } from '@/lib/supabase'
import {
  Gamepad2,
  Cpu,
  Zap,
  CircuitBoard,
  Keyboard,
  BatteryCharging,
  Power,
  Wrench,
  Hammer,
  Cog,
  RefreshCw,
  Gauge,
  Activity,
  Palette,
  Paintbrush,
  Brush,
  Sparkles,
  Star,
  Shield,
  CheckCircle,
  Clock,
  Package,
  Truck,
  Award,
  Trophy,
  Medal,
  X,
  Check,
  Plus,
  Trash2,
  Pencil,
} from 'lucide-react'

interface ServiceWithOptions extends ControllerService {
  options: any[]
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

const iconMap: Record<string, any> = {
  controller: Gamepad2,
  cpu: Cpu,
  sensor: Zap,
  circuit: CircuitBoard,
  button: Keyboard,
  battery: BatteryCharging,
  charging: BatteryCharging,
  power: Power,
  voltage: Zap,
  repair: Wrench,
  hammer: Hammer,
  settings: Cog,
  tool: Cog,
  refresh: RefreshCw,
  gauge: Gauge,
  activity: Activity,
  paint: Palette,
  paintbrush: Paintbrush,
  brush: Brush,
  sparkle: Sparkles,
  star: Star,
  shield: Shield,
  check: CheckCircle,
  clock: Clock,
  package: Package,
  truck: Truck,
  award: Award,
  trophy: Trophy,
  medal: Medal,
}

const iconOptions = [
  { name: 'controller', icon: Gamepad2, category: 'controller' },
  { name: 'cpu', icon: Cpu, category: 'electronics' },
  { name: 'sensor', icon: Zap, category: 'electronics' },
  { name: 'circuit', icon: CircuitBoard, category: 'electronics' },
  { name: 'button', icon: Keyboard, category: 'input' },
  { name: 'battery', icon: BatteryCharging, category: 'power' },
  { name: 'charging', icon: BatteryCharging, category: 'power' },
  { name: 'power', icon: Power, category: 'power' },
  { name: 'repair', icon: Wrench, category: 'tools' },
  { name: 'hammer', icon: Hammer, category: 'tools' },
  { name: 'settings', icon: Cog, category: 'tools' },
  { name: 'tool', icon: Cog, category: 'tools' },
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

export default function EditServicePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState<ServiceWithOptions | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subtitle: '',
    detailed_description: '',
    duration: '1일',
    warranty: '1년',
    base_price: 0,
    icon_name: '',
  })

  const [features, setFeatures] = useState<FeatureItem[]>([])
  const [processSteps, setProcessSteps] = useState<ProcessStepItem[]>([])
  const [newFeature, setNewFeature] = useState('')
  const [newProcessStep, setNewProcessStep] = useState('')
  const [showIconSelector, setShowIconSelector] = useState(false)

  useEffect(() => {
    fetchService()
  }, [id])

  const fetchService = async () => {
    const { data } = await supabase
      .from('controller_services')
      .select('*, controller_service_options(*)')
      .eq('id', id)
      .single()

    if (data) {
      const serviceWithOptions = {
        ...data,
        options: data.controller_service_options || [],
      }
      setService(serviceWithOptions as ServiceWithOptions)
      setFormData({
        name: data.name || '',
        description: data.description || '',
        subtitle: data.subtitle || '',
        detailed_description: data.detailed_description || '',
        duration: data.duration || '1일',
        warranty: data.warranty || '1년',
        base_price: data.base_price || 0,
        icon_name: data.icon_name || data.service_id || '',
      })
      setFeatures(
        (data.features as string[])?.map((text, index) => ({
          id: `feature-${index}`,
          text,
          isEditing: false,
        })) || []
      )
      setProcessSteps(
        (data.process_steps as string[])?.map((text, index) => ({
          id: `step-${index}`,
          text,
          isEditing: false,
        })) || []
      )
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('서비스명을 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('controller_services')
        .update({
          ...formData,
          features: features.map((f) => f.text),
          process_steps: processSteps.map((s) => s.text),
        })
        .eq('id', id)

      if (error) throw error

      alert('서비스가 수정되었습니다.')
      navigate(-1)
    } catch (error) {
      console.error('Failed to update service:', error)
      alert('서비스 수정에 실패했습니다.')
    } finally {
      setSaving(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#007AFF] rounded-full animate-spin" />
      </div>
    )
  }

  const SelectedIcon = iconMap[formData.icon_name] || Gamepad2

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-8">
      <MobileHeader
        title="서비스 수정"
        showBackButton
        onBack={() => navigate(-1)}
      />

      <main className="p-5 space-y-6">
        {/* 아이콘 선택 */}
        <div>
          <label className="text-[13px] text-[#86868B] font-semibold mb-2 block">
            서비스 아이콘
          </label>
          <button
            onClick={() => setShowIconSelector(!showIconSelector)}
            className="w-full px-4 py-3 bg-white rounded-xl flex items-center gap-3 border border-[rgba(0,0,0,0.06)]"
          >
            <div className="w-8 h-8 rounded-lg bg-[#F5F5F7] flex items-center justify-center">
              <SelectedIcon className="w-5 h-5 text-[#1D1D1F]" strokeWidth={2} />
            </div>
            <span className="flex-1 text-left text-[15px]" style={{ fontWeight: 500 }}>
              {formData.icon_name || '아이콘 선택'}
            </span>
          </button>

          {showIconSelector && (
            <div className="mt-3 p-4 bg-white rounded-xl border border-[rgba(0,0,0,0.06)]">
              <p className="text-xs text-[#86868B] mb-3">원하는 아이콘을 선택하세요</p>
              <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                {iconOptions.map((option) => {
                  const IconComponent = option.icon
                  return (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, icon_name: option.name })
                        setShowIconSelector(false)
                      }}
                      className={`p-3 rounded-lg transition-colors ${
                        formData.icon_name === option.name
                          ? 'bg-[#007AFF]'
                          : 'bg-[#F5F5F7]'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" strokeWidth={2} />
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* 서비스명 */}
        <div>
          <label className="text-[13px] text-[#86868B] font-semibold mb-2 block">
            서비스명 *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="예: 홀 이펙트 센서 업그레이드"
            className="w-full px-4 py-3 bg-white rounded-xl border border-[rgba(0,0,0,0.06)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
            style={{ fontWeight: 500 }}
          />
        </div>

        {/* 설명 */}
        <div>
          <label className="text-[13px] text-[#86868B] font-semibold mb-2 block">
            설명
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="서비스에 대한 간단 설명"
            className="w-full px-4 py-3 bg-white rounded-xl border border-[rgba(0,0,0,0.06)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
            style={{ fontWeight: 500 }}
          />
        </div>

        {/* 기본 가격 */}
        <div>
          <label className="text-[13px] text-[#86868B] font-semibold mb-2 block">
            기본 가격 *
          </label>
          <input
            type="number"
            value={formData.base_price}
            onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) || 0 })}
            placeholder="0"
            min="0"
            className="w-full px-4 py-3 bg-white rounded-xl border border-[rgba(0,0,0,0.06)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
            style={{ fontWeight: 500 }}
          />
        </div>

        {/* 부제목 */}
        <div>
          <label className="text-[13px] text-[#86868B] font-semibold mb-2 block">
            부제목
          </label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="서비스 부제목 (선택사항)"
            className="w-full px-4 py-3 bg-white rounded-xl border border-[rgba(0,0,0,0.06)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
            style={{ fontWeight: 500 }}
          />
        </div>

        {/* 상세 설명 */}
        <div>
          <label className="text-[13px] text-[#86868B] font-semibold mb-2 block">
            상세 설명
          </label>
          <textarea
            value={formData.detailed_description}
            onChange={(e) => setFormData({ ...formData, detailed_description: e.target.value })}
            placeholder="서비스에 대한 상세 설명"
            rows={4}
            className="w-full px-4 py-3 bg-white rounded-xl border border-[rgba(0,0,0,0.06)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 resize-none"
            style={{ fontWeight: 500 }}
          />
        </div>

        {/* 작업 소요 시간 */}
        <div>
          <label className="text-[13px] text-[#86868B] font-semibold mb-2 block">
            작업 소요 시간
          </label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="예: 1일, 2~3일"
            className="w-full px-4 py-3 bg-white rounded-xl border border-[rgba(0,0,0,0.06)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
            style={{ fontWeight: 500 }}
          />
        </div>

        {/* 보증 기간 */}
        <div>
          <label className="text-[13px] text-[#86868B] font-semibold mb-2 block">
            보증 기간
          </label>
          <input
            type="text"
            value={formData.warranty}
            onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
            placeholder="예: 1년, 6개월"
            className="w-full px-4 py-3 bg-white rounded-xl border border-[rgba(0,0,0,0.06)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
            style={{ fontWeight: 500 }}
          />
        </div>

        {/* 주요 특징 */}
        <div>
          <label className="text-[13px] text-[#86868B] font-semibold mb-2 block">
            주요 특징
          </label>
          <div className="space-y-2">
            {features.map((feature) => (
              <div key={feature.id} className="flex items-center gap-2">
                {feature.isEditing ? (
                  <>
                    <input
                      type="text"
                      value={feature.text}
                      onChange={(e) => updateFeature(feature.id, e.target.value)}
                      className="flex-1 px-3 py-2 bg-white rounded-xl border border-[rgba(0,0,0,0.06)] text-[15px] focus:outline-none"
                      style={{ fontWeight: 500 }}
                    />
                    <button
                      onClick={() => toggleFeatureEdit(feature.id)}
                      className="p-2 bg-[#34C759] rounded-lg"
                    >
                      <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 flex items-start gap-2 px-3 py-2 bg-white rounded-xl border border-[rgba(0,0,0,0.06)]">
                      <Check className="w-4 h-4 text-[#34C759] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span className="text-[15px]" style={{ fontWeight: 500 }}>
                        {feature.text}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleFeatureEdit(feature.id)}
                      className="p-2"
                    >
                      <Pencil className="w-4 h-4 text-[#86868B]" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => deleteFeature(feature.id)}
                      className="p-2"
                    >
                      <Trash2 className="w-4 h-4 text-[#FF3B30]" strokeWidth={2} />
                    </button>
                  </>
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="새 특징 추가"
                className="flex-1 px-3 py-2 bg-white rounded-xl border border-[rgba(0,0,0,0.06)] text-[15px] focus:outline-none"
                style={{ fontWeight: 500 }}
              />
              <button
                onClick={addFeature}
                disabled={!newFeature.trim()}
                className="px-4 py-2 bg-[#007AFF] text-white rounded-xl font-semibold disabled:opacity-50"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* 작업 과정 */}
        <div>
          <label className="text-[13px] text-[#86868B] font-semibold mb-2 block">
            작업 과정
          </label>
          <div className="space-y-2">
            {processSteps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2">
                {step.isEditing ? (
                  <>
                    <input
                      type="text"
                      value={step.text}
                      onChange={(e) => updateProcessStep(step.id, e.target.value)}
                      className="flex-1 px-3 py-2 bg-white rounded-xl border border-[rgba(0,0,0,0.06)] text-[15px] focus:outline-none"
                      style={{ fontWeight: 500 }}
                    />
                    <button
                      onClick={() => toggleProcessStepEdit(step.id)}
                      className="p-2 bg-[#34C759] rounded-lg"
                    >
                      <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-white rounded-xl border border-[rgba(0,0,0,0.06)]">
                      <div className="w-6 h-6 rounded-full bg-[#007AFF] text-white flex items-center justify-center text-xs flex-shrink-0 font-semibold">
                        {index + 1}
                      </div>
                      <span className="text-[15px] text-[#86868B]" style={{ fontWeight: 500 }}>
                        {step.text}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleProcessStepEdit(step.id)}
                      className="p-2"
                    >
                      <Pencil className="w-4 h-4 text-[#86868B]" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => deleteProcessStep(step.id)}
                      className="p-2"
                    >
                      <Trash2 className="w-4 h-4 text-[#FF3B30]" strokeWidth={2} />
                    </button>
                  </>
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newProcessStep}
                onChange={(e) => setNewProcessStep(e.target.value)}
                placeholder="새 과정 추가"
                className="flex-1 px-3 py-2 bg-white rounded-xl border border-[rgba(0,0,0,0.06)] text-[15px] focus:outline-none"
                style={{ fontWeight: 500 }}
              />
              <button
                onClick={addProcessStep}
                disabled={!newProcessStep.trim()}
                className="px-4 py-2 bg-[#007AFF] text-white rounded-xl font-semibold disabled:opacity-50"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={saving || !formData.name}
          className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-semibold disabled:opacity-50"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </main>
    </div>
  )
}
