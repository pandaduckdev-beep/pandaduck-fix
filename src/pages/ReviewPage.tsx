import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { notifyTelegram } from '@/lib/api'
import { Star, Upload, CheckCircle, Loader2 } from 'lucide-react'
import { maskName } from '@/lib/reviewUtils'
import { toast } from 'sonner'

interface RepairInfo {
  id: string
  customer_name: string
  controller_model: string
  created_at: string
  services: Array<{
    service_name: string
    option_name?: string
  }>
}

export function ReviewPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [repairInfo, setRepairInfo] = useState<RepairInfo | null>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // 0.5단위 별점 생성
  const ratingOptions = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

  useEffect(() => {
    loadRepairInfo()
  }, [token])

  const loadRepairInfo = async () => {
    if (!token) {
      toast.error('유효하지 않은 링크입니다.')
      return
    }

    try {
      // 토큰으로 수리 신청 정보 조회
      const { data: repair, error: repairError } = await supabase
        .from('repair_requests')
        .select('id, customer_name, controller_model, created_at')
        .eq('review_token', token)
        .eq('status', 'completed')
        .single()

      if (repairError || !repair) {
        toast.error('리뷰를 작성할 수 없는 수리 신청입니다.')
        return
      }

      // 이미 리뷰를 작성했는지 확인
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('repair_request_id', repair.id)
        .single()

      if (existingReview) {
        setSubmitted(true)
        setLoading(false)
        return
      }

      // Get controller model name
      let controllerModelName = repair.controller_model
      if (repair.controller_model) {
        const { data: modelData } = await supabase
          .from('controller_models')
          .select('model_name')
          .eq('id', repair.controller_model)
          .single()

        if (modelData) {
          controllerModelName = modelData.model_name
        }
      }

      // 서비스 정보 조회 - 서비스와 옵션 모두 가져오기
      const { data: repairServices } = await supabase
        .from('repair_request_services')
        .select('service_id, selected_option_id')
        .eq('repair_request_id', repair.id)

      if (!repairServices || repairServices.length === 0) {
        setRepairInfo({
          ...repair,
          controller_model: controllerModelName,
          services: [],
        })
        return
      }

      // 서비스 이름 가져오기
      const serviceIds = repairServices.map(s => s.service_id)
      const { data: services } = await supabase
        .from('controller_services')
        .select('id, name')
        .in('id', serviceIds)

      // 옵션 이름 가져오기 (선택된 옵션이 있는 경우만)
      const optionIds = repairServices
        .filter(s => s.selected_option_id)
        .map(s => s.selected_option_id)

      let options: any[] = []
      if (optionIds.length > 0) {
        const { data: optionsData } = await supabase
          .from('controller_service_options')
          .select('id, option_name')
          .in('id', optionIds)
        options = optionsData || []
      }

      const servicesWithDetails = repairServices.map((svc) => {
        const service = services?.find(s => s.id === svc.service_id)
        const option = options.find(o => o.id === svc.selected_option_id)
        return {
          service_name: service?.name || '알 수 없는 서비스',
          option_name: option?.option_name || null,
        }
      })

      setRepairInfo({
        ...repair,
        controller_model: controllerModelName,
        services: servicesWithDetails,
      })
    } catch (error) {
      console.error('Failed to load repair info:', error)
      toast.error('수리 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 3) {
      toast.error('이미지는 최대 3개까지 업로드할 수 있습니다.')
      return
    }

    // 이미지 미리보기 생성 및 메모리 정리
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setImagePreviews([...imagePreviews, ...newPreviews])
    setImages([...images, ...files])
  }

  const removeImage = (index: number) => {
    // 메모리 정리
    URL.revokeObjectURL(imagePreviews[index])
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImagePreviews(newPreviews)
    setImages(images.filter((_, i) => i !== index))
  }

  // 컴포넌트 언마운트 시 메모리 정리
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview))
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error('별점을 선택해주세요.')
      return
    }

    if (!comment.trim()) {
      toast.error('리뷰 내용을 입력해주세요.')
      return
    }

    setShowConfirmModal(true)
  }

  const submitReview = async () => {
    if (!repairInfo) return

    setSubmitting(true)
    try {
      // 이미지 업로드
      const imageUrls: string[] = []
      for (const image of images) {
        const fileExt = image.name.split('.').pop()
        const fileName = `${repairInfo.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `review-images/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('reviews')
          .upload(filePath, image)

        if (uploadError) {
          toast.error(`이미지 업로드 실패: ${uploadError.message}`)
        } else {
          const { data } = supabase.storage.from('reviews').getPublicUrl(filePath)
          imageUrls.push(data.publicUrl)
        }
      }

      // 리뷰 저장
      const serviceName = repairInfo.services.map(s => s.service_name).join(', ')

      const { data: reviewData, error } = await supabase.from('reviews').insert({
        repair_request_id: repairInfo.id,
        customer_name: repairInfo.customer_name,
        rating,
        content: comment.trim(),
        service_name: serviceName,
        image_urls: imageUrls,
        is_public: false,
      })

      if (error) {
        throw error
      }

      // 텔레그램 알림
      notifyTelegram('review', {
        customerName: repairInfo.customer_name,
        rating,
        content: comment.trim(),
        serviceName,
      })

      setShowConfirmModal(false)
      setSubmitted(true)
      toast.success('리뷰가 성공적으로 제출되었습니다!')
    } catch (error: any) {
      console.error('Failed to submit review:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        full: error
      })
      const errorMsg = error.details || error.hint || error.message || '알 수 없는 오류'
      toast.error(`리뷰 제출 실패: ${errorMsg}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">감사합니다!</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            소중한 리뷰를 남겨주셔서 감사합니다.
            <br />
            더 나은 서비스로 보답하겠습니다.
          </p>
          <p className="text-sm text-gray-500">
            리뷰는 관리자 승인 후 웹사이트에 게시됩니다.
          </p>
        </div>
      </div>
    )
  }

  if (!repairInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">링크 오류</h1>
          <p className="text-gray-600 leading-relaxed">
            유효하지 않은 리뷰 링크입니다.
            <br />
            링크를 다시 확인해주세요.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold">PandaDuck Fix</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-black text-white p-8">
            <h1 className="text-2xl font-bold mb-2">서비스 리뷰 작성</h1>
            <p className="text-gray-300 text-sm">소중한 의견을 들려주세요</p>
          </div>

          {/* Repair Info */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">수리 내역</h2>
            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">고객명</span>
                <span className="font-medium text-gray-900">{repairInfo.customer_name}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">컨트롤러</span>
                <span className="font-medium text-gray-900">{repairInfo.controller_model}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">수리 완료일</span>
                <span className="font-medium text-gray-900">
                  {new Date(repairInfo.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <div className="pt-4 mt-3 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">수리 서비스</p>
                <div className="space-y-2">
                  {repairInfo.services.map((svc, index) => (
                    <div key={index} className="text-sm">
                      <span className="text-gray-900 font-medium">{svc.service_name}</span>
                      {svc.option_name && (
                        <span className="text-gray-500 text-xs ml-2">({svc.option_name})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                별점 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {ratingOptions.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-all hover:scale-110"
                    title={`${value}점`}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        value <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-200'
                      } transition-colors`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-4 text-lg font-medium text-gray-700">
                    {rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                리뷰 내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={6}
                placeholder="서비스에 대한 경험을 자세히 작성해주세요."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none resize-none transition bg-white"
                maxLength={1000}
              />
              <p className="text-xs text-gray-400 mt-2 text-right">
                {comment.length} / 1000
              </p>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                사진 첨부 <span className="text-gray-400 font-normal text-xs">(선택, 최대 3장)</span>
              </label>
              <div className="space-y-4">
                {images.length < 3 && (
                  <label className="flex flex-col items-center justify-center w-full h-36 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition">
                    <Upload className="w-7 h-7 text-gray-300 mb-2" />
                    <span className="text-sm text-gray-500">클릭하여 이미지 업로드</span>
                    <span className="text-xs text-gray-400 mt-1">
                      JPG, PNG (최대 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imagePreviews[index]}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-100"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 w-7 h-7 bg-black text-white rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-sm font-medium shadow-lg"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-900 transition-all duration-200 text-base shadow-sm hover:shadow"
            >
              리뷰 작성 완료
            </button>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">리뷰 제출 확인</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              리뷰를 제출하시겠습니까?
              <br />
              <span className="text-red-500 font-semibold">제출 후에는 수정이 불가능합니다.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={submitReview}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    제출 중...
                  </>
                ) : (
                  '확인'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
