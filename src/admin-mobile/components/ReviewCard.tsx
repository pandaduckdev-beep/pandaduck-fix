import { Star, StarBorder, Visibility, DeleteOutline } from '@mui/icons-material'

interface ReviewCardProps {
  customerName: string
  rating: number
  serviceName: string
  content: string
  date: string
  isApproved: boolean
  isPublic: boolean
  onTogglePublic?: () => void
  onView?: () => void
  onDelete?: () => void
}

export function ReviewCard({
  customerName,
  rating,
  serviceName,
  content,
  date,
  isApproved,
  isPublic,
  onTogglePublic,
  onView,
  onDelete,
}: ReviewCardProps) {
  const getInitial = (name: string) => name.charAt(0).toUpperCase()

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, i) =>
      i < rating ? (
        <Star key={i} fontSize="small" className="text-yellow-400" />
      ) : (
        <StarBorder key={i} fontSize="small" className="text-gray-300 dark:text-gray-600" />
      )
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 font-bold">
            {getInitial(customerName)}
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">{customerName}</h3>
            <div className="flex items-center gap-1">{renderStars()}</div>
          </div>
        </div>
        <span className="text-[10px] text-gray-400 font-medium">{date}</span>
      </div>

      <div className="mb-3">
        <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-[10px] font-medium mb-1">
          {serviceName}
        </span>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{content}</p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">공개 여부</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={onTogglePublic}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
          {isApproved && (
            <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[11px] font-bold">
              <Star fontSize="small" className="text-xs" />
              승인됨
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onView && (
            <button
              onClick={onView}
              className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Visibility fontSize="small" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
            >
              <DeleteOutline fontSize="small" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
