import { supabase } from './supabase'
import type {
  ServiceOption,
  ServiceWithOptions,
  RepairRequest,
  Review,
  ServiceCombo,
  ControllerServiceWithOptions,
} from '../types/database'

// ============================================================================
// Services API
// ============================================================================

/**
 * 특정 컨트롤러 모델의 활성화된 모든 서비스 조회 (display_order 순으로 정렬)
 */
export async function fetchControllerServices(
  controllerModelId: string
): Promise<ControllerServiceWithOptions[]> {
  const { data: services, error: servicesError } = await supabase
    .from('controller_services')
    .select('*')
    .eq('controller_model_id', controllerModelId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (servicesError) {
    throw new Error(`Failed to fetch controller services: ${servicesError.message}`)
  }

  // 각 서비스에 대한 옵션 조회
  const servicesWithOptions = await Promise.all(
    (services || []).map(async (service) => {
      const { data: options } = await supabase
        .from('controller_service_options')
        .select('*')
        .eq('controller_service_id', service.id)
        .eq('is_active', true)
        .order('additional_price', { ascending: true })

      return {
        ...service,
        options: options || [],
      }
    })
  )

  return servicesWithOptions
}

/**
 * 모든 컨트롤러 모델 조회
 */
export async function fetchControllerModels() {
  const { data, error } = await supabase
    .from('controller_models')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch controller models: ${error.message}`)
  }

  return data || []
}

/**
 * 활성화된 모든 서비스 조회 (display_order 순으로 정렬)
 */
export async function fetchServices(): Promise<ServiceWithOptions[]> {
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (servicesError) {
    throw new Error(`Failed to fetch services: ${servicesError.message}`)
  }

  // 각 서비스에 대한 옵션 조회
  const servicesWithOptions = await Promise.all(
    (services || []).map(async (service) => {
      const { data: options } = await supabase
        .from('service_options')
        .select('*')
        .eq('service_id', service.id) // UUID를 사용
        .eq('is_active', true)
        .order('additional_price', { ascending: true })

      return {
        ...service,
        options: options || [],
      }
    })
  )

  return servicesWithOptions
}

/**
 * 특정 서비스 조회
 */
export async function fetchService(serviceId: string): Promise<ServiceWithOptions | null> {
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('service_id', serviceId)
    .eq('is_active', true)
    .single()

  if (serviceError) {
    if (serviceError.code === 'PGRST116') {
      return null // Not found
    }
    throw new Error(`Failed to fetch service: ${serviceError.message}`)
  }

  // 해당 서비스의 옵션들 조회
  const { data: options } = await supabase
    .from('service_options')
    .select('*')
    .eq('service_id', service.id) // UUID를 사용
    .eq('is_active', true)
    .order('additional_price', { ascending: true })

  return {
    ...service,
    options: options || [],
  }
}

/**
 * 특정 서비스의 옵션들 조회
 */
export async function fetchServiceOptions(serviceId: string): Promise<ServiceOption[]> {
  const { data, error } = await supabase
    .from('service_options')
    .select('*')
    .eq('service_id', serviceId)
    .eq('is_active', true)
    .order('additional_price', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch service options: ${error.message}`)
  }

  return data || []
}

// ============================================================================
// Repair Requests API
// ============================================================================

export interface CreateRepairRequestParams {
  customerName: string
  customerPhone: string
  customerEmail?: string
  controllerModel: string
  issueDescription?: string
  services: Array<{
    serviceId: string
    optionId?: string
    servicePrice: number
    optionPrice?: number
  }>
  totalAmount: number
}

/**
 * 수리 의뢰 생성
 */
export async function createRepairRequest(
  params: CreateRepairRequestParams
): Promise<RepairRequest> {
  // 1. 수리 의뢰 생성
  const { data: repairRequest, error: requestError } = await supabase
    .from('repair_requests')
    .insert({
      customer_name: params.customerName,
      customer_phone: params.customerPhone,
      customer_email: params.customerEmail,
      controller_model: params.controllerModel,
      issue_description: params.issueDescription,
      total_amount: params.totalAmount,
      status: 'pending',
    })
    .select()
    .single()

  if (requestError || !repairRequest) {
    throw new Error(`Failed to create repair request: ${requestError?.message}`)
  }

  // 2. 선택한 서비스들 추가
  const serviceInserts = params.services.map((service) => ({
    repair_request_id: repairRequest.id,
    service_id: service.serviceId,
    selected_option_id: service.optionId || null,
    service_price: service.servicePrice,
    option_price: service.optionPrice || 0,
  }))

  const { error: servicesError } = await supabase
    .from('repair_request_services')
    .insert(serviceInserts)

  if (servicesError) {
    // 실패 시 수리 의뢰도 삭제 (롤백)
    await supabase.from('repair_requests').delete().eq('id', repairRequest.id)
    throw new Error(`Failed to add services to repair request: ${servicesError.message}`)
  }

  return repairRequest
}

/**
 * 리뷰 토큰으로 수리 의뢰 조회
 */
export async function fetchRepairRequestByToken(token: string): Promise<RepairRequest | null> {
  const { data, error } = await supabase
    .from('repair_requests')
    .select('*')
    .eq('review_token', token)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw new Error(`Failed to fetch repair request: ${error.message}`)
  }

  return data
}

// ============================================================================
// Reviews API
// ============================================================================

export interface SubmitReviewParams {
  repairRequestId?: string
  customerName: string
  rating: number
  content: string
  serviceName: string
  imageUrl?: string
}

/**
 * 리뷰 작성
 */
export async function submitReview(params: SubmitReviewParams): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      repair_request_id: params.repairRequestId || null,
      customer_name: params.customerName,
      rating: params.rating,
      content: params.content,
      service_name: params.serviceName,
      image_url: params.imageUrl,
      is_approved: false, // 관리자 승인 대기
      is_public: false,
    })
    .select()
    .single()

  if (error || !data) {
    throw new Error(`Failed to submit review: ${error?.message}`)
  }

  return data
}

/**
 * 승인된 공개 리뷰 조회
 */
export async function fetchPublicReviews(limit = 20): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('is_approved', true)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch reviews: ${error.message}`)
  }

  return data || []
}

/**
 * 평균 평점 계산
 */
export async function fetchAverageRating(): Promise<number> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('is_approved', true)
    .eq('is_public', true)

  if (error || !data || data.length === 0) {
    return 0
  }

  const sum = data.reduce((acc, review) => acc + review.rating, 0)
  return Math.round((sum / data.length) * 10) / 10 // 소수점 1자리
}

// ============================================================================
// Service Combos API
// ============================================================================

/**
 * 활성화된 모든 서비스 콤보 조회
 */
export async function fetchServiceCombos(): Promise<ServiceCombo[]> {
  const { data, error } = await supabase
    .from('service_combos')
    .select('*')
    .eq('is_active', true)
    .order('discount_value', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch service combos: ${error.message}`)
  }

  return data || []
}
