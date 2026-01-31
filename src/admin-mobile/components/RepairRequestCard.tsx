import { RepairStatus } from '@/types/database'
import { User, MessageSquare, CheckCircle } from 'lucide-react'

interface RepairRequestCardProps {
  customerName: string
  controllerModel: string
  status: RepairStatus
  amount: number
  date: string
  hasReview?: boolean
  onClick?: () => void
}

const statusConfig = {
  pending: {
    label: '대기중',
    bg: 'bg-[#FFF9E6]',
    text: 'text-[#FF9500]',
  },
  confirmed: {
    label: '확인됨',
    bg: 'bg-[#E6F2FF]',
    text: 'text-[var(--ios-blue)]',
  },
  in_progress: {
    label: '진행중',
    bg: 'bg-[#F3E6FF]',
    text: 'text-[#AF52DE]',
  },
  completed: {
    label: '완료',
    bg: 'bg-[#E6F9F0]',
    text: 'text-[#34C759]',
  },
  cancelled: {
    label: '취소',
    bg: 'bg-[#F5F5F7]',
    text: 'text-[#86868B]',
  },
}

export function RepairRequestCard({
  customerName,
  controllerModel,
  status,
  amount,
  date,
  hasReview,
  onClick,
}: RepairRequestCardProps) {
  const config = statusConfig[status]
  const showReviewStatus = status === 'completed'

  return (
    <div
      onClick={onClick}
      className="bg-white py-4 border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between transition-all active:bg-[#F5F5F7] cursor-pointer"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm text-[#1D1D1F] truncate" style={{ fontWeight: 600 }}>
              {customerName}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 ${config.bg} ${config.text} rounded-md flex-shrink-0`}
              style={{ fontWeight: 600 }}
            >
              {config.label}
            </span>
            {showReviewStatus && (
              hasReview ? (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-[#E6F9F0] text-[#34C759] rounded-md flex-shrink-0" style={{ fontWeight: 600 }}>
                  <CheckCircle className="w-3 h-3" />
                  리뷰완료
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-[#E6F2FF] text-[var(--ios-blue)] rounded-md flex-shrink-0" style={{ fontWeight: 600 }}>
                  <MessageSquare className="w-3 h-3" />
                  리뷰요청
                </span>
              )
            )}
          </div>
          <p className="text-xs text-[#86868B] truncate">{controllerModel}</p>
        </div>
      </div>
      <div className="text-right ml-4 flex-shrink-0">
        <p className="text-sm text-[#1D1D1F] whitespace-nowrap mb-0.5" style={{ fontWeight: 700 }}>
          ₩{amount.toLocaleString()}
        </p>
        <p className="text-[10px] text-[#86868B]">{date}</p>
      </div>
    </div>
  )
}
