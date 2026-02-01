import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Edit, Trash2, Plus, Search, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ExpenseModal } from '../components/ExpenseModal'
import { EditExpenseModal } from '../components/EditExpenseModal'

interface Expense {
  id: string
  category_id: string
  expense_date: string
  amount: number
  title: string
  description: string | null
  supplier: string | null
  created_at: string
  expense_categories?: {
    name: string
    color: string
  }
}

interface ExpenseCategory {
  id: string
  name: string
  color: string
}

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([loadExpenses(), loadCategories()])
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('데이터 로드에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const loadExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*, expense_categories(name, color)')
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    setExpenses(data || [])
  }

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('id, name, color')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error
    setCategories(data || [])
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('정말 이 지출 내역을 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id)

      if (error) throw error

      await loadExpenses()
      toast.success('지출 내역이 삭제되었습니다.')
    } catch (error) {
      console.error('Failed to delete expense:', error)
      toast.error('지출 삭제에 실패했습니다.')
    }
  }

  const openEditModal = (expense: Expense) => {
    setSelectedExpense(expense)
    setIsEditModalOpen(true)
  }

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.supplier?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory === 'all' || expense.category_id === selectedCategory

    return matchesSearch && matchesCategory
  })

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)

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
          <h1 className="text-3xl font-bold">지출 내역 관리</h1>
          <p className="text-gray-600 mt-1">총 {filteredExpenses.length}건</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <Plus className="w-5 h-5" />
          지출 추가
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="항목명, 설명, 구매처 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400"
            >
              <option value="all">전체 카테고리</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Total Amount */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">필터링된 지출 합계</span>
            <span className="text-2xl font-bold text-red-600">
              ₩{totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  날짜
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  카테고리
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  항목명
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  구매처
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  금액
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || selectedCategory !== 'all'
                      ? '검색 결과가 없습니다.'
                      : '등록된 지출 내역이 없습니다.'}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {format(new Date(expense.expense_date), 'yyyy년 MM월 dd일', {
                        locale: ko,
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{
                            backgroundColor:
                              expense.expense_categories?.color || '#6B7280',
                          }}
                        />
                        <span className="text-sm text-gray-900">
                          {expense.expense_categories?.name || '미분류'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="font-medium text-gray-900">{expense.title}</div>
                        {expense.description && (
                          <div className="text-sm text-gray-600 truncate">
                            {expense.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {expense.supplier || '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      ₩{expense.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(expense)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          title="수정"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          loadExpenses()
          toast.success('지출이 추가되었습니다.')
        }}
      />

      <EditExpenseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedExpense(null)
        }}
        expense={selectedExpense}
        onSuccess={() => {
          loadExpenses()
          toast.success('지출이 수정되었습니다.')
        }}
      />
    </div>
  )
}
