import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Star, DollarSign, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Stats {
  totalRepairs: number
  pendingRepairs: number
  confirmedRepairs: number
  inProgressRepairs: number
  completedRepairs: number
  cancelledRepairs: number
  monthlyRevenue: number
  monthlyCompletedRepairs: number
  currentMonth: string
  averageRating: number
  totalReviews: number
}

type RepairStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

interface IncompleteRepairItem {
  id: string
  customer_name: string
  controller_model: string
  status: RepairStatus
  total_amount: number
  created_at: string
  controller_models?: {
    model_name: string
  } | null
}

interface TodayScheduleItem {
  id: string
  title: string
  event_type: 'repair' | 'purchase' | 'shipping' | 'customer_support' | 'other'
  status: 'scheduled' | 'in_progress' | 'delayed' | 'completed' | 'cancelled'
  start_at: string
}

export function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>({
    totalRepairs: 0,
    pendingRepairs: 0,
    confirmedRepairs: 0,
    inProgressRepairs: 0,
    completedRepairs: 0,
    cancelledRepairs: 0,
    monthlyRevenue: 0,
    monthlyCompletedRepairs: 0,
    currentMonth: '',
    averageRating: 0,
    totalReviews: 0,
  })
  const [incompleteRepairs, setIncompleteRepairs] = useState<IncompleteRepairItem[]>([])
  const [todaySchedules, setTodaySchedules] = useState<TodayScheduleItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const lastDayOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      ).toISOString()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const endOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59
      ).toISOString()

      const [
        totalRepairsRes,
        pendingRepairsRes,
        confirmedRepairsRes,
        inProgressRepairsRes,
        completedRepairsRes,
        cancelledRepairsRes,
        monthlyCompletedRepairsRes,
        reviewsRes,
        incompleteRepairsRes,
        todaySchedulesRes,
      ] = await Promise.all([
        supabase.from('repair_requests').select('*', { count: 'exact', head: true }),
        supabase
          .from('repair_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('repair_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'confirmed'),
        supabase
          .from('repair_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'in_progress'),
        supabase
          .from('repair_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed'),
        supabase
          .from('repair_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'cancelled'),
        supabase
          .from('repair_requests')
          .select('total_amount')
          .eq('status', 'completed')
          .gte('created_at', firstDayOfMonth)
          .lte('created_at', lastDayOfMonth),
        supabase.from('reviews').select('rating').eq('is_public', true),
        supabase
          .from('repair_requests')
          .select(
            'id, customer_name, controller_model, status, total_amount, created_at, controller_models!repair_requests_controller_model_fkey(model_name)'
          )
          .in('status', ['pending', 'confirmed', 'in_progress'])
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('schedule_events')
          .select('id, title, event_type, status, start_at')
          .gte('start_at', startOfToday)
          .lte('start_at', endOfToday)
          .order('start_at', { ascending: true })
          .limit(5),
      ])

      if (monthlyCompletedRepairsRes.error) throw monthlyCompletedRepairsRes.error
      if (reviewsRes.error) throw reviewsRes.error
      if (incompleteRepairsRes.error) throw incompleteRepairsRes.error

      if (todaySchedulesRes.error) {
        console.warn('Today schedule query failed:', todaySchedulesRes.error)
      }

      const monthlyRows = (monthlyCompletedRepairsRes.data || []) as Array<{
        total_amount: number | string | null
      }>

      const monthlyRevenue = monthlyRows.reduce((sum, repair) => {
        const price = Number(repair.total_amount)
        return sum + (isNaN(price) ? 0 : price)
      }, 0)

      const monthlyCompletedRepairs = monthlyRows.length

      const reviewRows = (reviewsRes.data || []) as Array<{ rating: number }>

      const averageRating =
        reviewRows.length > 0
          ? reviewRows.reduce((sum, r) => sum + r.rating, 0) / reviewRows.length
          : 0

      setIncompleteRepairs((incompleteRepairsRes.data || []) as IncompleteRepairItem[])
      setTodaySchedules(
        todaySchedulesRes.error ? [] : ((todaySchedulesRes.data || []) as TodayScheduleItem[])
      )

      setStats({
        totalRepairs: totalRepairsRes.count || 0,
        pendingRepairs: pendingRepairsRes.count || 0,
        confirmedRepairs: confirmedRepairsRes.count || 0,
        inProgressRepairs: inProgressRepairsRes.count || 0,
        completedRepairs: completedRepairsRes.count || 0,
        cancelledRepairs: cancelledRepairsRes.count || 0,
        monthlyRevenue,
        monthlyCompletedRepairs,
        currentMonth: `${now.getMonth() + 1}월`,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviewRows.length,
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusFlow = [
    {
      label: '대기중',
      value: stats.pendingRepairs,
      color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    },
    {
      label: '확인됨',
      value: stats.confirmedRepairs,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      label: '진행중',
      value: stats.inProgressRepairs,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      label: '완료',
      value: stats.completedRepairs,
      color: 'bg-green-50 text-green-600 border-green-200',
    },
    {
      label: '취소',
      value: stats.cancelledRepairs,
      color: 'bg-red-50 text-red-600 border-red-200',
    },
  ]

  const scheduleTypeLabel: Record<TodayScheduleItem['event_type'], string> = {
    repair: '수리',
    purchase: '발주',
    shipping: '배송',
    customer_support: '고객응대',
    other: '기타',
  }

  const repairStatusBadgeClass: Record<RepairStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const repairStatusLabel: Record<RepairStatus, string> = {
    pending: '대기중',
    confirmed: '확인됨',
    in_progress: '진행중',
    completed: '완료',
    cancelled: '취소',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">대시보드</h1>
          <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
            전체 {stats.totalRepairs}건
          </div>
        </div>
        <div className="text-sm text-gray-600">
          마지막 업데이트: {new Date().toLocaleString('ko-KR')}
        </div>
      </div>

      {/* 매출 & 평점 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* 예상 매출 */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-6 text-white shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold">{stats.currentMonth} 예상 매출</h3>
          </div>
          <p className="text-4xl font-bold mb-1">₩{stats.monthlyRevenue.toLocaleString()}</p>
          <p className="text-sm text-blue-100">
            이번 달 완료된 {stats.monthlyCompletedRepairs}건의 수리 금액
          </p>
        </div>

        {/* 평균 평점 */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl p-6 text-white shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold">고객 만족도</h3>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</p>
            <p className="text-xl text-orange-100">/ 5.0</p>
          </div>
          <p className="text-sm text-orange-100">총 {stats.totalReviews}개의 승인된 리뷰</p>
        </div>
      </div>

      {/* 수리 상태 플로우 */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <h2 className="text-xl font-bold mb-4">수리 진행 현황</h2>
        <div className="flex items-center justify-between gap-2">
          {statusFlow.map((status, index) => (
            <div key={status.label} className="flex items-center flex-1">
              <div
                className={`flex-1 border-2 rounded-lg p-4 ${status.color} transition hover:shadow-md`}
              >
                <p className="text-sm font-medium mb-1">{status.label}</p>
                <p className="text-3xl font-bold">{status.value}</p>
              </div>
              {index < statusFlow.length - 1 && (
                <ArrowRight className="w-5 h-5 text-gray-400 mx-1 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/admin/schedule')}
          className="bg-white rounded-xl p-6 border border-gray-200 text-left hover:shadow-md transition"
        >
          <h2 className="text-lg font-bold mb-2">일정 관리</h2>
          <p className="text-sm text-gray-600 mb-3">오늘 일정 {todaySchedules.length}건</p>
          <div className="space-y-2 mb-4">
            {todaySchedules.length === 0 ? (
              <p className="text-xs text-gray-500">등록된 오늘 일정이 없습니다.</p>
            ) : (
              todaySchedules.slice(0, 3).map((event) => (
                <div key={event.id} className="text-xs bg-gray-50 rounded px-2 py-1.5">
                  <p className="font-medium text-gray-800 truncate">{event.title}</p>
                  <p className="text-gray-500">
                    {scheduleTypeLabel[event.event_type]} ·{' '}
                    {new Date(event.start_at).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
          <span className="text-blue-600 text-sm font-medium">일정 페이지로 이동 →</span>
        </button>

        <button
          onClick={() => navigate('/admin/repairs')}
          className="bg-white rounded-xl p-6 border border-gray-200 text-left hover:shadow-md transition"
        >
          <h2 className="text-lg font-bold mb-2">수리 신청 관리</h2>
          <p className="text-sm text-gray-600 mb-3">미완료 주문 {incompleteRepairs.length}건</p>
          <div className="space-y-2 mb-4">
            {incompleteRepairs.length === 0 ? (
              <p className="text-xs text-gray-500">현재 미완료 주문이 없습니다.</p>
            ) : (
              incompleteRepairs.slice(0, 3).map((repair) => (
                <div key={repair.id} className="text-xs bg-gray-50 rounded px-2 py-1.5">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="font-medium text-gray-800 truncate">{repair.customer_name}</p>
                    <span
                      className={`px-1.5 py-0.5 rounded-full ${repairStatusBadgeClass[repair.status]}`}
                    >
                      {repairStatusLabel[repair.status]}
                    </span>
                  </div>
                  <p className="text-gray-500 truncate">
                    {repair.controller_models?.model_name || repair.controller_model}
                  </p>
                </div>
              ))
            )}
          </div>
          <span className="text-blue-600 text-sm font-medium">수리 신청 페이지로 이동 →</span>
        </button>

        <button
          onClick={() => navigate('/admin/reviews')}
          className="bg-white rounded-xl p-6 border border-gray-200 text-left hover:shadow-md transition"
        >
          <h2 className="text-lg font-bold mb-2">리뷰 관리</h2>
          <p className="text-sm text-gray-600 mb-4">리뷰 공개 여부와 품질 모니터링을 진행합니다.</p>
          <span className="text-blue-600 text-sm font-medium">리뷰 페이지로 이동 →</span>
        </button>
      </div>
    </div>
  )
}
