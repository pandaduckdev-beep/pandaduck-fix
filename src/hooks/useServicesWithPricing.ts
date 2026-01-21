import { useState, useEffect } from 'react';
import {
  getControllerModelById,
  getServicesWithPricing
} from '../services/pricingService';
import type { ServiceWithPricing } from '../types/database';

/**
 * 컨트롤러 모델별 가격이 포함된 서비스 조회 훅
 */
export function useServicesWithPricing(controllerModelId: string | null) {
  const [services, setServices] = useState<ServiceWithPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [controllerModelUuid, setControllerModelUuid] = useState<string | null>(null);

  useEffect(() => {
    if (!controllerModelId) {
      setServices([]);
      setLoading(false);
      return;
    }

    async function loadServices() {
      try {
        setLoading(true);
        setError(null);

        // 1. 컨트롤러 모델 ID로 UUID 조회
        const controllerModel = await getControllerModelById(controllerModelId);

        if (!controllerModel) {
          // 컨트롤러 모델 테이블이 없거나 모델을 찾을 수 없는 경우
          // 임시 UUID를 사용하여 기본 가격으로 서비스 조회
          console.warn(`Controller model not found: ${controllerModelId}, using base prices`);
          const data = await getServicesWithPricing('temp-uuid-for-fallback');
          setServices(data);
          setControllerModelUuid(null);
        } else {
          setControllerModelUuid(controllerModel.id);

          // 2. 해당 모델의 가격이 포함된 서비스 조회
          const data = await getServicesWithPricing(controllerModel.id);
          setServices(data);
        }
      } catch (err) {
        console.error('Error loading services with pricing:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, [controllerModelId]);

  return { services, loading, error, controllerModelUuid };
}
