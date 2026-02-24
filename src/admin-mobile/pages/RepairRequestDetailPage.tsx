import { MobileHeader } from '../components/MobileHeader'
import { MobileFooterNav } from '../components/MobileFooterNav'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import {
  RepairRequest,
  RepairStatus,
  ControllerService,
  ControllerServiceOption,
} from '@/types/database'
import {
  Calendar,
  MapPin,
  Phone,
  Mail,
  Package,
  MessageSquare,
  FileText,
  Send,
  Copy,
  CheckCircle,
  X,
  AlertCircle,
  Star,
} from 'lucide-react'
import {
  generateReviewToken,
  getReviewUrl,
  copyToClipboard,
  openKakaoTalk,
} from '@/lib/reviewUtils'
import { useToast } from '@/hooks/useToast.tsx'
import { SkeletonCard, SkeletonText } from '@/components/common/Skeleton'

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
  controller_models?: {
    model_name: string
  }
}

const statusConfig = {
  pending: { label: '대기중', bg: 'bg-[#FFF9E6]', text: 'text-[#FF9500]' },
  confirmed: { label: '확인됨', bg: 'bg-[#E6F2FF]', text: 'text-[var(--ios-blue)]' },
  in_progress: { label: '진행중', bg: 'bg-[#F3E6FF]', text: 'text-[#AF52DE]' },
  completed: { label: '완료', bg: 'bg-[#E6F9F0]', text: 'text-[#34C759]' },
  cancelled: { label: '취소', bg: 'bg-[#F5F5F7]', text: 'text-[#86868B]' },
}

export default function RepairRequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { success, error } = useToast()

  const handleBack = () => {
    navigate('/admin-mobile/repairs')
  }
  const [repair, setRepair] = useState<RepairRequestWithServices | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminNotes, setAdminNotes] = useState('')
  const [beforeRepairNotes, setBeforeRepairNotes] = useState('')
  const [afterRepairNotes, setAfterRepairNotes] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewUrl, setReviewUrl] = useState('')

  useEffect(() => {
    if (id) {
      loadRepairDetail()
    }
  }, [id])

  const loadRepairDetail = async () => {
    try {
      setLoading(true)

      // 수리 요청 기본 정보 조회
      const { data: repairData, error: repairError } = await supabase
        .from('repair_requests')
        .select(
          `
          *,
          controller_models!repair_requests_controller_model_fkey (
            model_name
          )
        `
        )
        .eq('id', id)
        .single()

      if (repairError) throw repairError

      // 리뷰 여부 확인
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('id')
        .eq('repair_request_id', id)
        .maybeSingle()

      const hasReview = !!reviewData

      // 서비스 정보 조회
      const { data: servicesData, error: servicesError } = await supabase
        .from('repair_request_services')
        .select('*')
        .eq('repair_request_id', id)

      if (servicesError) throw servicesError

      // 서비스와 옵션 상세 정보 조회
      if (servicesData && servicesData.length > 0) {
        const serviceIds = servicesData.map((s) => s.service_id)
        const optionIds = servicesData
          .filter((s) => s.selected_option_id)
          .map((s) => s.selected_option_id)

        const [{ data: services }, { data: options }] = await Promise.all([
          supabase.from('controller_services').select('*').in('id', serviceIds),
          optionIds.length > 0
            ? supabase.from('controller_service_options').select('*').in('id', optionIds)
            : { data: [] },
        ])

        const servicesWithDetails = servicesData.map((s) => ({
          ...s,
          service: services?.find((svc) => svc.id === s.service_id),
          option: options?.find((opt) => opt.id === s.selected_option_id),
        }))

        setRepair({ ...repairData, services: servicesWithDetails, has_review: hasReview })
      } else {
        setRepair({ ...repairData, has_review: hasReview })
      }

      setAdminNotes(repairData.admin_notes || '')

      // Parse admin_notes to extract before/after repair notes
      if (repairData.admin_notes) {
        const adminNotesText = repairData.admin_notes
        const beforeNotesMatch = adminNotesText.match(/수리 전 메모:\s*\[(.*?)\]/s)
        const afterNotesMatch = adminNotesText.match(/수리 후 메모:\s*\[(.*?)\]/s)

        setBeforeRepairNotes(beforeNotesMatch ? beforeNotesMatch[1].trim() : '')
        setAfterRepairNotes(afterNotesMatch ? afterNotesMatch[1].trim() : '')
      }
    } catch (error) {
      console.error('Failed to load repair detail:', error)
      error('로드 실패', '상세 정보를 불러오는데 실패했습니다.')
      navigate('/admin-mobile/repairs')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: RepairStatus) => {
    if (!repair) return

    try {
      setUpdating(true)

      const { error } = await supabase
        .from('repair_requests')
        .update({
          status: newStatus,
          admin_notes: adminNotes || undefined,
        })
        .eq('id', repair.id)

      if (error) throw error

      setRepair({ ...repair, status: newStatus })
      success('완료', '상태가 변경되었습니다.')
    } catch (error) {
      console.error('Failed to update status:', error)
      error('실패', '상태 변경에 실패했습니다.')
    } finally {
      setUpdating(false)
    }
  }

  const saveNotes = async () => {
    if (!repair) return

    try {
      setUpdating(true)

      // Combine all notes into admin_notes
      let combinedNotes = adminNotes

      // Add before/after repair notes to admin_notes
      if (beforeRepairNotes || afterRepairNotes) {
        const repairNotesParts: string[] = []
        if (beforeRepairNotes) {
          repairNotesParts.push(`수리 전 메모:\n[${beforeRepairNotes}]`)
        }
        if (afterRepairNotes) {
          repairNotesParts.push(`수리 후 메모:\n[${afterRepairNotes}]`)
        }

        // Append to existing admin notes or create new section
        if (combinedNotes) {
          combinedNotes = `${combinedNotes}\n\n=== 수리 전후 메모 ===\n${repairNotesParts.join('\n\n')}`
        } else {
          combinedNotes = repairNotesParts.join('\n\n')
        }
      }

      const { error } = await supabase
        .from('repair_requests')
        .update({ admin_notes: combinedNotes || undefined })
        .eq('id', repair.id)

      if (error) throw error

      setRepair({ ...repair, admin_notes: combinedNotes || null })
      setEditingNotes(false)
      success('완료', '메모가 저장되었습니다.')
    } catch (error) {
      console.error('Failed to save notes:', error)
      error('실패', '메모 저장에 실패했습니다.')
    } finally {
      setUpdating(false)
    }
  }

  const handleRequestReview = async () => {
    if (!repair) return

    try {
      const token = await generateReviewToken(repair.id)
      const url = getReviewUrl(token)
      setReviewUrl(url)
      setShowReviewModal(true)
      setRepair({ ...repair, review_token: token, review_sent_at: new Date().toISOString() })
    } catch (error) {
      console.error('Failed to generate review token:', error)
      error('실패', '리뷰 요청 링크 생성에 실패했습니다.')
    }
  }

  const handleCopyReviewLink = async () => {
    try {
      await copyToClipboard(reviewUrl)
      success('완료', '리뷰 링크가 클립보드에 복사되었습니다.')
    } catch (error) {
      console.error('Failed to copy link:', error)
      error('실패', '복사에 실패했습니다.')
    }
  }

  const handleSendKakaoTalk = () => {
    if (repair) {
      openKakaoTalk(reviewUrl, repair.customer_name)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <MobileHeader title="수리 요청 상세" onBack={handleBack} />
        <div className="px-6 py-4 space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="text-center py-8">
          <p className="text-[#86868B] text-sm font-medium">불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!repair) {
    return null
  }

  const config = statusConfig[repair.status]
  const servicesTotal =
    repair.services?.reduce((sum, svc) => sum + svc.service_price + svc.option_price, 0) || 0
  const discount = Math.max(servicesTotal - repair.total_amount, 0)
  const shippingFee = Math.max(repair.total_amount - servicesTotal, 0)

  const shouldShowReviewButton = repair.status === 'completed' && !repair.has_review

  return (
    <div className="bg-[#F5F5F7] min-h-screen pb-20">
      <MobileHeader
        title="수리 신청 상세"
        showBackButton={true}
        onBack={handleBack}
        rightAction={
          repair.has_review ? (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-[#E6F9F0] rounded-full">
              <CheckCircle className="w-4 h-4 text-[#34C759]" />
              <span className="text-xs text-[#34C759]" style={{ fontWeight: 600 }}>
                리뷰 완료
              </span>
            </div>
          ) : shouldShowReviewButton ? (
            <button
              onClick={handleRequestReview}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E6F2FF] hover:bg-[#D0E7FF] rounded-full transition-ios btn-press"
              title="리뷰 요청하기"
            >
              <Star className="w-4 h-4 text-[#007AFF] fill-[#007AFF]" />
              <span className="text-xs text-[#007AFF]" style={{ fontWeight: 600 }}>
                리뷰 요청
              </span>
            </button>
          ) : null
        }
      />

      <main className="p-4 space-y-4">
        {/* 상태 및 기본 정보 */}
        <div className="bg-white rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(0,0,0,0.06)]">
            <h2 className="text-lg text-[#1D1D1F]" style={{ fontWeight: 700 }}>
              {repair.customer_name}
            </h2>
            <span
              className={`text-xs px-3 py-1.5 ${config.bg} ${config.text} rounded-lg`}
              style={{ fontWeight: 600 }}
            >
              {config.label}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-[#86868B] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-[#86868B] mb-0.5">컨트롤러 모델</p>
                <p className="text-sm text-[#1D1D1F]" style={{ fontWeight: 600 }}>
                  {repair.controller_models?.model_name || repair.controller_model}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#86868B] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-[#86868B] mb-0.5">신청일</p>
                <p className="text-sm text-[#1D1D1F]" style={{ fontWeight: 600 }}>
                  {formatDate(repair.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#86868B] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-[#86868B] mb-0.5">연락처</p>
                <a
                  href={`tel:${repair.customer_phone}`}
                  className="text-sm text-[var(--ios-blue)]"
                  style={{ fontWeight: 600 }}
                >
                  {repair.customer_phone}
                </a>
              </div>
            </div>

            {repair.customer_email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#86868B] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-[#86868B] mb-0.5">이메일</p>
                  <a
                    href={`mailto:${repair.customer_email}`}
                    className="text-sm text-[var(--ios-blue)]"
                    style={{ fontWeight: 600 }}
                  >
                    {repair.customer_email}
                  </a>
                </div>
              </div>
            )}

            {repair.issue_description &&
              (() => {
                const addressMatch = repair.issue_description.match(/고객 주소:\s*(.+)/)
                const conditionsMatch = repair.issue_description.match(/상태:\s*\[(.+?)\]/)
                const beforeConditionsMatch =
                  repair.issue_description.match(/수리 전 특이사항:\s*\[(.*?)\]/)
                const afterConditionsMatch =
                  repair.issue_description.match(/수리 후 특이사항:\s*\[(.*?)\]/)
                const notesMatch = repair.issue_description.match(/요청사항:\s*(.+?)(?:\n|$)/)

                const address = addressMatch ? addressMatch[1].trim() : null
                const conditions = conditionsMatch
                  ? conditionsMatch[1].split(',').map((s: string) => s.trim())
                  : null
                const beforeConditions = beforeConditionsMatch
                  ? beforeConditionsMatch[1]
                      .split(',')
                      .map((s: string) => s.trim())
                      .filter((s) => s)
                  : null
                const afterConditions = afterConditionsMatch
                  ? afterConditionsMatch[1]
                      .split(',')
                      .map((s: string) => s.trim())
                      .filter((s) => s)
                  : null
                const notes = notesMatch ? notesMatch[1].trim() : null

                return (
                  <>
                    {address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-[#86868B] flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-[#86868B] mb-0.5">주소</p>
                          <p className="text-sm text-[#1D1D1F]">{address}</p>
                        </div>
                      </div>
                    )}

                    {/* 수리 전 특이사항 */}
                    {beforeConditions && beforeConditions.length > 0 && (
                      <div className="flex items-start gap-3 bg-orange-50 p-3 rounded-lg border border-orange-100">
                        <AlertCircle className="w-5 h-5 text-[#FF9500] flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-[#FF9500] font-semibold mb-1.5">
                            수리 전 특이사항
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {beforeConditions.map((c: string, i: number) => (
                              <span
                                key={i}
                                className="bg-white px-3 py-1 rounded-full text-xs text-[#1D1D1F]"
                                style={{ fontWeight: 500 }}
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 수리 후 특이사항 */}
                    {afterConditions && afterConditions.length > 0 && (
                      <div className="flex items-start gap-3 bg-green-50 p-3 rounded-lg border border-green-100">
                        <CheckCircle className="w-5 h-5 text-[#34C759] flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-[#34C759] font-semibold mb-1.5">
                            수리 후 특이사항
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {afterConditions.map((c: string, i: number) => (
                              <span
                                key={i}
                                className="bg-white px-3 py-1 rounded-full text-xs text-[#1D1D1F]"
                                style={{ fontWeight: 500 }}
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {conditions && (
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-[#86868B] flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-[#86868B] mb-1.5">컨트롤러 상태</p>
                          <div className="flex flex-wrap gap-1.5">
                            {conditions.map((c: string) => (
                              <span
                                key={c}
                                className="bg-[#F5F5F7] px-3 py-1 rounded-full text-xs text-[#1D1D1F]"
                                style={{ fontWeight: 500 }}
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {notes && (
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-[#86868B] flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-[#86868B] mb-0.5">추가 요청사항</p>
                          <p className="text-sm text-[#1D1D1F] whitespace-pre-wrap">{notes}</p>
                        </div>
                      </div>
                    )}
                    {!address && !conditions && !notes && !beforeConditions && !afterConditions && (
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-[#86868B] flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-[#86868B] mb-0.5">문제 설명</p>
                          <p className="text-sm text-[#1D1D1F] whitespace-pre-wrap">
                            {repair.issue_description}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}
          </div>
        </div>

        {/* 서비스 목록 */}
        {repair.services && repair.services.length > 0 && (
          <div className="bg-white rounded-2xl p-5">
            <h3 className="text-base text-[#1D1D1F] mb-4" style={{ fontWeight: 700 }}>
              선택한 서비스
            </h3>
            <div className="space-y-3">
              {repair.services.map((svc, index) => (
                <div
                  key={index}
                  className="pb-3 border-b border-[rgba(0,0,0,0.06)] last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-[#1D1D1F]" style={{ fontWeight: 600 }}>
                      {svc.service?.service_name || '서비스'}
                    </p>
                    <p className="text-sm text-[#1D1D1F]" style={{ fontWeight: 600 }}>
                      ₩{svc.service_price.toLocaleString()}
                    </p>
                  </div>
                  {svc.option && (
                    <div className="flex justify-between items-start">
                      <p className="text-xs text-[#86868B] pl-3">└ {svc.option.option_name}</p>
                      {svc.option_price > 0 && (
                        <p className="text-xs text-[#86868B]">
                          +₩{svc.option_price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.06)] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#86868B]">서비스 합계</span>
                <span className="text-sm text-[#1D1D1F]" style={{ fontWeight: 600 }}>
                  ₩{servicesTotal.toLocaleString()}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#FF3B30]">할인</span>
                  <span className="text-sm text-[#FF3B30]" style={{ fontWeight: 600 }}>
                    -₩{discount.toLocaleString()}
                  </span>
                </div>
              )}
              {shippingFee > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#007AFF]">배송비</span>
                  <span className="text-sm text-[#007AFF]" style={{ fontWeight: 600 }}>
                    ₩{shippingFee.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-[rgba(0,0,0,0.06)]">
                <span className="text-base text-[#1D1D1F]" style={{ fontWeight: 700 }}>
                  총 금액
                </span>
                <span className="text-xl text-[#1D1D1F]" style={{ fontWeight: 700 }}>
                  ₩{repair.total_amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 상태 변경 */}
        <div className="bg-white rounded-2xl p-5">
          <h3 className="text-base text-[#1D1D1F] mb-3" style={{ fontWeight: 700 }}>
            상태 변경
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(statusConfig).map(([status, config]) => {
              const isSelected = repair.status === status
              return (
                <button
                  key={status}
                  onClick={() => updateStatus(status as RepairStatus)}
                  disabled={updating || isSelected}
                  className={`py-3 px-4 rounded-xl text-sm transition-all ${
                    isSelected
                      ? `${config.bg} ${config.text} ring-2 ring-offset-2 ring-${config.text.replace('text-', '')}`
                      : 'bg-[#F5F5F7] text-[#86868B] active:bg-[#E8E8ED]'
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {config.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 관리자 메모 */}
        <div className="bg-white rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-[#86868B]" />
            <h3 className="text-base text-[#1D1D1F]" style={{ fontWeight: 700 }}>
              관리자 메모
            </h3>
          </div>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="일반 메모를 입력하세요..."
            rows={3}
            className="w-full bg-[#F5F5F7] border-none rounded-xl p-3 text-sm resize-none focus:ring-0 focus:border-gray-400 transition-all"
            style={{ fontWeight: 500 }}
          />

          {/* 수리 전후 메모 작성 섹션 */}
          <div className="pt-3 border-t border-[rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-[#FF9500]" />
              <h4 className="text-sm text-[#1D1D1F]" style={{ fontWeight: 700 }}>
                수리 전후 메모
              </h4>
            </div>

            {editingNotes ? (
              <div className="space-y-3">
                {/* 수리 전 메모 */}
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <p className="text-xs text-[#FF9500] font-semibold mb-2">수리 전</p>
                  <textarea
                    value={beforeRepairNotes}
                    onChange={(e) => setBeforeRepairNotes(e.target.value)}
                    placeholder="수리 전 특이사항을 입력하세요..."
                    rows={2}
                    className="w-full bg-white border border-orange-200 rounded-lg p-2 text-sm resize-none focus:ring-0 focus:border-orange-400 transition-all"
                    style={{ fontWeight: 500 }}
                  />
                </div>

                {/* 수리 후 메모 */}
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-xs text-[#34C759] font-semibold mb-2">수리 후</p>
                  <textarea
                    value={afterRepairNotes}
                    onChange={(e) => setAfterRepairNotes(e.target.value)}
                    placeholder="수리 후 특이사항을 입력하세요..."
                    rows={2}
                    className="w-full bg-white border border-green-200 rounded-lg p-2 text-sm resize-none focus:ring-0 focus:border-green-400 transition-all"
                    style={{ fontWeight: 500 }}
                  />
                </div>

                {/* 저장/취소 버튼 */}
                <div className="flex gap-2">
                  <button
                    onClick={saveNotes}
                    disabled={updating}
                    className="flex-1 py-2.5 bg-[#007AFF] text-white rounded-xl transition-all active:scale-98 text-sm"
                    style={{ fontWeight: 600 }}
                  >
                    {updating ? '저장 중...' : '모두 저장'}
                  </button>
                  <button
                    onClick={() => setEditingNotes(false)}
                    disabled={updating}
                    className="flex-1 py-2.5 bg-[#F5F5F7] text-[#1D1D1F] rounded-xl transition-all active:scale-98 text-sm"
                    style={{ fontWeight: 600 }}
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditingNotes(true)}
                className="w-full py-2.5 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] rounded-xl transition-all active:scale-98 text-sm"
                style={{ fontWeight: 600 }}
              >
                ✏️ 수리 전후 메모 {beforeRepairNotes || afterRepairNotes ? '수정' : '작성'}
              </button>
            )}
          </div>

          {/* 일반 메모 저장 버튼 */}
          <button
            onClick={() => {
              // 일반 메모만 저장
              if (!repair) return
              supabase
                .from('repair_requests')
                .update({ admin_notes: adminNotes || undefined })
                .eq('id', repair.id)
                .then(({ error }) => {
                  if (error) {
                    error('실패', '메모 저장에 실패했습니다.')
                  } else {
                    success('완료', '메모가 저장되었습니다.')
                  }
                })
            }}
            className="w-full py-3 bg-[#007AFF] text-white rounded-xl transition-all active:scale-98"
            style={{ fontWeight: 600 }}
          >
            일반 메모 저장
          </button>
        </div>
      </main>

      {/* 리뷰 요청 모달 */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="px-5 py-4 border-b border-[rgba(0,0,0,0.08)] flex items-center justify-between">
              <h2 className="text-lg text-[#1D1D1F]" style={{ fontWeight: 700 }}>
                리뷰 요청
              </h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-[#F5F5F7] rounded-xl p-4">
                <p className="text-xs text-[#86868B] mb-1">고객 정보</p>
                <p className="text-sm text-[#1D1D1F]" style={{ fontWeight: 600 }}>
                  {repair.customer_name}
                </p>
                <p className="text-sm text-[#86868B]">{repair.customer_phone}</p>
              </div>

              <div className="bg-[#E6F2FF] rounded-xl p-4">
                <p className="text-xs text-[var(--ios-blue)] mb-1" style={{ fontWeight: 600 }}>
                  리뷰 링크
                </p>
                <p className="text-xs text-[#1D1D1F] break-all font-mono">{reviewUrl}</p>
              </div>

              <p className="text-sm text-[#86868B]">고객에게 리뷰 요청을 보낼 방법을 선택하세요.</p>

              <div className="space-y-3">
                <button
                  onClick={handleSendKakaoTalk}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#FEE500] text-[#1D1D1F] rounded-xl transition-all active:scale-98"
                  style={{ fontWeight: 600 }}
                >
                  <Send className="w-5 h-5" />
                  카카오톡으로 전송
                </button>

                <button
                  onClick={handleCopyReviewLink}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#F5F5F7] text-[#1D1D1F] rounded-xl transition-all active:scale-98"
                  style={{ fontWeight: 600 }}
                >
                  <Copy className="w-5 h-5" />
                  링크 복사
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MobileFooterNav />
    </div>
  )
}
