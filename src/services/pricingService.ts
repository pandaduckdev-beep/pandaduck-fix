import { supabase } from '../lib/supabase';
import type {
  ControllerModel,
  ServiceWithPricing,
  ControllerServicePricing,
  ControllerOptionPricing
} from '../types/database';

/**
 * 컨트롤러 모델 목록 조회
 */
export async function getControllerModels(): Promise<ControllerModel[]> {
  const { data, error } = await supabase
    .from('controller_models')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching controller models:', error);
    throw error;
  }

  return data || [];
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
    .eq('is_available', true);

  if (error) {
    console.error('Error fetching service pricing:', error);
    throw error;
  }

  return data || [];
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
    .eq('is_available', true);

  if (error) {
    console.error('Error fetching option pricing:', error);
    throw error;
  }

  return data || [];
}

/**
 * 컨트롤러 모델별 서비스와 가격 정보를 함께 조회
 */
export async function getServicesWithPricing(
  controllerModelId: string
): Promise<ServiceWithPricing[]> {
  // 1. 모든 활성 서비스 조회 (display_order 순으로 정렬)
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('*, service_options(*)')
    .eq('is_active', true)
    .order('display_order');

  if (servicesError) {
    console.error('Error fetching services:', servicesError);
    throw servicesError;
  }

  try {
    // 2. 해당 컨트롤러의 서비스 가격 조회 (테이블이 없으면 폴백)
    const servicePricing = await getServicePricingByController(controllerModelId);
    const pricingMap = new Map(
      servicePricing.map(p => [p.service_id, p])
    );

    // 3. 해당 컨트롤러의 옵션 가격 조회 (테이블이 없으면 폴백)
    const optionPricing = await getOptionPricingByController(controllerModelId);
    const optionPricingMap = new Map(
      optionPricing.map(p => [p.service_option_id, p])
    );

    // 4. 서비스에 가격 정보 매핑
    const servicesWithPricing: ServiceWithPricing[] = (services || [])
      .map(service => {
        const pricing = pricingMap.get(service.id);

        // 해당 컨트롤러에서 제공하지 않는 서비스는 제외
        if (!pricing || !pricing.is_available) {
          return null;
        }

        return {
          ...service,
          pricing,
          options: (service.service_options || []).map(option => ({
            ...option,
            pricing: optionPricingMap.get(option.id)
          })).filter(opt => opt.pricing?.is_available !== false)
        };
      })
      .filter((s): s is ServiceWithPricing => s !== null);

    return servicesWithPricing;
  } catch (error) {
    // 테이블이 없을 경우 기본 가격으로 폴백
    console.warn('Controller pricing tables not found, using base prices:', error);
    return (services || []).map(service => ({
      ...service,
      options: service.service_options || []
    }));
  }
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
      .single();

    if (error) {
      console.error('Error fetching controller model:', error);
      return null;
    }

    return data;
  } catch (error) {
    // 테이블이 없을 경우 null 반환
    console.warn('Controller models table not found:', error);
    return null;
  }
}

/**
 * 선택한 서비스들의 총 가격 계산 (컨트롤러 모델 고려)
 */
export function calculateTotalPrice(
  services: ServiceWithPricing[],
  selectedServices: Map<string, string | null>
): number {
  let total = 0;

  selectedServices.forEach((selectedOptionId, serviceId) => {
    const service = services.find(s => s.id === serviceId);
    if (!service || !service.pricing) return;

    // 서비스 기본 가격
    total += service.pricing.price;

    // 옵션 가격
    if (selectedOptionId && service.options) {
      const option = service.options.find(o => o.id === selectedOptionId);
      if (option?.pricing) {
        total += option.pricing.additional_price;
      }
    }
  });

  return total;
}
