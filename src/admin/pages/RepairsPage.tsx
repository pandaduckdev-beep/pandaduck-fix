import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  X,
  MessageSquare,
  Copy,
  Send,
  Settings,
} from 'lucide-react'
import type { RepairRequest, ControllerService, ControllerServiceOption } from '@/types/database'
import {
  generateReviewToken,
  getReviewUrl,
  copyToClipboard,
  openKakaoTalk,
} from '@/lib/reviewUtils'
import { toast } from 'sonner'
import { RepairDetailModal } from '../components/RepairDetailModal'

interface ServiceWithDetails {
  service_id: string
  selected_option_id: string | null
  service_price: number
  option_price: number
  service?: ControllerService
  option?: ControllerServiceOption
}

interface RepairRequestWithServices extends RepairRequest {
  services?: ServiceWithDetails[]
  has_review?: boolean
}

type RepairStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

const STATUS_CONFIG: Record<RepairStatus, { label: string; color: string; icon: React.ReactNode }> =
  {
    pending: { label: '대기중', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    confirmed: { label: '확인됨', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    in_progress: { label: '진행중', color: 'bg-purple-100 text-purple-800', icon: Clock },
    completed: { label: '완료', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: '취소됨', color: 'bg-gray-100 text-gray-800', icon: XCircle },
  }

export function RepairsPage() {
  const [repairs, setRepairs] = useState<RepairRequestWithServices[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<RepairStatus | 'all'>('all')
  const [showSimpleDetailModal, setShowSimpleDetailModal] = useState(false)
  const [showManageModal, setShowManageModal] = useState(false)
  const [selectedRepairForManage, setSelectedRepairForManage] =
    useState<RepairRequestWithServices | null>(null)
  const [selectedRepair, setSelectedRepair] = useState<RepairRequestWithServices | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [showReviewRequestModal, setShowReviewRequestModal] = useState(false)
  const [reviewRequestRepair, setReviewRequestRepair] = useState<RepairRequestWithServices | null>(
    null
  )
  const [reviewUrl, setReviewUrl] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [preRepairNotes, setPreRepairNotes] = useState('')
  const [postRepairNotes, setPostRepairNotes] = useState('')

  const loadRepairs = useCallback(async () => {
    try {
      let query = supabase
        .from('repair_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data: repairRequests, error } = await query

      if (error) throw error

      const { data: controllerModels } = await supabase
        .from('controller_models')
        .select('id, model_id, model_name')
        .order('model_name', { ascending: true })

      const repairsWithServices = await Promise.all(
        (repairRequests || []).map(async (repair) => {
          const { data: services } = await supabase
            .from('repair_request_services')
            .select(
              `
                service_id,
                selected_option_id,
                service_price,
                option_price
              `
            )
            .eq('repair_request_id', repair.id)

          const servicesWithDetails = await Promise.all(
            (services || []).map(async (svc) => {
              const { data: service } = await supabase
                .from('controller_services')
                .select('*')
                .eq('id', svc.service_id)
                .single()

              let option = null
              if (svc.selected_option_id) {
                const { data: opt } = await supabase
                  .from('controller_service_options')
                  .select('*')
                  .eq('id', svc.selected_option_id)
                  .single()
                option = opt
              }

              return {
                ...svc,
                service,
                option,
              }
            })
          )

          // Check if review exists
          const { data: review } = await supabase
            .from('reviews')
            .select('id')
            .eq('repair_request_id', repair.id)
            .single()

          return {
            ...repair,
            services: servicesWithDetails,
            controller_models: controllerModels?.find((cm) => cm.id === repair.controller_model),
            has_review: !!review,
          }
        })
      )

      setRepairs(repairsWithServices)
    } catch (error) {
      console.error('Failed to load repairs:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadRepairs()
  }, [statusFilter, loadRepairs])

  const filteredRepairs = repairs.filter((repair) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      repair.customer_name.toLowerCase().includes(search) ||
      repair.customer_phone.includes(search) ||
      repair.controller_model.toLowerCase().includes(search)
    )
  })

  const loadRepairDetail = async (repairId: string) => {
    setLoadingDetail(true)
    try {
      // 수리 신청 기본 정보 조회
      const { data: repair, error: repairError } = await supabase
        .from('repair_requests')
        .select('*')
        .eq('id', repairId)
        .single()

      if (repairError) throw repairError

      // 컨트롤러 모델 목록 로드
      const { data: controllerModels } = await supabase
        .from('controller_models')
        .select('id, model_id, model_name')
        .order('model_name', { ascending: true })

      // 선택한 서비스들 조회
      const { data: services, error: servicesError } = await supabase
        .from('repair_request_services')
        .select(
          `
            service_id,
            selected_option_id,
            service_price,
            option_price
          `
        )
        .eq('repair_request_id', repairId)

      if (servicesError) throw servicesError

      // 각 서비스의 상세 정보 조회
      const servicesWithDetails = await Promise.all(
        (services || []).map(async (svc) => {
          const { data: service } = await supabase
            .from('controller_services')
            .select('*')
            .eq('id', svc.service_id)
            .single()

          let option = null
          if (svc.selected_option_id) {
            const { data: opt } = await supabase
              .from('controller_service_options')
              .select('*')
              .eq('id', svc.selected_option_id)
              .single()
            option = opt
          }

          return {
            ...svc,
            service,
            option,
          }
        })
      )

      setSelectedRepair({
        ...repair,
        services: servicesWithDetails,
        controller_models: controllerModels?.find((cm) => cm.id === repair.controller_model),
      })

      // 메모 초기화
      setAdminNotes(repair.admin_notes || '')
      setPreRepairNotes(repair.pre_repair_notes || '')
      setPostRepairNotes(repair.post_repair_notes || '')
    } catch (error) {
      console.error('Failed to load repair detail:', error)
      toast.error('상세 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoadingDetail(false)
    }
  }

  const updateStatus = async (repairId: string, newStatus: RepairStatus) => {
    try {
      const { error } = await supabase
        .from('repair_requests')
        .update({
          status: newStatus,
          admin_notes: adminNotes || undefined,
          pre_repair_notes: preRepairNotes || undefined,
          post_repair_notes: postRepairNotes || undefined,
        })
        .eq('id', repairId)

      if (error) throw error
      await loadRepairs()

      // 상세보기가 열려있으면 업데이트
      if (selectedRepair?.id === repairId) {
        await loadRepairDetail(repairId)
      }

      // 관리 모달 닫기
      setShowManageModal(false)
      setSelectedRepairForManage(null)
      setAdminNotes('')
      setPreRepairNotes('')
      setPostRepairNotes('')
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('상태 변경에 실패했습니다.')
    }
  }

  const handleSaveAdminNotes = async (repairId: string) => {
    try {
      const { error } = await supabase
        .from('repair_requests')
        .update({
          admin_notes: adminNotes || undefined,
          pre_repair_notes: preRepairNotes || undefined,
          post_repair_notes: postRepairNotes || undefined,
        })
        .eq('id', repairId)

      if (error) throw error
      await loadRepairs()

      if (selectedRepair?.id === repairId) {
        await loadRepairDetail(repairId)
      }

      setShowManageModal(false)
      setSelectedRepairForManage(null)
      setAdminNotes('')
      setPreRepairNotes('')
      setPostRepairNotes('')
      toast.success('메모가 저장되었습니다.')
    } catch (error) {
      console.error('Failed to save admin notes:', error)
      toast.error('메모 저장에 실패했습니다.')
    }
  }

  const handleRequestReview = async (repair: RepairRequestWithServices) => {
    try {
      const token = await generateReviewToken(repair.id)
      const url = getReviewUrl(token)
      setReviewUrl(url)
      setReviewRequestRepair(repair)
      setShowReviewRequestModal(true)
    } catch (error) {
      console.error('Failed to generate review token:', error)
      toast.error('리뷰 요청 링크 생성에 실패했습니다.')
    }
  }

  const handleCopyReviewLink = async () => {
    try {
      await copyToClipboard(reviewUrl)
      toast.success('리뷰 링크가 클립보드에 복사되었습니다.')
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast.error('복사에 실패했습니다.')
    }
  }

  const handleSendKakaoTalk = () => {
    if (reviewRequestRepair) {
      openKakaoTalk(reviewUrl, reviewRequestRepair.customer_name)
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
        <h1 className="text-3xl font-bold">수리 신청 관리</h1>
        <div className="text-sm text-gray-600">
          총 <span className="font-semibold text-black">{repairs.length}</span>건
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
              placeholder="고객명, 전화번호, 컨트롤러 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RepairStatus | 'all')}
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

      {/* Repairs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">상세</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">고객 정보</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">컨트롤러</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                신청 서비스
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">금액</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">상태</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">신청일</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">관리</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">리뷰</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRepairs.map((repair) => {
              const statusConfig = STATUS_CONFIG[repair.status as RepairStatus]
              const StatusIcon = statusConfig?.icon

              return (
                <tr key={repair.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedRepairForManage(repair)
                        setShowSimpleDetailModal(true)
                      }}
                      className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                      title="상세보기"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-900">{repair.customer_name}</div>
                      <div className="text-sm text-gray-600">{repair.customer_phone}</div>
                      {repair.customer_email && (
                        <div className="text-sm text-gray-600">{repair.customer_email}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                      {repair.controller_models?.model_name || repair.controller_model}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {repair.services?.map((svc, index) => (
                        <div key={index} className="text-sm">
                          <span className="text-gray-900">{svc.service?.name}</span>
                          {svc.option && (
                            <span className="text-gray-500 text-xs ml-1">
                              ({svc.option.option_name})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    ₩{repair.total_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig?.color || 'bg-gray-100 text-gray-800'}`}
                    >
                      {StatusIcon && <StatusIcon className="w-4 h-4" />}
                      {statusConfig?.label || repair.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(repair.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedRepairForManage(repair)
                        // 메모 로드
                        setAdminNotes(repair.admin_notes || '')
                        setPreRepairNotes(repair.pre_repair_notes || '')
                        setPostRepairNotes(repair.post_repair_notes || '')
                        setShowManageModal(true)
                      }}
                      className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                      title="관리하기"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {repair.status === 'completed' && (
                      repair.has_review ? (
                        <span className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-800 rounded-lg font-medium">
                          <CheckCircle className="w-4 h-4" />
                          리뷰완료
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRequestReview(repair)}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          title="리뷰 요청"
                        >
                          <MessageSquare className="w-4 h-4" />
                          리뷰 요청
                        </button>
                      )
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredRepairs.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            {searchTerm ? '검색 결과가 없습니다.' : '수리 신청이 없습니다.'}
          </div>
        )}
      </div>

      {/* Review Request Modal */}
      {showReviewRequestModal && reviewRequestRepair && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">리뷰 요청</h2>
                <button
                  onClick={() => {
                    setShowReviewRequestModal(false)
                    setReviewRequestRepair(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">고객 정보</p>
                <p className="font-semibold">{reviewRequestRepair.customer_name}</p>
                <p className="text-sm text-gray-600">{reviewRequestRepair.customer_phone}</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 mb-2">리뷰 링크</p>
                <p className="text-xs text-blue-900 break-all font-mono">{reviewUrl}</p>
              </div>

              <p className="text-sm text-gray-600">고객에게 리뷰 요청을 보낼 방법을 선택하세요.</p>

              <div className="space-y-3">
                <button
                  onClick={handleSendKakaoTalk}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition font-medium"
                >
                  <Send className="w-5 h-5" />
                  카카오톡으로 전송
                </button>

                <button
                  onClick={handleCopyReviewLink}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  <Copy className="w-5 h-5" />
                  링크 복사
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRepair && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">수리 신청 상세</h2>
              <button
                onClick={() => setSelectedRepair(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">고객 정보</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">이름</span>
                      <span className="font-semibold">{selectedRepair.customer_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">전화번호</span>
                      <span className="font-semibold">{selectedRepair.customer_phone}</span>
                    </div>
                    {selectedRepair.customer_email && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">이메일</span>
                        <span className="font-semibold">{selectedRepair.customer_email}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">컨트롤러</span>
                      <span className="font-semibold">
                        {selectedRepair.controller_models?.model_name ||
                          selectedRepair.controller_model}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">선택한 서비스</h3>
                  <div className="space-y-3">
                    {selectedRepair.services?.map((svc, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{svc.service?.name}</span>
                          <span className="font-semibold">
                            ₩{svc.service_price.toLocaleString()}
                          </span>
                        </div>
                        {svc.option && (
                          <div className="flex items-center justify-between text-sm pl-4">
                            <span className="text-gray-600">ㄴ {svc.option.option_name}</span>
                            <span className="text-gray-900 font-medium">
                              {svc.option_price === 0
                                ? '기본'
                                : `+₩${svc.option_price.toLocaleString()}`}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Controller Condition & Notes */}
                {selectedRepair.issue_description && (() => {
                  const desc = selectedRepair.issue_description
                  const addressMatch = desc.match(/고객 주소:\s*(.+)/)
                  const conditionsMatch = desc.match(/상태:\s*\[(.+?)\]/)
                  const notesMatch = desc.match(/요청사항:\s*(.+?)(?:\n|$)/)
                  const address = addressMatch ? addressMatch[1].trim() : null
                  const conditions = conditionsMatch ? conditionsMatch[1].split(',').map((s) => s.trim()) : null
                  const notes = notesMatch ? notesMatch[1].trim() : null
                  const hasParsed = address || conditions || notes

                  if (!hasParsed) {
                    return (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-3">추가 정보</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{desc}</p>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <>
                      {conditions && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 mb-3">컨트롤러 상태</h3>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {conditions.map((c) => (
                                <span key={c} className="inline-block bg-white border border-gray-300 rounded-full px-3 py-1 text-sm font-medium">
                                  {c}
                                </span>
                              ))}
                            </div>
                            {notes && (
                              <div className="pt-3 border-t border-gray-200">
                                <p className="text-xs font-medium text-gray-500 mb-1">추가 요청사항</p>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {!conditions && notes && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 mb-3">추가 요청사항</h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
                          </div>
                        </div>
                      )}
                      {address && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 mb-3">배송 주소</h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-700">{address}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}

                {/* Total & Status */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">총 금액</span>
                    <span className="text-2xl font-bold">
                      ₩{selectedRepair.total_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">상태 변경</span>
                    <select
                      value={selectedRepair.status}
                      onChange={(e) =>
                        updateStatus(selectedRepair.id, e.target.value as RepairStatus)
                      }
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    >
                      {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                        <option key={value} value={value}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div className="border-t border-gray-200 pt-4 text-sm text-gray-600 space-y-1">
                  <div>신청일: {new Date(selectedRepair.created_at).toLocaleString('ko-KR')}</div>
                  {selectedRepair.estimated_completion_date && (
                    <div>
                      예상 완료일:{' '}
                      {new Date(selectedRepair.estimated_completion_date).toLocaleString('ko-KR')}
                    </div>
                  )}
                  {selectedRepair.actual_completion_date && (
                    <div>
                      실제 완료일:{' '}
                      {new Date(selectedRepair.actual_completion_date).toLocaleString('ko-KR')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Repair Detail Modal */}
      <RepairDetailModal
        isOpen={showSimpleDetailModal}
        onClose={() => {
          setShowSimpleDetailModal(false)
          setSelectedRepairForManage(null)
        }}
        repair={selectedRepairForManage!}
      />

      {/* Manage Modal */}
      {showManageModal && selectedRepairForManage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">수리 신청 관리</h2>
              <button
                onClick={() => {
                  setShowManageModal(false)
                  setSelectedRepairForManage(null)
                  setAdminNotes('')
                  setPreRepairNotes('')
                  setPostRepairNotes('')
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">고객 정보</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">이름</span>
                    <span className="font-semibold">{selectedRepairForManage.customer_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">전화번호</span>
                    <span className="font-semibold">{selectedRepairForManage.customer_phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">컨트롤러</span>
                    <span className="font-semibold">
                      {selectedRepairForManage.controller_models?.model_name ||
                        selectedRepairForManage.controller_model}
                    </span>
                  </div>
                </div>
              </div>

              {/* Services */}
              {selectedRepairForManage.services && selectedRepairForManage.services.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">선택한 서비스</h3>
                  <div className="space-y-2">
                    {selectedRepairForManage.services.map((svc, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{svc.service?.name || '서비스'}</span>
                          <span className="text-sm font-semibold">₩{svc.service_price.toLocaleString()}</span>
                        </div>
                        {svc.option && (
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-0.5 pl-3">
                            <span>ㄴ {svc.option.option_name}</span>
                            <span>{svc.option_price === 0 ? '기본' : `+₩${svc.option_price.toLocaleString()}`}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-sm font-semibold">총 금액</span>
                      <span className="font-bold">₩{selectedRepairForManage.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Controller Condition */}
              {selectedRepairForManage.issue_description && (() => {
                const desc = selectedRepairForManage.issue_description
                const conditionsMatch = desc.match(/상태:\s*\[(.+?)\]/)
                const notesMatch = desc.match(/요청사항:\s*(.+?)(?:\n|$)/)
                const addressMatch = desc.match(/고객 주소:\s*(.+)/)
                const conditions = conditionsMatch ? conditionsMatch[1].split(',').map((s) => s.trim()) : null
                const notes = notesMatch ? notesMatch[1].trim() : null
                const address = addressMatch ? addressMatch[1].trim() : null
                if (!conditions && !notes && !address) return null
                return (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">컨트롤러 상태</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {conditions && (
                        <div className="flex flex-wrap gap-2">
                          {conditions.map((c) => (
                            <span key={c} className="inline-block bg-white border border-gray-300 rounded-full px-3 py-1 text-sm font-medium">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                      {notes && (
                        <div className={conditions ? 'pt-2 border-t border-gray-200' : ''}>
                          <p className="text-xs font-medium text-gray-500 mb-1">추가 요청사항</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
                        </div>
                      )}
                      {address && (
                        <div className={(conditions || notes) ? 'pt-2 border-t border-gray-200' : ''}>
                          <p className="text-xs font-medium text-gray-500 mb-1">배송 주소</p>
                          <p className="text-sm text-gray-700">{address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}

              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">상태</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => {
                    const StatusIcon = config.icon as any
                    const isSelected = selectedRepairForManage.status === value

                    // 각 상태별 테두리 색상 (버튼 색상보다 진한 색)
                    const ringColors: Record<RepairStatus, string> = {
                      pending: 'ring-yellow-600',
                      confirmed: 'ring-blue-600',
                      in_progress: 'ring-purple-600',
                      completed: 'ring-green-600',
                      cancelled: 'ring-gray-600',
                    }

                    return (
                      <button
                        key={value}
                        onClick={() =>
                          updateStatus(selectedRepairForManage.id, value as RepairStatus)
                        }
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                          isSelected
                            ? config.color + ' ring-2 ring-offset-1 ' + ringColors[value as RepairStatus]
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {config.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">관리자 메모</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="일반적인 메모를 입력하세요..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">수리 전 특이사항</h3>
                <textarea
                  value={preRepairNotes}
                  onChange={(e) => setPreRepairNotes(e.target.value)}
                  placeholder="수리 전 특이사항을 입력하세요..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">수리 후 특이사항</h3>
                <textarea
                  value={postRepairNotes}
                  onChange={(e) => setPostRepairNotes(e.target.value)}
                  placeholder="수리 후 특이사항을 입력하세요..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={() => handleSaveAdminNotes(selectedRepairForManage.id)}
                  className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
