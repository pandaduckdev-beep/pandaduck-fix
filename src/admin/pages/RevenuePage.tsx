import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Plus,
  Download,
  List,
} from 'lucide-react'
import { toast } from 'sonner'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ExpenseModal } from '../components/ExpenseModal'
import { ExpensesPage } from './ExpensesPage'

type PeriodType = 'week' | 'month' | 'year'
type TabType = 'overview' | 'expenses'

interface RevenueStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  orderCount: number
  completedCount: number
  avgOrderValue: number
}

interface MonthlyData {
  month: string
  revenue: number
  expenses: number
  profit: number
  orderCount: number
}

interface CategoryExpense {
  categoryName: string
  categoryColor: string
  totalAmount: number
  expenseCount: number
}

export function RevenuePage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [period, setPeriod] = useState<PeriodType>('month')
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    orderCount: 0,
    completedCount: 0,
    avgOrderValue: 0,
  })
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [period])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([loadStats(), loadMonthlyData(), loadCategoryExpenses()])
    } catch (error) {
      console.error('Failed to load revenue data:', error)
      toast.error('데이터 로드에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    const { startDate, endDate } = getDateRange()

    // 매출 통계
    const { data: revenueData, error: revenueError } = await supabase
      .from('repair_requests')
      .select('total_amount, status')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .neq('status', 'cancelled')

    if (revenueError) throw revenueError

    // 지출 통계
    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .select('amount')
      .gte('expense_date', format(new Date(startDate), 'yyyy-MM-dd'))
      .lte('expense_date', format(new Date(endDate), 'yyyy-MM-dd'))

    if (expenseError) throw expenseError

    const totalRevenue = revenueData?.reduce((sum, r) => sum + r.total_amount, 0) || 0
    const totalExpenses = expenseData?.reduce((sum, e) => sum + e.amount, 0) || 0
    const orderCount = revenueData?.length || 0
    const completedCount =
      revenueData?.filter((r) => r.status === 'completed').length || 0

    setStats({
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      orderCount,
      completedCount,
      avgOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0,
    })
  }

  const loadMonthlyData = async () => {
    // 최근 6개월 데이터
    const { data: profitData, error } = await supabase
      .from('monthly_profit_stats')
      .select('*')
      .order('period_month', { ascending: false })
      .limit(6)

    if (error) throw error

    const formatted: MonthlyData[] =
      profitData?.map((d) => ({
        month: format(new Date(d.period_month), 'yyyy년 MM월', { locale: ko }),
        revenue: d.total_revenue || 0,
        expenses: d.total_expenses || 0,
        profit: d.net_profit || 0,
        orderCount: d.order_count || 0,
      })) || []

    setMonthlyData(formatted.reverse())
  }

  const loadCategoryExpenses = async () => {
    const { startDate, endDate } = getDateRange()

    const { data, error } = await supabase
      .from('expense_by_category_stats')
      .select('*')
      .gte('expense_month', format(new Date(startDate), 'yyyy-MM-dd'))
      .lte('expense_month', format(new Date(endDate), 'yyyy-MM-dd'))

    if (error) throw error

    // 카테고리별로 합산
    const categoryMap = new Map<string, CategoryExpense>()

    data?.forEach((item) => {
      if (!item.category_name || !item.total_amount) return

      if (categoryMap.has(item.category_name)) {
        const existing = categoryMap.get(item.category_name)!
        existing.totalAmount += item.total_amount
        existing.expenseCount += item.expense_count
      } else {
        categoryMap.set(item.category_name, {
          categoryName: item.category_name,
          categoryColor: item.category_color || '#6B7280',
          totalAmount: item.total_amount,
          expenseCount: item.expense_count,
        })
      }
    })

    setCategoryExpenses(
      Array.from(categoryMap.values()).sort((a, b) => b.totalAmount - a.totalAmount)
    )
  }

  const getDateRange = () => {
    const now = new Date()

    switch (period) {
      case 'week':
        return {
          startDate: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
          endDate: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
        }
      case 'month':
        return {
          startDate: startOfMonth(now).toISOString(),
          endDate: endOfMonth(now).toISOString(),
        }
      case 'year':
        return {
          startDate: new Date(now.getFullYear(), 0, 1).toISOString(),
          endDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59).toISOString(),
        }
      default:
        return {
          startDate: startOfMonth(now).toISOString(),
          endDate: endOfMonth(now).toISOString(),
        }
    }
  }

  const getPeriodLabel = () => {
    const now = new Date()
    switch (period) {
      case 'week':
        return `${format(startOfWeek(now, { weekStartsOn: 1 }), 'MM월 dd일', { locale: ko })} - ${format(endOfWeek(now, { weekStartsOn: 1 }), 'MM월 dd일', { locale: ko })}`
      case 'month':
        return format(now, 'yyyy년 MM월', { locale: ko })
      case 'year':
        return format(now, 'yyyy년', { locale: ko })
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">매출 관리</h1>
          <p className="text-gray-600 mt-1">{getPeriodLabel()}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 text-sm font-medium transition ${
                period === 'week'
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              주간
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 text-sm font-medium transition ${
                period === 'month'
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              월간
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-4 py-2 text-sm font-medium transition ${
                period === 'year' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              연간
            </button>
          </div>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            <Plus className="w-5 h-5" />
            지출 추가
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">총 매출</p>
            <p className="text-2xl font-bold">₩{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">총 지출</p>
            <p className="text-2xl font-bold">₩{stats.totalExpenses.toLocaleString()}</p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">순이익</p>
            <p
              className={`text-2xl font-bold ${
                stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              ₩{stats.netProfit.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Order Count */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">주문 건수</p>
            <p className="text-2xl font-bold">{stats.orderCount}건</p>
            <p className="text-xs text-gray-500">완료: {stats.completedCount}건</p>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-6">월별 추이</h2>
        <div className="space-y-4">
          {monthlyData.map((data, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{data.month}</span>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-blue-600">매출: ₩{data.revenue.toLocaleString()}</span>
                  <span className="text-red-600">
                    지출: ₩{data.expenses.toLocaleString()}
                  </span>
                  <span
                    className={`font-semibold ${
                      data.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    이익: ₩{data.profit.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 h-8">
                <div
                  className="bg-blue-500 rounded flex items-center justify-center text-white text-xs font-medium"
                  style={{
                    width: `${(data.revenue / Math.max(...monthlyData.map((d) => d.revenue))) * 100}%`,
                  }}
                >
                  {data.revenue > 0 && '매출'}
                </div>
              </div>
              <div className="flex gap-1 h-8">
                <div
                  className="bg-red-500 rounded flex items-center justify-center text-white text-xs font-medium"
                  style={{
                    width: `${(data.expenses / Math.max(...monthlyData.map((d) => d.revenue))) * 100}%`,
                  }}
                >
                  {data.expenses > 0 && '지출'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Expenses */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-6">카테고리별 지출</h2>
        <div className="space-y-4">
          {categoryExpenses.length === 0 ? (
            <p className="text-center text-gray-500 py-8">지출 내역이 없습니다.</p>
          ) : (
            categoryExpenses.map((cat, index) => (
              <div key={index} className="flex items-center gap-4">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: cat.categoryColor }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{cat.categoryName}</span>
                    <span className="text-sm text-gray-600">
                      ₩{cat.totalAmount.toLocaleString()} ({cat.expenseCount}건)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        backgroundColor: cat.categoryColor,
                        width: `${(cat.totalAmount / Math.max(...categoryExpenses.map((c) => c.totalAmount))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={() => {
          loadData()
          toast.success('지출이 추가되었습니다.')
        }}
      />
    </div>
  )
}
