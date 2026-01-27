import { Bolt, AdsClick, AddCircle, Settings, Tune } from '@mui/icons-material'

interface ModelServiceItemProps {
  serviceName: string
  description: string
  price: number
  optionCount: number
  isActive: boolean
  iconName?: string
  onToggleActive?: () => void
  onEdit?: () => void
  onSettings?: () => void
}

const iconMap: Record<string, React.ElementType> = {
  bolt: Bolt,
  ads_click: AdsClick,
  add_circle: AddCircle,
  default: Settings,
}

export function ModelServiceItem({
  serviceName,
  description,
  price,
  optionCount,
  isActive,
  iconName,
  onToggleActive,
  onEdit,
  onSettings,
}: ModelServiceItemProps) {
  const Icon = iconName && iconMap[iconName] ? iconMap[iconName] : iconMap.default

  const getIconBg = () => {
    if (iconName === 'bolt')
      return 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    if (iconName === 'ads_click')
      return 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
    if (iconName === 'add_circle')
      return 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getIconBg()}`}>
            <Icon fontSize="small" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{serviceName}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
              {description}
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={onToggleActive}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 dark:border-gray-700/50">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            ₩{price.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">옵션 {optionCount}개</span>
        </div>
        <div className="flex gap-2">
          {onSettings && (
            <button
              onClick={onSettings}
              className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-white transition-colors"
            >
              <Settings fontSize="small" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-white transition-colors"
            >
              <Tune fontSize="small" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
