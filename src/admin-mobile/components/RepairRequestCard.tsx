import { RepairStatus } from '@/types/database'
import { Person } from '@mui/icons-material'

interface RepairRequestCardProps {
  customerName: string
  controllerModel: string
  status: RepairStatus
  amount: number
  date: string
  onClick?: () => void
}

const statusConfig = {
  pending: {
    label: '대기중',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
  },
  confirmed: {
    label: '확인됨',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
  },
  in_progress: {
    label: '진행중',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-400',
  },
  completed: {
    label: '완료',
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
  },
  cancelled: {
    label: '취소',
    bg: 'bg-slate-200 dark:bg-slate-700',
    text: 'text-slate-600 dark:text-slate-400',
  },
}

export function RepairRequestCard({
  customerName,
  controllerModel,
  status,
  amount,
  date,
  onClick,
}: RepairRequestCardProps) {
  const config = statusConfig[status]

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400">
          <Person fontSize="small" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
              {customerName}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 ${config.bg} ${config.text} rounded-full font-semibold`}
            >
              {config.label}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate w-32">
            {controllerModel}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-sm text-gray-900 dark:text-gray-100">
          ₩{amount.toLocaleString()}
        </p>
        <p className="text-[10px] text-slate-400">{date}</p>
      </div>
    </div>
  )
}
