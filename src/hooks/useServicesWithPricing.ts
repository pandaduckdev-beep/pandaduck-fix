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
          throw new Error(`컨트롤러 모델을 찾을 수 없습니다: ${controllerModelId}`);
        }

        setControllerModelUuid(controllerModel.id);

        // 2. 해당 모델의 가격이 포함된 서비스 조회
        const data = await getServicesWithPricing(controllerModel.id);
        setServices(data);
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
