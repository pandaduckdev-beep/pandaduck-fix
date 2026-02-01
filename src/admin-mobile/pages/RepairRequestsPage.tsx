import { MobileHeader } from '../components/MobileHeader'
import { MobileFooterNav } from '../components/MobileFooterNav'
import { RepairRequestCard } from '../components/RepairRequestCard'
import { useState } from 'react'
import { RepairStatus } from '@/types/database'
import { SkeletonCard } from '@/components/common/Skeleton'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useRepairRequests } from '../hooks/useRepairRequests'
import { useDebouncedValue } from '@/lib/debounce'

export default function RepairRequestsPage() {
  const navigate = useNavigate()
  const [selectedStatus, setSelectedStatus] = useState<RepairStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebouncedValue(searchQuery, 300)

  // Use custom hook with debounced search
  const { requests, loading, error } = useRepairRequests({
    status: selectedStatus,
    searchQuery: debouncedSearch,
    enabled: true,
  })

  // Handle errors
  if (error) {
    console.error('Failed to load repair requests:', error)
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <MobileHeader title="수리 신청 관리" />

      <main className="p-5 space-y-4">
        {loading ? (
          <div className="space-y-4 py-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <div className="text-center py-4">
              <p className="text-[#86868B] text-sm font-medium">불러오는 중...</p>
            </div>
          </div>
        ) : (
          <>
        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]" />
          <input
            type="text"
            placeholder="고객명, 전화번호, 컨트롤러 검색..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
            }}
            className="w-full bg-[#F5F5F7] border-none rounded-[16px] py-3 pl-10 pr-4 text-sm focus:ring-0 focus:border-gray-400 transition-all placeholder:text-[#86868B]"
            style={{ fontWeight: 500 }}
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-2 rounded-[14px] text-xs whitespace-nowrap transition-all ${
              selectedStatus === 'all'
                ? 'bg-[#007AFF] text-white'
                : 'bg-white border border-[rgba(0,0,0,0.08)] text-[#86868B]'
            }`}
            style={{ fontWeight: 600 }}
          >
            전체 ({requests.length})
          </button>
          <button
            onClick={() => setSelectedStatus('pending')}
            className={`px-4 py-2 rounded-[14px] text-xs whitespace-nowrap transition-all ${
              selectedStatus === 'pending'
                ? 'bg-[#FF9500] text-white'
                : 'bg-white border border-[rgba(0,0,0,0.08)] text-[#86868B]'
            }`}
            style={{ fontWeight: 600 }}
          >
            대기중 ({requests.filter((r) => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setSelectedStatus('confirmed')}
            className={`px-4 py-2 rounded-[14px] text-xs whitespace-nowrap transition-all ${
              selectedStatus === 'confirmed'
                ? 'bg-[#007AFF] text-white'
                : 'bg-white border border-[rgba(0,0,0,0.08)] text-[#86868B]'
            }`}
            style={{ fontWeight: 600 }}
          >
            확인됨 ({requests.filter((r) => r.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setSelectedStatus('in_progress')}
            className={`px-4 py-2 rounded-[14px] text-xs whitespace-nowrap transition-all ${
              selectedStatus === 'in_progress'
                ? 'bg-[#AF52DE] text-white'
                : 'bg-white border border-[rgba(0,0,0,0.08)] text-[#86868B]'
            }`}
            style={{ fontWeight: 600 }}
          >
            진행중 ({requests.filter((r) => r.status === 'in_progress').length})
          </button>
          <button
            onClick={() => setSelectedStatus('completed')}
            className={`px-4 py-2 rounded-[14px] text-xs whitespace-nowrap transition-all ${
              selectedStatus === 'completed'
                ? 'bg-[#34C759] text-white'
                : 'bg-white border border-[rgba(0,0,0,0.08)] text-[#86868B]'
            }`}
            style={{ fontWeight: 600 }}
          >
            완료 ({requests.filter((r) => r.status === 'completed').length})
          </button>
          <button
            onClick={() => setSelectedStatus('cancelled')}
            className={`px-4 py-2 rounded-[14px] text-xs whitespace-nowrap transition-all ${
              selectedStatus === 'cancelled'
                ? 'bg-[#86868B] text-white'
                : 'bg-white border border-[rgba(0,0,0,0.08)] text-[#86868B]'
            }`}
            style={{ fontWeight: 600 }}
          >
            취소 ({requests.filter((r) => r.status === 'cancelled').length})
          </button>
        </div>

        {/* Request List */}
        <div>
          <p className="text-sm text-[#86868B] mb-3" style={{ fontWeight: 600 }}>
            총 {requests.length}건의 수리 요청
          </p>
          <div className="bg-white rounded-xl overflow-hidden px-4">
            {requests.map((request) => (
              <RepairRequestCard
                key={request.id}
                customerName={request.customer_name}
                controllerModel={request.controller_models?.model_name || request.controller_model}
                status={request.status}
                amount={request.total_amount}
                date={formatTime(request.created_at)}
                hasReview={request.has_review}
                onClick={() => navigate(`/admin-mobile/repairs/${request.id}`)}
              />
            ))}
          </div>
        </div>
        </>
        )}
      </main>

      <MobileFooterNav />
    </div>
  )
}
