import { MobileHeader } from '../components/MobileHeader'
import { MobileFooterNav } from '../components/MobileFooterNav'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Image as ImageIcon,
  ExternalLink,
  Search,
} from 'lucide-react'
import { useToast } from '@/hooks/useToast.tsx'
import type { RepairLog } from '@/types/database'
import { RichTextEditor } from '@/components/common/RichTextEditor'
import { resolveRepairLogThumbnailUrl } from '@/lib/repairLogThumbnail'

type LogStatus = 'all' | 'public' | 'private'

export default function RepairLogsPage() {
  const { success, error: showError } = useToast()
  const [logs, setLogs] = useState<RepairLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<LogStatus>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<RepairLog | null>(null)
  const [togglingLogId, setTogglingLogId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

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
      setLoading(true)
      let query = supabase
        .from('repair_logs')
        .select(
          'id,title,summary,controller_model,repair_type,is_public,view_count,naver_blog_url,created_at,updated_at'
        )
        .order('created_at', { ascending: false })

      if (statusFilter === 'private') {
        query = query.eq('is_public', false)
      } else if (statusFilter === 'public') {
        query = query.eq('is_public', true)
      }

      const { data, error } = await query

      if (error) throw error

      if (statusFilter !== 'all' && (!data || data.length === 0)) {
        const { data: allData, error: allError } = await supabase
          .from('repair_logs')
          .select(
            'id,title,summary,controller_model,repair_type,is_public,view_count,naver_blog_url,created_at,updated_at'
          )
          .order('created_at', { ascending: false })

        if (allError) throw allError

        if ((allData || []).length > 0) {
          setStatusFilter('all')
          setLogs(
            (allData || []).map((row) => ({
              ...row,
              content: '',
              thumbnail_url: null,
              image_urls: [],
              naver_synced_at: null,
            })) as RepairLog[]
          )
          success('안내', '선택한 필터 결과가 없어 전체 작업기로 전환했습니다.')
          return
        }
      }

      setLogs(
        (data || []).map((row) => ({
          ...row,
          content: '',
          thumbnail_url: null,
          image_urls: [],
          naver_synced_at: null,
        })) as RepairLog[]
      )
    } catch (error) {
      console.error('Failed to load repair logs:', error)
      showError('로드 실패', '수리 작업기를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, showError])

  useEffect(() => {
    loadLogs()
  }, [statusFilter, loadLogs])

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      log.title.toLowerCase().includes(search) ||
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

  const openEditModal = async (log: RepairLog) => {
    try {
      const { data, error } = await supabase
        .from('repair_logs')
        .select('*')
        .eq('id', log.id)
        .single()

      if (error) throw error

      setEditingLog(data)
      setFormData({
        title: data.title,
        content: data.content,
        summary: data.summary || '',
        thumbnail_url: data.thumbnail_url || '',
        controller_model: data.controller_model || '',
        repair_type: data.repair_type || '',
        is_public: data.is_public,
      })
      setIsModalOpen(true)
    } catch (error) {
      console.error('Failed to load repair log detail:', error)
      showError('로드 실패', '작업기 상세를 불러오지 못했습니다.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      showError('입력 오류', '제목과 내용은 필수입니다.')
      return
    }

    try {
      setSubmitting(true)

      const imgRegex = /<img[^>]+src=["']([^"']+)["']/i
      const match = formData.content.match(imgRegex)
      const thumbnailCandidate = formData.thumbnail_url || (match ? match[1] : null)
      const thumbnailUrl = await resolveRepairLogThumbnailUrl(
        thumbnailCandidate,
        editingLog?.id || formData.title
      )

      if (editingLog) {
        const { error } = await supabase
          .from('repair_logs')
          .update({
            title: formData.title,
            content: formData.content,
            summary: formData.summary || null,
            thumbnail_url: thumbnailUrl,
            controller_model: formData.controller_model || null,
            repair_type: formData.repair_type || null,
            is_public: formData.is_public,
          })
          .eq('id', editingLog.id)

        if (error) throw error
        success('완료', '수리 작업기가 수정되었습니다.')
      } else {
        const { error } = await supabase.from('repair_logs').insert({
          title: formData.title,
          content: formData.content,
          summary: formData.summary || null,
          thumbnail_url: thumbnailUrl,
          controller_model: formData.controller_model || null,
          repair_type: formData.repair_type || null,
          is_public: formData.is_public,
        })

        if (error) throw error
        success('완료', '수리 작업기가 등록되었습니다.')
      }

      setIsModalOpen(false)
      loadLogs()
    } catch (error) {
      console.error('Failed to save repair log:', error)
      showError('실패', '저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
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
      success(
        '완료',
        !currentStatus ? '작업기가 공개되었습니다.' : '작업기가 비공개로 변경되었습니다.'
      )
    } catch (error) {
      console.error('Failed to toggle public:', error)
      showError('실패', '공개 상태 변경에 실패했습니다.')
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
      success('완료', '작업기가 삭제되었습니다.')
    } catch (error) {
      console.error('Failed to delete repair log:', error)
      showError('실패', '삭제에 실패했습니다.')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F5F5F7] border-t-[#007AFF] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#86868B] text-sm" style={{ fontWeight: 600 }}>
            로딩 중...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#F5F5F7] min-h-screen pb-20">
      <MobileHeader title="수리 작업기" subtitle={`총 ${filteredLogs.length}건`} />

      <main className="p-4 space-y-4">
        {/* Search & Filter */}
        <div className="bg-white rounded-2xl p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B]" />
            <input
              type="text"
              placeholder="제목, 내용, 컨트롤러 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#F5F5F7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#007AFF]/20"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'public', 'private'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                  statusFilter === status
                    ? 'bg-[#007AFF] text-white'
                    : 'bg-[#F5F5F7] text-[#86868B]'
                }`}
              >
                {status === 'all' ? '전체' : status === 'public' ? '공개' : '비공개'}
              </button>
            ))}
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={openCreateModal}
          className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <Plus className="w-5 h-5" />새 작업기 작성
        </button>

        {/* Logs List */}
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div key={log.id} className="bg-white rounded-2xl overflow-hidden">
              <div className="flex gap-3 p-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  {log.thumbnail_url ? (
                    <img
                      src={log.thumbnail_url}
                      alt={log.title}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-[#F5F5F7] rounded-xl flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-[#86868B]" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base text-[#1D1D1F] font-semibold line-clamp-2">
                      {log.title}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {log.is_public ? (
                        <Eye className="w-4 h-4 text-[#34C759]" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-[#86868B]" />
                      )}
                    </div>
                  </div>
                  {log.summary && (
                    <p className="text-sm text-[#86868B] line-clamp-1 mt-1">{log.summary}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-[#86868B]">
                    {log.controller_model && <span>{log.controller_model}</span>}
                    {log.controller_model && log.repair_type && <span>·</span>}
                    {log.repair_type && <span>{log.repair_type}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#86868B]">
                    <span>{formatDate(log.created_at)}</span>
                    <span>·</span>
                    <span>조회 {log.view_count}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex border-t border-[rgba(0,0,0,0.06)]">
                <button
                  onClick={() => togglePublic(log.id, log.is_public)}
                  disabled={togglingLogId === log.id}
                  className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium text-[#007AFF] active:bg-[#F5F5F7] transition-all"
                >
                  {togglingLogId === log.id ? (
                    <div className="w-4 h-4 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
                  ) : log.is_public ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      비공개
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      공개
                    </>
                  )}
                </button>
                <div className="w-px bg-[rgba(0,0,0,0.06)]" />
                <button
                  onClick={() => openEditModal(log)}
                  className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium text-[#007AFF] active:bg-[#F5F5F7] transition-all"
                >
                  <Edit className="w-4 h-4" />
                  수정
                </button>
                <div className="w-px bg-[rgba(0,0,0,0.06)]" />
                {log.naver_blog_url ? (
                  <a
                    href={log.naver_blog_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium text-[#34C759] active:bg-[#F5F5F7] transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    블로그
                  </a>
                ) : (
                  <button
                    onClick={() => deleteLog(log.id)}
                    className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium text-[#FF3B30] active:bg-[#F5F5F7] transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center">
              <p className="text-[#86868B] text-sm">
                {searchTerm ? '검색 결과가 없습니다.' : '작성된 작업기가 없습니다.'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col">
          <div className="flex-1 overflow-y-auto bg-white safe-area-top">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-[rgba(0,0,0,0.06)] px-4 py-4 flex items-center justify-between z-10">
              <button onClick={() => setIsModalOpen(false)} className="p-2 -ml-2 text-[#007AFF]">
                취소
              </button>
              <h2 className="text-lg font-bold text-[#1D1D1F]">
                {editingLog ? '작업기 수정' : '새 작업기'}
              </h2>
              <button
                onClick={handleSubmit}
                disabled={submitting || !formData.title.trim() || !formData.content.trim()}
                className="p-2 -mr-2 text-[#007AFF] font-semibold disabled:opacity-50"
              >
                {submitting ? '저장 중...' : '저장'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                  제목 <span className="text-[#FF3B30]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F5F5F7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#007AFF]/20"
                  placeholder="수리 작업기 제목을 입력하세요"
                  required
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">요약</label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F5F5F7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#007AFF]/20"
                  placeholder="목록에 표시될 요약 (선택)"
                />
              </div>

              {/* Controller Model */}
              <div>
                <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                  컨트롤러 모델
                </label>
                <input
                  type="text"
                  value={formData.controller_model}
                  onChange={(e) => setFormData({ ...formData, controller_model: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F5F5F7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#007AFF]/20"
                  placeholder="예: PS5 듀얼센스"
                />
              </div>

              {/* Repair Type */}
              <div>
                <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">수리 유형</label>
                <input
                  type="text"
                  value={formData.repair_type}
                  onChange={(e) => setFormData({ ...formData, repair_type: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F5F5F7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#007AFF]/20"
                  placeholder="예: 스틱 드리프트 수리"
                />
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                  썸네일 이미지 URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F5F5F7] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#007AFF]/20"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.thumbnail_url && (
                  <div className="mt-2">
                    <img
                      src={formData.thumbnail_url}
                      alt="썸네일 미리보기"
                      className="w-24 h-24 object-cover rounded-xl"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">
                  내용 <span className="text-[#FF3B30]">*</span>
                </label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="수리 과정을 상세히 작성해주세요..."
                />
              </div>

              {/* Public Toggle */}
              <div className="flex items-center justify-between py-3 border-t border-[rgba(0,0,0,0.06)]">
                <div>
                  <p className="text-sm font-semibold text-[#1D1D1F]">공개 여부</p>
                  <p className="text-xs text-[#86868B]">
                    {formData.is_public ? '웹사이트에 표시됩니다' : '비공개 상태입니다'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_public: !formData.is_public })}
                  className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors ${
                    formData.is_public ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'
                  }`}
                >
                  <span
                    className={`inline-block w-6 h-6 transform rounded-full bg-white shadow transition-transform ${
                      formData.is_public ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MobileFooterNav />
    </div>
  )
}
