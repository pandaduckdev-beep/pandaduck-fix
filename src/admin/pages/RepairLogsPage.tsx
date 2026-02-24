import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchControllerModels, fetchControllerServices } from '@/lib/api'

// Supabase Edge Function URL
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
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
  Copy,
  Download,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { RepairLog } from '@/types/database'
import type { ControllerModel, ControllerServiceWithOptions } from '@/types/database'
import { RichTextEditor } from '@/components/common/RichTextEditor'
import { resolveRepairLogThumbnailUrl } from '@/lib/repairLogThumbnail'

type LogStatus = 'all' | 'public' | 'private'
const QUERY_TIMEOUT_MS = 12000

export function RepairLogsPage() {
  const [logs, setLogs] = useState<RepairLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<LogStatus>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<RepairLog | null>(null)
  const [togglingLogId, setTogglingLogId] = useState<string | null>(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [naverBlogId, setNaverBlogId] = useState('')
  const [naverPosts, setNaverPosts] = useState<any[]>([])
  const [loadingNaverPosts, setLoadingNaverPosts] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    thumbnail_url: '',
    controller_model: '',
    repair_type: '',
    is_public: true,
  })

  const [controllerModels, setControllerModels] = useState<ControllerModel[]>([])
  const [controllerServices, setControllerServices] = useState<ControllerServiceWithOptions[]>([])
  const [loadingControllers, setLoadingControllers] = useState(false)

  const withTimeout = async <T,>(promise: Promise<T>, label: string): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error(`${label} timeout`)), QUERY_TIMEOUT_MS)
      }),
    ])
  }

  const loadControllerModels = async () => {
    try {
      setLoadingControllers(true)
      const models = await withTimeout(fetchControllerModels(), 'controller models')
      setControllerModels(models)
    } catch (error) {
      console.error('Failed to load controller models:', error)
      toast.error('컨트롤러 모델을 불러오는데 실패했습니다.')
    } finally {
      setLoadingControllers(false)
    }
  }

  const loadControllerServices = async (controllerModelId: string) => {
    if (!controllerModelId) {
      setControllerServices([])
      return
    }

    try {
      const services = await fetchControllerServices(controllerModelId)
      setControllerServices(services)
    } catch (error) {
      console.error('Failed to load controller services:', error)
      toast.error('서비스 목록을 불러오는데 실패했습니다.')
    }
  }

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

      const { data, error } = await withTimeout(query, 'repair logs list')

      if (error) throw error

      if (statusFilter !== 'all' && (!data || data.length === 0)) {
        const { data: allData, error: allError } = await withTimeout(
          supabase
            .from('repair_logs')
            .select(
              'id,title,summary,controller_model,repair_type,is_public,view_count,naver_blog_url,created_at,updated_at'
            )
            .order('created_at', { ascending: false }),
          'repair logs fallback list'
        )

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
          toast.info('선택한 필터 결과가 없어 전체 작업기로 전환했습니다.')
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
      toast.error('수리 작업기를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadLogs()
    loadControllerModels()
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
      is_public: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = async (log: RepairLog) => {
    try {
      const { data, error } = await withTimeout(
        supabase.from('repair_logs').select('*').eq('id', log.id).single(),
        'repair log detail'
      )

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
      toast.error('작업기 상세를 불러오지 못했습니다.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('제목과 내용은 필수입니다.')
      return
    }

    const imgRegex = /<img[^>]+src=["']([^"']+)["']/i
    const match = formData.content.match(imgRegex)
    const thumbnailCandidate = match ? match[1] : null

    try {
      setSubmitting(true)
      let thumbnailUrl = thumbnailCandidate

      try {
        thumbnailUrl = await resolveRepairLogThumbnailUrl(
          thumbnailCandidate,
          editingLog?.id || formData.title
        )
      } catch (thumbnailError) {
        console.error('Failed to upload thumbnail, fallback to source value:', thumbnailError)
        toast.warning('썸네일 최적화 업로드에 실패해 원본 값으로 저장합니다.')
      }

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
        toast.success('수리 작업기가 수정되었습니다.')
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
        toast.success('수리 작업기가 등록되었습니다.')
      }

      setIsModalOpen(false)
      loadLogs()
    } catch (error) {
      console.error('Failed to save repair log:', error)
      toast.error('저장에 실패했습니다.')
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
      toast.success(
        !currentStatus ? '작업기가 공개되었습니다.' : '작업기가 비공개로 변경되었습니다.'
      )
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

  const copyForNaverBlog = async (log: RepairLog) => {
    try {
      await navigator.clipboard.writeText(log.content)
      toast.success('HTML이 클립보드에 복사되었습니다! 네이버 블로그 에디터에 붙여넣으세요.')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      toast.error('클립보드 복사에 실패했습니다.')
    }
  }

  const fetchNaverBlogPosts = async () => {
    if (!naverBlogId.trim()) {
      toast.error('네이버 블로그 ID를 입력해주세요.')
      return
    }

    try {
      setLoadingNaverPosts(true)

      // 입력값이 전체 URL인 경우 블로그 ID 추출
      let blogId = naverBlogId.trim()
      if (blogId.includes('rss.blog.naver.com')) {
        // URL에서 블로그 ID 추출 (예: https://rss.blog.naver.com/raniansky.xml)
        const match = blogId.match(/rss\.blog\.naver\.com\/([^\/]+)\.xml/)
        if (match) {
          blogId = match[1]
        } else {
          toast.error('올바른 네이버 블로그 RSS URL 형식이 아닙니다.')
          setLoadingNaverPosts(false)
          return
        }
      }

      // 블로그 ID에서 확장자 제거
      blogId = blogId.replace('.xml', '').replace('.xml', '')

      const rssUrl = `https://blog.rss.naver.com/${blogId}.xml`

      // CORS 프록시 사용 (개발용)
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`

      const response = await fetch(proxyUrl)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const text = await response.text()
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(text, 'text/xml')

      const items = xmlDoc.querySelectorAll('item')
      const posts: any[] = []

      items.forEach((item) => {
        const title = item.querySelector('title')?.textContent || ''
        const link = item.querySelector('link')?.textContent || ''
        const pubDate = item.querySelector('pubDate')?.textContent || ''
        const descriptionHtml = item.querySelector('description')?.textContent || ''

        // 모든 이미지 URL 추출
        const imageUrls: string[] = []
        const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi
        let match
        while ((match = imgRegex.exec(descriptionHtml)) !== null) {
          if (match[1] && !imageUrls.includes(match[1])) {
            imageUrls.push(match[1])
          }
        }

        // HTML을 텍스트로 변환하되 줄바꿈 유지
        let cleanText = descriptionHtml
          // CDATA 제거
          .replace(/<!\[CDATA\[|\]\]>/g, '')
          // 이미지 태그 제거 전에 줄바꿈 처리
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>\s*<p>/gi, '\n\n')
          .replace(/<\/div>\s*<div>/gi, '\n')
          // HTML 태그 모두 제거
          .replace(/<[^>]+>/g, '')
          // HTML 엔티티 디코딩
          .replace(/&nbsp;/g, ' ')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          // 연속된 빈 줄 정리
          .replace(/\n\s*\n\s*\n/g, '\n\n')
          .trim()

        // 첫 번째 이미지를 썸네일로 사용
        const firstImageUrl = imageUrls.length > 0 ? imageUrls[0] : ''

        if (title && link) {
          posts.push({
            title,
            link,
            pubDate,
            description: cleanText,
            firstImageUrl,
            allImages: imageUrls,
          })
        }
      })

      if (posts.length === 0) {
        toast.warning('가져올 블로그 글이 없습니다.')
      } else {
        setNaverPosts(posts)
        toast.success(`${posts.length}개의 블로그 글을 가져왔습니다.`)
      }
    } catch (error) {
      console.error('Failed to fetch Naver blog posts:', error)
      toast.error('블로그 글을 가져오는데 실패했습니다. 블로그 ID를 확인해주세요.')
    } finally {
      setLoadingNaverPosts(false)
    }
  }

  const importNaverPost = async (post: any) => {
    // 편집 모드 초기화
    setEditingLog(null)

    // 네이버 블로그 링크를 클립보드에 복사
    if (post.link) {
      try {
        await navigator.clipboard.writeText(post.link)
        toast.success('블로그 글을 가져왔습니다. 컨트롤러 모델을 선택하고 저장해주세요.', {
          id: 'import-naver-post',
          duration: 5000,
        })
      } catch (err) {
        console.error('Failed to copy link:', err)
      }
    }

    // 폼 데이터 설정 (제목과 본문만 가져오기)
    setFormData({
      title: post.title,
      content: post.description || '',
      summary: '',
      thumbnail_url: '',
      controller_model: '',
      repair_type: '',
      is_public: true,
    })

    // Import Modal 닫기
    setIsImportModalOpen(false)
    // Create Modal 열기
    setIsModalOpen(true)
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Download className="w-5 h-5" />
            블로그 글 가져오기
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            <Plus className="w-5 h-5" />새 글 작성
          </button>
        </div>
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                제목 / 내용
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">컨트롤러</th>
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
                  {log.content && (
                    <div className="text-sm text-gray-500 max-w-[200px] line-clamp-2">
                      {log.content.replace(/<[^>]+>/g, '').slice(0, 100)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <div>{log.controller_model || '-'}</div>
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
                      onClick={() => copyForNaverBlog(log)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="네이버 블로그로 복사"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
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

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">네이버 블로그 글 가져오기</h2>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Tab Navigation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  네이버 블로그 ID
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={naverBlogId}
                    onChange={(e) => setNaverBlogId(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 outline-none"
                    placeholder="예: pandaduckblog 또는 https://rss.blog.naver.com/pandaduckblog.xml"
                  />
                  <button
                    type="button"
                    onClick={fetchNaverBlogPosts}
                    disabled={loadingNaverPosts || !naverBlogId.trim()}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingNaverPosts ? '가져오는 중...' : '가져오기'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  블로그 ID 또는 전체 RSS URL을 입력하세요
                </p>
              </div>

              {/* RSS 목록 */}
              {loadingNaverPosts ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">블로그 글을 가져오는 중...</p>
                  <p className="text-sm text-gray-500">
                    네이버 블로그에서 글 목록을 가져오고 있습니다.
                  </p>
                </div>
              ) : naverPosts.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    가져온 블로그 글 ({naverPosts.length}개)
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-4">
                    {naverPosts.map((post, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => importNaverPost(post)}
                        className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition"
                      >
                        <div className="font-semibold text-gray-900 mb-1">{post.title}</div>
                        <div className="text-sm text-gray-500">
                          {post.pubDate ? new Date(post.pubDate).toLocaleDateString('ko-KR') : ''}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-600 mb-2">가져온 블로그 글이 없습니다.</p>
                  <p className="text-sm text-gray-500">
                    네이버 블로그 ID를 확인하거나, 블로그의 RSS 피드 설정이 공개로 되어 있는지
                    확인해주세요.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                disabled={submitting}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitting && (
              <div className="px-6 pt-3 pb-1 border-b border-gray-100">
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-black rounded-full animate-pulse" />
                </div>
                <p className="text-xs text-gray-500 mt-2">저장 중입니다. 잠시만 기다려주세요...</p>
              </div>
            )}

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

              {/* Controller Model */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  컨트롤러 모델
                </label>
                <select
                  value={formData.controller_model}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      controller_model: e.target.value,
                    })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 outline-none"
                  disabled={loadingControllers}
                >
                  <option value="">선택안함</option>
                  {controllerModels.map((model) => (
                    <option key={model.id} value={model.model_name}>
                      {model.model_name}
                    </option>
                  ))}
                </select>
                {loadingControllers && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    로딩 중...
                  </div>
                )}
              </div>

              {/* Repair Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">수리 유형</label>
                <input
                  type="text"
                  value={formData.repair_type}
                  onChange={(e) => setFormData({ ...formData, repair_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 outline-none"
                  placeholder="예: 버튼 교체, 조이스틱 수리"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  내용 <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content: content })}
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
                  disabled={submitting}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? '저장 중...' : editingLog ? '수정' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
