import { MobileHeader } from '../components/MobileHeader'
import { MobileFooterNav } from '../components/MobileFooterNav'
import { DashboardCard } from '../components/DashboardCard'
import { StatusCard } from '../components/StatusCard'
import { RepairRequestCard } from '../components/RepairRequestCard'
import { useEffect, useState } from 'react'
import { RepairRequest } from '@/types/database'
import { supabase } from '@/lib/supabase'

interface RecentRepair extends RepairRequest {
  controller_models?: {
    model_name: string
  }
}

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

export default function DashboardPage() {
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
  const [recentRepairs, setRecentRepairs] = useState<RecentRepair[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)

      // Current month calculation
      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const lastDayOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      ).toISOString()

      // Repair stats
      const [
        { count: totalRepairs },
        { count: pendingRepairs },
        { count: confirmedRepairs },
        { count: inProgressRepairs },
        { count: completedRepairs },
        { count: cancelledRepairs },
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
      ])

      // Monthly revenue (completed repairs this month)
      const { data: monthlyCompletedRepairsData } = await supabase
        .from('repair_requests')
        .select('total_amount')
        .gte('actual_completion_date', firstDayOfMonth)
        .lte('actual_completion_date', lastDayOfMonth)
        .eq('status', 'completed')
        .returns<Pick<RepairRequest, 'total_amount'>[]>()

      const monthlyRevenue =
        monthlyCompletedRepairsData?.reduce((sum, req) => sum + (req.total_amount || 0), 0) || 0

      const monthlyCompletedRepairs = monthlyCompletedRepairsData?.length || 0

      // Reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .returns<{ rating?: number }[]>()

      const totalReviews = reviews?.length || 0
      const averageRating =
        totalReviews > 0 && reviews
          ? reviews.reduce((sum, rev) => sum + (rev.rating || 0), 0) / totalReviews
          : 0

      // Recent repairs
      const { data: recentRepairsData } = await supabase
        .from('repair_requests')
        .select(`
          *,
          controller_models!repair_requests_controller_model_fkey (
            model_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(4)

      // Check reviews for each recent repair
      const recentRepairsWithReviews = recentRepairsData
        ? await Promise.all(
            recentRepairsData.map(async (request) => {
              const { data: review } = await supabase
                .from('reviews')
                .select('id')
                .eq('repair_request_id', request.id)
                .maybeSingle()

              return {
                ...request,
                has_review: !!review,
              }
            })
          )
        : []

      setStats({
        totalRepairs: totalRepairs || 0,
        pendingRepairs: pendingRepairs || 0,
        confirmedRepairs: confirmedRepairs || 0,
        inProgressRepairs: inProgressRepairs || 0,
        completedRepairs: completedRepairs || 0,
        cancelledRepairs: cancelledRepairs || 0,
        monthlyRevenue,
        monthlyCompletedRepairs,
        currentMonth,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
      })

      setRecentRepairs(recentRepairsWithReviews)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => `₩${price.toLocaleString()}`

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return '방금 전'
    if (hours < 24) return `${hours}시간 전`
    const days = Math.floor(hours / 24)
    return `${days}일 전`
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {loading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF] mx-auto mb-4" />
            <p className="text-[#86868B] text-sm" style={{ fontWeight: 600 }}>
              로딩 중...
            </p>
          </div>
        </div>
      ) : (
        <>
          <MobileHeader title="대시보드" subtitle={`전체 ${stats.totalRepairs}건`} />

          <main className="p-5 space-y-6">
            {/* Dashboard Cards */}
            <div className="space-y-4">
              <DashboardCard
                title={`${parseInt(stats.currentMonth.split('-')[1])}월 예상 매출`}
                value={formatPrice(stats.monthlyRevenue)}
                subtitle={`이번 달 완료된 ${stats.monthlyCompletedRepairs}건의 수리 금액`}
                type="revenue"
                color="primary"
              />
              <DashboardCard
                title="고객 만족도"
                value={`${stats.averageRating} / 5.0`}
                subtitle={`총 ${stats.totalReviews}개의 승인된 리뷰`}
                type="satisfaction"
                color="secondary"
              />
            </div>

            {/* Status Cards */}
            <section>
              <h3 className="text-lg mb-4 text-[#1D1D1F]" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                수리 진행 현황
              </h3>
              <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2">
                <StatusCard label="대기중" count={stats.pendingRepairs} color="yellow" />
                <StatusCard label="확인됨" count={stats.confirmedRepairs} color="blue" />
                <StatusCard label="진행중" count={stats.inProgressRepairs} color="purple" />
                <StatusCard label="완료" count={stats.completedRepairs} color="green" />
                <StatusCard label="취소" count={stats.cancelledRepairs} color="red" />
              </div>
            </section>

            {/* Recent Requests */}
            <section>
              <div className="flex justify-between items-end mb-3">
                <h3 className="text-lg text-[#1D1D1F]" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                  최근 수리 신청
                </h3>
              </div>
              <div className="bg-white rounded-xl overflow-hidden px-4">
                {recentRepairs.map((request) => (
                  <RepairRequestCard
                    key={request.id}
                    customerName={request.customer_name}
                    controllerModel={request.controller_models?.model_name || request.controller_model}
                    status={request.status}
                    amount={request.total_amount}
                    date={formatTime(request.created_at)}
                    hasReview={request.has_review}
                  />
                ))}
              </div>
            </section>
          </main>
        </>
      )}

      <MobileFooterNav />
    </div>
  )
}
