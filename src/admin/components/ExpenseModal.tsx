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

interface ExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ExpenseModal({ isOpen, onClose, onSuccess }: ExpenseModalProps) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [formData, setFormData] = useState({
    category_id: '',
    expense_date: new Date().toISOString().split('T')[0],
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

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('id, name, color')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      setCategories(data || [])

      // 첫 번째 카테고리를 기본 선택
      if (data && data.length > 0 && !formData.category_id) {
        setFormData((prev) => ({ ...prev, category_id: data[0].id }))
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
      toast.error('카테고리 로드에 실패했습니다.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
      const { error } = await supabase.from('expenses').insert({
        category_id: formData.category_id,
        expense_date: formData.expense_date,
        amount: formData.amount,
        title: formData.title,
        description: formData.description || null,
        supplier: formData.supplier || null,
      })

      if (error) throw error

      // 폼 초기화
      setFormData({
        category_id: categories[0]?.id || '',
        expense_date: new Date().toISOString().split('T')[0],
        amount: 0,
        title: '',
        description: '',
        supplier: '',
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to add expense:', error)
      toast.error('지출 추가에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>지출 추가</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expense_date">지출 날짜 *</Label>
              <Input
                id="expense_date"
                type="date"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="category_id">카테고리 *</Label>
              <select
                id="category_id"
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
            <Label htmlFor="title">지출 항목명 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="예: PS5 컨트롤러 스틱 부품"
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">금액 (원) *</Label>
            <Input
              id="amount"
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
            <Label htmlFor="supplier">공급업체/구매처</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="예: 알리익스프레스, 쿠팡 등"
            />
          </div>

          <div>
            <Label htmlFor="description">상세 설명</Label>
            <textarea
              id="description"
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
              {loading ? '추가 중...' : '지출 추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
