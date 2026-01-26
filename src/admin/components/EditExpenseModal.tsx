import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/button'

interface ExpenseCategory {
  id: string
  name: string
  color: string
}

interface Expense {
  id: string
  category_id: string
  expense_date: string
  amount: number
  title: string
  description: string | null
  supplier: string | null
}

interface EditExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  expense: Expense | null
  onSuccess: () => void
}

export function EditExpenseModal({ isOpen, onClose, expense, onSuccess }: EditExpenseModalProps) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [formData, setFormData] = useState({
    category_id: '',
    expense_date: '',
    amount: 0,
    title: '',
    description: '',
    supplier: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadCategories()
    }
  }, [isOpen])

  useEffect(() => {
    if (expense) {
      setFormData({
        category_id: expense.category_id,
        expense_date: expense.expense_date,
        amount: expense.amount,
        title: expense.title,
        description: expense.description || '',
        supplier: expense.supplier || '',
      })
    }
  }, [expense])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('id, name, color')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Failed to load categories:', error)
      toast.error('카테고리 로드에 실패했습니다.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!expense) return

    if (!formData.title.trim()) {
      toast.error('지출 항목명을 입력해주세요.')
      return
    }

    if (!formData.category_id) {
      toast.error('카테고리를 선택해주세요.')
      return
    }

    if (formData.amount <= 0) {
      toast.error('금액을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          category_id: formData.category_id,
          expense_date: formData.expense_date,
          amount: formData.amount,
          title: formData.title,
          description: formData.description || null,
          supplier: formData.supplier || null,
        })
        .eq('id', expense.id)

      if (error) throw error

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to update expense:', error)
      toast.error('지출 수정에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!expense) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>지출 수정</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_expense_date">지출 날짜 *</Label>
              <Input
                id="edit_expense_date"
                type="date"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit_category_id">카테고리 *</Label>
              <select
                id="edit_category_id"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="edit_title">지출 항목명 *</Label>
            <Input
              id="edit_title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="예: PS5 컨트롤러 스틱 부품"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit_amount">금액 (원) *</Label>
            <Input
              id="edit_amount"
              type="number"
              value={formData.amount || ''}
              onChange={(e) =>
                setFormData({ ...formData, amount: Number(e.target.value) || 0 })
              }
              placeholder="예: 25000"
              min="0"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit_supplier">공급업체/구매처</Label>
            <Input
              id="edit_supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="예: 알리익스프레스, 쿠팡 등"
            />
          </div>

          <div>
            <Label htmlFor="edit_description">상세 설명</Label>
            <textarea
              id="edit_description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="지출에 대한 상세 설명을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '수정 중...' : '수정 완료'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
