import { MobileHeader } from '../components/MobileHeader'
import { MobileFooterNav } from '../components/MobileFooterNav'
import { RepairRequestCard } from '../components/RepairRequestCard'
import { useEffect, useState } from 'react'
import { RepairStatus, RepairRequest } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

interface RepairRequestWithModel extends RepairRequest {
  controller_models?: {
    model_name: string
  }
}

export default function RepairRequestsPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<RepairRequestWithModel[]>([])
  const [selectedStatus, setSelectedStatus] = useState<RepairStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [selectedStatus])

  const fetchRequests = async () => {
    let query = supabase
      .from('repair_requests')
      .select(`
        *,
        controller_models!repair_requests_controller_model_fkey (
          model_name
        )
      `)
      .order('created_at', { ascending: false })

    if (selectedStatus !== 'all') {
      query = query.eq('status', selectedStatus)
    }

    if (searchQuery) {
      query = query.or(
        `customer_name.ilike.%${searchQuery}%,controller_model.ilike.%${searchQuery}%`
      )
    }

    const { data } = await query

    if (data) setRequests(data)
  }

  const filteredRequests = searchQuery
    ? requests.filter(
        (req) =>
          req.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.controller_model.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : requests

  const formatTime = (date: string) => {
    const d = new Date(date)
    return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <MobileHeader
        title="수리 신청 관리"
        rightAction={
          <button
            onClick={() => navigate('/admin-mobile/add-request')}
            className="w-12 h-12 bg-[#007AFF] text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95"
            style={{ fontWeight: 700, fontSize: '24px' }}
          >
            +
          </button>
        }
      />

      <main className="p-5 space-y-4">
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
            className="w-full bg-[#F5F5F7] border-none rounded-[16px] py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#007AFF]/20 transition-all placeholder:text-[#86868B]"
            style={{ fontWeight: 500 }}
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
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
        </div>

        {/* Request List */}
        <div>
          <p className="text-sm text-[#86868B] mb-3" style={{ fontWeight: 600 }}>
            총 {filteredRequests.length}건의 수리 요청
          </p>
          <div className="bg-white rounded-xl overflow-hidden px-4">
            {filteredRequests.map((request) => (
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
      </main>

      <MobileFooterNav />
    </div>
  )
}
