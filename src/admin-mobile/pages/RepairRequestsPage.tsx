import { MobileHeader } from '../components/MobileHeader'
import { MobileFooterNav } from '../components/MobileFooterNav'
import { RepairRequestCard } from '../components/RepairRequestCard'
import { useEffect, useState } from 'react'
import { RepairStatus, RepairRequest } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function RepairRequestsPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<RepairRequest[]>([])
  const [selectedStatus, setSelectedStatus] = useState<RepairStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [selectedStatus])

  const fetchRequests = async () => {
    let query = supabase
      .from('repair_requests')
      .select('*')
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
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen pb-24">
      <MobileHeader
        title="수리 신청 관리"
        rightAction={
          <button
            onClick={() => navigate('/admin-mobile/add-request')}
            className="w-14 h-14 bg-blue-500 dark:bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
          >
            +
          </button>
        }
      />

      <main className="p-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="고객명, 전화번호, 컨트롤러 검색..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
            }}
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedStatus === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            전체 ({requests.length})
          </button>
          <button
            onClick={() => setSelectedStatus('pending')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedStatus === 'pending'
                ? 'bg-amber-500 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            대기중 ({requests.filter((r) => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setSelectedStatus('confirmed')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedStatus === 'confirmed'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            확인됨 ({requests.filter((r) => r.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setSelectedStatus('completed')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedStatus === 'completed'
                ? 'bg-green-500 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            완료 ({requests.filter((r) => r.status === 'completed').length})
          </button>
        </div>

        {/* Request List */}
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
            총 {filteredRequests.length}건의 수리 요청
          </p>
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <RepairRequestCard
                key={request.id}
                customerName={request.customer_name}
                controllerModel={request.controller_model}
                status={request.status}
                amount={request.total_amount}
                date={formatTime(request.created_at)}
                onClick={() => navigate(`/admin-mobile/request/${request.id}`)}
              />
            ))}
          </div>
        </div>
      </main>

      <MobileFooterNav />
    </div>
  )
}
