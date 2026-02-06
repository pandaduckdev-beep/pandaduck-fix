import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Search,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  X,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import type { RepairLog } from '@/types/database'

type LogStatus = 'all' | 'public' | 'private'

export function RepairLogsPage() {
  const [logs, setLogs] = useState<RepairLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<LogStatus>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<RepairLog | null>(null)
  const [togglingLogId, setTogglingLogId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    thumbnail_url: '',
    controller_model: '',
    repair_type: '',
    is_public: false,
  })

  const loadLogs = useCallback(async () => {
    try {
      let query = supabase.from('repair_logs').select('*').order('created_at', { ascending: false })

      if (statusFilter === 'private') {
        query = query.eq('is_public', false)
      } else if (statusFilter === 'public') {
        query = query.eq('is_public', true)
      }

      const { data, error } = await query

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error('Failed to load repair logs:', error)
      toast.error('수리 작업기를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadLogs()
  }, [statusFilter, loadLogs])

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      log.title.toLowerCase().includes(search) ||
      log.content.toLowerCase().includes(search) ||
      (log.controller_model && log.controller_model.toLowerCase().includes(search)) ||
      (log.repair_type && log.repair_type.toLowerCase().includes(search))
    )
  })

  const openCreateModal = () => {
    setEditingLog(null)
    setFormData({
      title: '',
      content: '',
      summary: '',
      thumbnail_url: '',
      controller_model: '',
      repair_type: '',
      is_public: false,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (log: RepairLog) => {
    setEditingLog(log)
    setFormData({
      title: log.title,
      content: log.content,
      summary: log.summary || '',
      thumbnail_url: log.thumbnail_url || '',
      controller_model: log.controller_model || '',
      repair_type: log.repair_type || '',
      is_public: log.is_public,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('제목과 내용은 필수입니다.')
      return
    }

    try {
      if (editingLog) {
        // Update
        const { error } = await supabase
          .from('repair_logs')
          .update({
            title: formData.title,
            content: formData.content,
            summary: formData.summary || null,
            thumbnail_url: formData.thumbnail_url || null,
            controller_model: formData.controller_model || null,
            repair_type: formData.repair_type || null,
            is_public: formData.is_public,
          })
          .eq('id', editingLog.id)

        if (error) throw error
        toast.success('수리 작업기가 수정되었습니다.')
      } else {
        // Create
        const { error } = await supabase.from('repair_logs').insert({
          title: formData.title,
          content: formData.content,
          summary: formData.summary || null,
          thumbnail_url: formData.thumbnail_url || null,
          controller_model: formData.controller_model || null,
          repair_type: formData.repair_type || null,
          is_public: formData.is_public,
        })

        if (error) throw error
        toast.success('수리 작업기가 등록되었습니다.')
      }

      setIsModalOpen(false)
      loadLogs()
    } catch (error) {
      console.error('Failed to save repair log:', error)
      toast.error('저장에 실패했습니다.')
    }
  }

  const togglePublic = async (logId: string, currentStatus: boolean) => {
    try {
      setTogglingLogId(logId)

      const { error } = await supabase
        .from('repair_logs')
        .update({ is_public: !currentStatus })
        .eq('id', logId)

      if (error) throw error
      await loadLogs()
      toast.success(!currentStatus ? '작업기가 공개되었습니다.' : '작업기가 비공개로 변경되었습니다.')
    } catch (error) {
      console.error('Failed to toggle public:', error)
      toast.error('공개 상태 변경에 실패했습니다.')
    } finally {
      setTogglingLogId(null)
    }
  }

  const deleteLog = async (logId: string) => {
    if (!confirm('정말 이 작업기를 삭제하시겠습니까?')) {
      return
    }

    try {
      const { error } = await supabase.from('repair_logs').delete().eq('id', logId)

      if (error) throw error
      await loadLogs()
      toast.success('작업기가 삭제되었습니다.')
    } catch (error) {
      console.error('Failed to delete repair log:', error)
      toast.error('삭제에 실패했습니다.')
    }
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
        <h1 className="text-3xl font-bold">수리 작업기</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          <Plus className="w-5 h-5" />
          새 글 작성
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6 space-y-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="제목, 내용, 컨트롤러, 수리 유형 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LogStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 outline-none"
          >
            <option value="all">전체 상태</option>
            <option value="public">공개</option>
            <option value="private">비공개</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-600 mb-4">
        총 <span className="font-semibold text-black">{filteredLogs.length}</span>건
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">썸네일</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">제목</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                컨트롤러 / 수리유형
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">공개</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">조회수</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">작성일</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {log.thumbnail_url ? (
                    <img
                      src={log.thumbnail_url}
                      alt={log.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900 max-w-[200px] truncate">
                    {log.title}
                  </div>
                  {log.summary && (
                    <div className="text-sm text-gray-500 max-w-[200px] truncate">{log.summary}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <div>{log.controller_model || '-'}</div>
                  <div className="text-gray-500">{log.repair_type || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePublic(log.id, log.is_public)}
                      disabled={togglingLogId === log.id}
                      className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                        log.is_public ? 'bg-green-600' : 'bg-gray-300'
                      } ${togglingLogId === log.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={log.is_public ? '공개 (클릭하여 비공개)' : '비공개 (클릭하여 공개)'}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${
                          log.is_public ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    {togglingLogId === log.id && (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.view_count}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(log.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(log)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title="수정"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {log.naver_blog_url && (
                      <a
                        href={log.naver_blog_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="네이버 블로그 보기"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            {searchTerm ? '검색 결과가 없습니다.' : '작성된 작업기가 없습니다.'}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingLog ? '수리 작업기 수정' : '새 수리 작업기 작성'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 outline-none"
                  placeholder="수리 작업기 제목을 입력하세요"
                  required
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">요약</label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 outline-none"
                  placeholder="목록에 표시될 요약 (선택사항)"
                />
              </div>

              {/* Controller Model & Repair Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    컨트롤러 모델
                  </label>
                  <input
                    type="text"
                    value={formData.controller_model}
                    onChange={(e) => setFormData({ ...formData, controller_model: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 outline-none"
                    placeholder="예: PS5 듀얼센스"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">수리 유형</label>
                  <input
                    type="text"
                    value={formData.repair_type}
                    onChange={(e) => setFormData({ ...formData, repair_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 outline-none"
                    placeholder="예: 스틱 드리프트 수리"
                  />
                </div>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  썸네일 이미지 URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 outline-none"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.thumbnail_url && (
                  <div className="mt-2">
                    <img
                      src={formData.thumbnail_url}
                      alt="썸네일 미리보기"
                      className="w-32 h-24 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 outline-none min-h-[300px] resize-y"
                  placeholder="수리 과정을 상세히 작성해주세요..."
                  required
                />
              </div>

              {/* Public Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_public: !formData.is_public })}
                  className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                    formData.is_public ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${
                      formData.is_public ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {formData.is_public ? '공개' : '비공개'}
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                >
                  {editingLog ? '수정' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
