import { MobileHeader } from '../components/MobileHeader'
import { MobileFooterNav } from '../components/MobileFooterNav'
import { ModelServiceItem } from '../components/ModelServiceItem'
import { useEffect, useState } from 'react'
import { ControllerService, ControllerModel } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { SettingsSuggest, DarkMode, Add } from '@mui/icons-material'

export default function ModelServicePage() {
  const [models, setModels] = useState<ControllerModel[]>([])
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [services, setServices] = useState<ControllerService[]>([])

  useEffect(() => {
    fetchModels()
  }, [])

  useEffect(() => {
    if (selectedModel) {
      fetchServices(selectedModel)
    }
  }, [selectedModel])

  const fetchModels = async () => {
    const { data } = await supabase.from('controller_models').select('*').order('display_order')

    if (data) {
      setModels(data as ControllerModel[])
      if (data.length > 0) {
        setSelectedModel(data[0].id)
      }
    }
  }

  const fetchServices = async (modelId: string) => {
    const { data } = await supabase
      .from('controller_services')
      .select('*')
      .eq('controller_model_id', modelId)
      .order('display_order')

    if (data) setServices(data as ControllerService[])
  }

  const handleToggleActive = async (service: ControllerService) => {
    const { error } = await supabase
      .from('controller_services')
      .update({ is_active: !service.is_active })
      .eq('id', service.id)

    if (!error) {
      setServices(
        services.map((s) => (s.id === service.id ? { ...s, is_active: !s.is_active } : s))
      )
    }
  }

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen pb-24">
      <MobileHeader
        title="모델 & 서비스 관리"
        rightAction={
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <DarkMode fontSize="small" className="text-gray-600 dark:text-gray-300" />
            </button>
            <button className="bg-black dark:bg-white text-white dark:text-black p-2 rounded-full flex items-center justify-center">
              <Add fontSize="small" />
            </button>
          </div>
        }
      />

      <main className="pb-24">
        <section className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              컨트롤러 모델
            </h2>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">순서 변경</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm ${
                  selectedModel === model.id
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {model.model_name}
              </button>
            ))}
          </div>
        </section>

        <section className="px-4">
          <div className="flex items-center justify-between mb-4 mt-2">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              서비스 목록
            </h2>
            <button className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <SettingsSuggest fontSize="small" />
              필터
            </button>
          </div>
          <div className="space-y-3">
            {services.map((service) => (
              <ModelServiceItem
                key={service.id}
                serviceName={service.name}
                description={service.description || service.subtitle || ''}
                price={service.base_price}
                optionCount={0}
                isActive={service.is_active}
                iconName={service.icon_name || undefined}
                onToggleActive={() => handleToggleActive(service)}
              />
            ))}
          </div>
        </section>
      </main>

      <MobileFooterNav />
    </div>
  )
}
