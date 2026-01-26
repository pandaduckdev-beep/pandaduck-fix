import { supabase } from '../lib/supabase'
import type {
  ControllerModel,
  ControllerServiceWithPricing,
  ControllerServicePricing,
  ControllerOptionPricing,
} from '../types/database'

/**
 * 컨트롤러 모델 목록 조회
 */
export async function getControllerModels(): Promise<ControllerModel[]> {
  const { data, error } = await supabase
    .from('controller_models')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (error) {
    console.error('Error fetching controller models:', error)
    throw error
  }

  return data || []
}

/**
 * 특정 컨트롤러 모델의 서비스별 가격 조회
 */
export async function getServicePricingByController(
  controllerModelId: string
): Promise<ControllerServicePricing[]> {
  const { data, error } = await supabase
    .from('controller_service_pricing')
    .select('*')
    .eq('controller_model_id', controllerModelId)
    .eq('is_available', true)

  if (error) {
    console.error('Error fetching service pricing:', error)
    throw error
  }

  return data || []
}

/**
 * 특정 컨트롤러 모델의 옵션별 가격 조회
 */
export async function getOptionPricingByController(
  controllerModelId: string
): Promise<ControllerOptionPricing[]> {
  const { data, error } = await supabase
    .from('controller_option_pricing')
    .select('*')
    .eq('controller_model_id', controllerModelId)
    .eq('is_available', true)

  if (error) {
    console.error('Error fetching option pricing:', error)
    throw error
  }

  return data || []
}

/**
 * 컨트롤러 모델별 서비스와 가격 정보를 함께 조회
 */
export async function getServicesWithPricing(
  controllerModelId: string
): Promise<ControllerServiceWithPricing[]> {
  console.log('getServicesWithPricing called with controllerModelId:', controllerModelId)
  console.log('Type of controllerModelId:', typeof controllerModelId)

  // If controllerModelId looks like a model_id (e.g., 'dualsense'), convert it to UUID first
  let modelUuid = controllerModelId

  // Check if it's a model_id by trying to fetch the controller model
  if (!controllerModelId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    // It's not a UUID, so it might be a model_id
    const model = await getControllerModelById(controllerModelId)
    if (model) {
      modelUuid = model.id
      console.log('Converted model_id to UUID:', modelUuid)
    }
  }

  const { data: services, error: servicesError } = await supabase
    .from('controller_services')
    .select('*, controller_service_options(*)')
    .eq('controller_model_id', modelUuid)
    .eq('is_active', true)
    .order('display_order')

  console.log('Supabase query result - services:', services)
  console.log('Supabase query result - error:', servicesError)

  if (servicesError) {
    console.error('Error fetching controller services:', servicesError)
    throw servicesError
  }

  const servicesWithPricing: ControllerServiceWithPricing[] = (services || []).map(
    (service: any) => ({
      ...service,
      options: service.controller_service_options || [],
    })
  )

  console.log('Final services with pricing:', servicesWithPricing)
  return servicesWithPricing
}

/**
 * 컨트롤러 모델 ID로 모델 정보 조회
 */
export async function getControllerModelById(modelId: string): Promise<ControllerModel | null> {
  try {
    const { data, error } = await supabase
      .from('controller_models')
      .select('*')
      .eq('model_id', modelId)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching controller model:', error)
      return null
    }

    return data
  } catch (error) {
    console.warn('Controller models table not found:', error)
    return null
  }
}

/**
 * 선택한 서비스들의 총 가격 계산
 */
export function calculateTotalPrice(
  services: ControllerServiceWithPricing[],
  selectedServices: Map<string, string | null>
): number {
  let total = 0

  selectedServices.forEach((selectedOptionId, serviceId) => {
    const service = services.find((s) => s.id === serviceId)
    if (!service) return

    total += service.base_price

    if (selectedOptionId && service.options) {
      const option = service.options.find((o) => o.id === selectedOptionId)
      if (option) {
        total += option.additional_price
      }
    }
  })

  return total
}
