import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Eye, CheckCircle, XCircle, Trash2, Star, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Review } from '@/types/database'
import { getControllerModelById } from '@/services/pricingService'

type ReviewStatus = 'all' | 'pending' | 'approved'

const STATUS_CONFIG: Record<ReviewStatus, { label: string; color: string }> = {
  all: { label: '전체 상태', color: '' },
  pending: { label: '승인 대기', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: '승인됨', color: 'bg-green-100 text-green-800' },
}

interface ReviewWithRequest extends Review {
  customer_phone?: string
  controller_model?: string
  controller_model_name?: string
  services_list?: string
}

export function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReviewStatus>('all')
  const [selectedReview, setSelectedReview] = useState<ReviewWithRequest | null>(null)

  const loadReviews = useCallback(async () => {
    try {
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false })

      if (statusFilter === 'pending') {
        query = query.eq('is_approved', false)
      } else if (statusFilter === 'approved') {
        query = query.eq('is_approved', true)
      }

      const { data, error } = await query

      if (error) throw error

      // repair_request_id로 연결된 수리 의뢰 정보 가져오기
      const reviewsWithRequest = await Promise.all(
        (data || []).map(async (review) => {
          if (!review.repair_request_id) {
            return review
          }

          const { data: repairRequest } = await supabase
            .from('repair_requests')
            .select('customer_phone, controller_model')
            .eq('id', review.repair_request_id)
            .single()

          // Get controller model name
          let controllerModelName = repairRequest?.controller_model
          if (repairRequest?.controller_model) {
            // controller_model is UUID, so query directly from controller_models table
            const { data: modelData } = await supabase
              .from('controller_models')
              .select('model_name')
              .eq('id', repairRequest.controller_model)
              .single()

            if (modelData) {
              controllerModelName = modelData.model_name
            }
          }

          // Get services list
          let servicesList = review.service_name || ''
          if (review.repair_request_id) {
            const { data: requestServices } = await supabase
              .from('repair_request_services')
              .select('service_id')
              .eq('repair_request_id', review.repair_request_id)

            if (requestServices && requestServices.length > 0) {
              const serviceIds = requestServices.map((s) => s.service_id)
              const { data: services } = await supabase
                .from('controller_services')
                .select('name')
                .in('id', serviceIds)

              if (services && services.length > 0) {
                servicesList = services.map((s) => s.name).join(', ')
              }
            }
          }

          return {
            ...review,
            customer_phone: repairRequest?.customer_phone,
            controller_model: repairRequest?.controller_model,
            controller_model_name: controllerModelName,
            services_list: servicesList,
          }
        })
      )

      setReviews(reviewsWithRequest)
    } catch (error) {
      console.error('Failed to load reviews:', error)
      toast.error('리뷰를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadReviews()
  }, [statusFilter, loadReviews])

  const filteredReviews = reviews.filter((review) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      review.customer_name.toLowerCase().includes(search) ||
      review.service_name.toLowerCase().includes(search) ||
      review.content.toLowerCase().includes(search)
    )
  })

  const toggleApproval = async (reviewId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: !currentStatus })
        .eq('id', reviewId)

      if (error) throw error
      await loadReviews()
      toast.success(!currentStatus ? '리뷰가 승인되었습니다.' : '리뷰 승인이 취소되었습니다.')
    } catch (error) {
      console.error('Failed to toggle approval:', error)
      toast.error('승인 상태 변경에 실패했습니다.')
    }
  }

  const togglePublic = async (reviewId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_public: !currentStatus })
        .eq('id', reviewId)

      if (error) throw error
      await loadReviews()
      toast.success(!currentStatus ? '리뷰가 공개되었습니다.' : '리뷰가 비공개로 변경되었습니다.')
    } catch (error) {
      console.error('Failed to toggle public:', error)
      toast.error('공개 상태 변경에 실패했습니다.')
    }
  }

  const deleteReview = async (reviewId: string) => {
    if (!confirm('정말 이 리뷰를 삭제하시겠습니까?')) {
      return
    }

    try {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId)

      if (error) throw error
      await loadReviews()
      toast.success('리뷰가 삭제되었습니다.')
    } catch (error) {
      console.error('Failed to delete review:', error)
      toast.error('리뷰 삭제에 실패했습니다.')
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
        <h1 className="text-3xl font-bold">리뷰 관리</h1>
        <div className="text-sm text-gray-600">
          총 <span className="font-semibold text-black">{reviews.length}</span>건
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
              placeholder="고객명, 서비스명, 리뷰 내용 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReviewStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
          >
            <option value="all">전체 상태</option>
            {Object.entries(STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">고객</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">서비스</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">평점</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">리뷰 내용</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">승인</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">공개</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">작성일</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredReviews.map((review) => (
              <tr key={review.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{review.customer_name}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {review.services_list || review.service_name || '-'}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold">{review.rating}점</span>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-[200px] truncate text-sm text-gray-700">
                    {review.content}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      review.is_approved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {review.is_approved ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        승인됨
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        대기
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => togglePublic(review.id, review.is_public)}
                    className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                      review.is_public ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                    title={
                      review.is_public
                        ? '공개 상태 (클릭하여 비공개)'
                        : '비공개 상태 (클릭하여 공개)'
                    }
                  >
                    <span
                      className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${
                        review.is_public ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(review.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedReview(review)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title="상세보기"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleApproval(review.id, review.is_approved)}
                      className={`p-2 hover:rounded-lg transition ${
                        review.is_approved
                          ? 'text-gray-600 hover:bg-gray-100'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={review.is_approved ? '승인 취소' : '승인'}
                    >
                      {review.is_approved ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
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

        {filteredReviews.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            {searchTerm ? '검색 결과가 없습니다.' : '리뷰가 없습니다.'}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">리뷰 상세</h2>
              <button
                onClick={() => setSelectedReview(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">고객 정보</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">이름</span>
                    <span className="font-semibold">{selectedReview.customer_name}</span>
                  </div>
                  {selectedReview.customer_phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">전화번호</span>
                      <span className="font-semibold">{selectedReview.customer_phone}</span>
                    </div>
                  )}
                  {selectedReview.controller_model_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">컨트롤러</span>
                      <span className="font-semibold">{selectedReview.controller_model_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Service & Rating */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">서비스 및 평점</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">서비스</span>
                    <span className="font-semibold">
                      {selectedReview.services_list || selectedReview.service_name || '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">평점</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < selectedReview.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-lg font-semibold">
                        {selectedReview.rating} / 5
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">리뷰 내용</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedReview.content}</p>
                </div>
              </div>

              {/* Review Images */}
              {selectedReview.image_urls && selectedReview.image_urls.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">첨부 이미지 ({selectedReview.image_urls.length}장)</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {selectedReview.image_urls.map((imageUrl, index) => (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`리뷰 이미지 ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">승인 상태</div>
                    <div
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        selectedReview.is_approved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {selectedReview.is_approved ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          승인됨
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          대기
                        </>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">공개 상태</div>
                    <div
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        selectedReview.is_public
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {selectedReview.is_public ? '공개' : '비공개'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="border-t border-gray-200 pt-4 text-sm text-gray-600">
                <div>작성일: {new Date(selectedReview.created_at).toLocaleString('ko-KR')}</div>
                <div>수정일: {new Date(selectedReview.updated_at).toLocaleString('ko-KR')}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
