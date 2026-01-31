import { MobileHeader } from '../components/MobileHeader'
import { MobileFooterNav } from '../components/MobileFooterNav'
import { useEffect, useState } from 'react'
import { ControllerModel } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { GripVertical } from 'lucide-react'

export default function ControllerModelsPage() {
  const [models, setModels] = useState<ControllerModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    setLoading(true)
    const { data } = await supabase.from('controller_models').select('*').order('display_order')

    if (data) {
      setModels(data as ControllerModel[])
    }
    setLoading(false)
  }

  const handleToggleActive = async (model: ControllerModel) => {
    const { error } = await supabase
      .from('controller_models')
      .update({ is_active: !model.is_active })
      .eq('id', model.id)

    if (!error) {
      setModels(
        models.map((m) => (m.id === model.id ? { ...m, is_active: !m.is_active } : m))
      )
    }
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <MobileHeader title="컨트롤러 모델" />

      <main className="p-5 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-[#007AFF] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Model List */}
            <div>
              <p className="text-sm text-[#86868B] mb-3" style={{ fontWeight: 600 }}>
                총 {models.length}개의 모델
              </p>

              {models.length === 0 ? (
                <div className="bg-[#F5F5F7] rounded-2xl p-8 text-center">
                  <p className="text-[#86868B] text-sm">등록된 모델이 없습니다</p>
                </div>
              ) : (
                <div className="bg-[#F5F5F7] rounded-xl overflow-hidden">
                  {models.map((model, index) => (
                    <div
                      key={model.id}
                      className="bg-white py-4 border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between px-4"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {/* 드래그 핸들 */}
                        <button className="p-1 text-[#C7C7CC] hover:text-[#86868B] cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-5 h-5" strokeWidth={2} />
                        </button>

                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-[#1D1D1F] block" style={{ fontWeight: 600 }}>
                            {model.model_name}
                          </span>
                        </div>
                      </div>

                      {/* 활성/비활성 토글 스위치 */}
                      <button
                        onClick={() => handleToggleActive(model)}
                        className={`flex-shrink-0 w-12 h-7 rounded-full p-1 transition-colors ml-4 ${
                          model.is_active ? 'bg-[#34C759]' : 'bg-[#C7C7CC]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                            model.is_active ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <MobileFooterNav />
    </div>
  )
}
