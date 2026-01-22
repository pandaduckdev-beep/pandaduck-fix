import { ChevronLeft, Gamepad2, Check, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export function ControllerSelection() {
  const navigate = useNavigate()
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [controllerModels, setControllerModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 컨트롤러 모델 데이터 로드
  useEffect(() => {
    const loadControllerModels = async () => {
      try {
        const { data, error } = await supabase
          .from('controller_models')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })

        if (error) throw error
        setControllerModels(data || [])
      } catch (error) {
        console.error('Failed to load controller models:', error)
      } finally {
        setLoading(false)
      }
    }

    loadControllerModels()
  }, [])

  const handleContinue = () => {
    if (!selectedModel) return

    navigate('/services', { state: { controllerModel: selectedModel } })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors -ml-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-lg tracking-tight" style={{ fontWeight: 600 }}>
            기종 선택
          </div>
          <div className="w-10"></div>
        </div>
      </nav>

      {/* Progress Indicator */}
      <div className="max-w-md mx-auto px-6 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center text-sm"
              style={{ fontWeight: 600 }}
            >
              1
            </div>
            <span className="text-sm" style={{ fontWeight: 600 }}>
              기종
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-[#F5F5F7] mx-3"></div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-[#F5F5F7] text-[#86868B] flex items-center justify-center text-sm"
              style={{ fontWeight: 600 }}
            >
              2
            </div>
            <span className="text-sm text-[#86868B]" style={{ fontWeight: 600 }}>
              서비스
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-[#F5F5F7] mx-3"></div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-[#F5F5F7] text-[#86868B] flex items-center justify-center text-sm"
              style={{ fontWeight: 600 }}
            >
              3
            </div>
            <span className="text-sm text-[#86868B]" style={{ fontWeight: 600 }}>
              배송
            </span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-md mx-auto px-6 pb-6">
        <h1 className="text-2xl mb-2" style={{ fontWeight: 700 }}>
          어떤 컨트롤러를
          <br />
          수리하시나요?
        </h1>
        <p className="text-[#86868B]">수리할 컨트롤러 기종을 선택해주세요</p>
      </div>

      {/* Controller Cards */}
      <div className="max-w-md mx-auto px-6 space-y-3">
        {controllerModels.map((model) => (
          <button
            key={model.id}
            onClick={() => setSelectedModel(model.model_id)}
            className={`w-full p-6 rounded-[28px] border-2 transition-all text-left ${
              selectedModel === model.model_id
                ? 'border-[#000000] bg-[#F5F5F7]'
                : 'border-[rgba(0,0,0,0.1)] bg-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  selectedModel === model.model_id ? 'bg-[#000000] text-white' : 'bg-[#F5F5F7]'
                }`}
              >
                {selectedModel === model.model_id ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Gamepad2 className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>
                  {model.model_name}
                </h3>
                <p className="text-sm text-[#86868B]">{model.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto px-6 py-6">
          <button
            onClick={handleContinue}
            disabled={!selectedModel}
            className={`w-full py-4 rounded-full transition-all ${
              selectedModel
                ? 'bg-[#000000] text-white hover:scale-[0.98] active:scale-[0.96]'
                : 'bg-[#F5F5F7] text-[#86868B] cursor-not-allowed'
            }`}
            style={{ fontWeight: 600 }}
          >
            계속하기
          </button>
        </div>
      </div>
    </div>
  )
}
