import { X, Printer } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { RepairRequest, ControllerService, ControllerServiceOption } from '@/types/database'

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

interface RepairDetailModalProps {
  isOpen: boolean
  onClose: () => void
  repair: RepairRequestWithServices
}

export function RepairDetailModal({ isOpen, onClose, repair }: RepairDetailModalProps) {
  if (!isOpen) return null

  // Get address from structured fields, fallback to parsing
  const getCustomerAddress = () => {
    // Priority 1: Use structured fields if available
    if (repair.postal_code && repair.address) {
      const parts = [
        `[${repair.postal_code}]`,
        repair.address,
        repair.detail_address
      ].filter(Boolean)
      return parts.join(' ')
    }

    // Priority 2: Fallback to parsing issue_description (for old data)
    if (repair.issue_description) {
      const addressMatch = repair.issue_description.match(/고객 주소:\s*(.+)/)
      if (addressMatch) return addressMatch[1].trim()
    }

    return null
  }

  const customerAddress = getCustomerAddress()

  // issue_description 파싱 (conditions, notes only)
  const parseIssueDescription = (description: string | null) => {
    if (!description) return { conditions: null, notes: null }
    const conditionsMatch = description.match(/상태:\s*\[(.+?)\]/)
    const notesMatch = description.match(/요청사항:\s*(.+?)(?:\n|$)/)
    return {
      conditions: conditionsMatch ? conditionsMatch[1].split(',').map((s) => s.trim()) : null,
      notes: notesMatch ? notesMatch[1].trim() : null,
    }
  }

  const { conditions: customerConditions, notes: customerNotes } = parseIssueDescription(repair.issue_description)

  // 서비스 가격 합계 계산
  const servicesTotal = repair.services?.reduce(
    (sum, svc) => sum + svc.service_price + svc.option_price,
    0
  ) || 0

  // 할인액 계산 (서비스 합계 - 총 금액)
  const discount = servicesTotal - repair.total_amount

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold">수리 요청 내역서</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              title="프린트"
            >
              <Printer className="w-5 h-5" />
              <span className="text-sm font-medium">프린트</span>
            </button>
<button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8 border-b-2 border-black pb-6">
            <h1 className="text-3xl font-bold mb-2">PandaDuck Fix</h1>
            <p className="text-sm text-gray-600">게임패드 수리 서비스</p>
            <div className="mt-4 text-xs text-gray-500">
              <p>접수번호: {repair.id.slice(0, 8).toUpperCase()}</p>
              <p>접수일시: {format(new Date(repair.created_at), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-black rounded"></span>
              고객 정보
            </h2>
            <div className="bg-gray-50 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600 font-medium">성함</span>
                <span className="font-semibold">{repair.customer_name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600 font-medium">연락처</span>
                <span className="font-semibold">{repair.customer_phone}</span>
              </div>
              {repair.customer_email && (
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">이메일</span>
                  <span className="font-semibold text-sm">{repair.customer_email}</span>
                </div>
              )}
              {customerAddress && (
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">주소</span>
                  <span className="font-semibold text-sm">{customerAddress}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">컨트롤러 모델</span>
                <span className="font-semibold">
                  {repair.controller_models?.model_name || repair.controller_model}
                </span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-black rounded"></span>
              수리 내역
            </h2>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">항목</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">금액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {repair.services?.map((svc, index) => (
                    <>
                      <tr key={`service-${index}`} className="bg-white">
                        <td className="px-4 py-3">
                          <div className="font-medium">{svc.service?.name || '서비스'}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          ₩{svc.service_price.toLocaleString()}
                        </td>
                      </tr>
                      {svc.option && svc.option_price > 0 && (
                        <tr key={`option-${index}`} className="bg-gray-50">
                          <td className="px-4 py-2 pl-8">
                            <div className="text-sm text-gray-600">└ {svc.option.option_name}</div>
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-gray-700">
                            +₩{svc.option_price.toLocaleString()}
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                  {discount > 0 && (
                    <tr className="bg-red-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-red-600">할인</div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-red-600">
                        -₩{discount.toLocaleString()}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-900 text-white">
                  <tr>
                    <td className="px-4 py-4 text-lg font-bold">총 금액</td>
                    <td className="px-4 py-4 text-right text-2xl font-bold">
                      ₩{repair.total_amount.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Controller Condition */}
          {(customerConditions || customerNotes) && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-black rounded"></span>
                컨트롤러 상태
              </h2>
              <div className="bg-gray-50 rounded-lg p-5 space-y-3">
                {customerConditions && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">현재 상태</p>
                    <div className="flex flex-wrap gap-2">
                      {customerConditions.map((c) => (
                        <span key={c} className="inline-block bg-white border border-gray-300 rounded-full px-3 py-1 text-sm font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {customerNotes && (
                  <div className={customerConditions ? 'pt-3 border-t border-gray-200' : ''}>
                    <p className="text-sm font-medium text-gray-600 mb-1">추가 요청사항</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{customerNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes Section */}
          {(repair.admin_notes || repair.pre_repair_notes || repair.post_repair_notes) && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-black rounded"></span>
                수리 메모
              </h2>
              <div className="space-y-4">
                {repair.admin_notes && (
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">관리자 메모</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{repair.admin_notes}</p>
                  </div>
                )}
                {repair.pre_repair_notes && (
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">수리 전 특이사항</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {repair.pre_repair_notes}
                    </p>
                  </div>
                )}
                {repair.post_repair_notes && (
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">수리 완료 후 메모</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {repair.post_repair_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="border-t-2 border-gray-300 pt-6 space-y-2 text-sm">
            {repair.estimated_completion_date && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">예상 완료일</span>
                <span className="font-semibold">
                  {format(new Date(repair.estimated_completion_date), 'yyyy년 MM월 dd일', {
                    locale: ko,
                  })}
                </span>
              </div>
            )}
            {repair.actual_completion_date && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">실제 완료일</span>
                <span className="font-semibold">
                  {format(new Date(repair.actual_completion_date), 'yyyy년 MM월 dd일', {
                    locale: ko,
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-gray-300 text-center text-xs text-gray-500">
            <p>본 내역서는 수리 요청을 확인하는 용도로 발행되었습니다.</p>
            <p className="mt-1">문의사항이 있으시면 고객센터로 연락주시기 바랍니다.</p>
            <p className="mt-4 font-semibold text-gray-700">감사합니다 🦆</p>
          </div>
        </div>
      </div>
    </div>
  )
}
