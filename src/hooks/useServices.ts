import { useState, useEffect } from 'react';
import { fetchServices, fetchService } from '../lib/api';
import type { ServiceWithOptions } from '../types/database';

/**
 * 모든 활성 서비스 조회 훅
 */
export function useServices() {
  const [services, setServices] = useState<ServiceWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchServices();
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  return { services, loading, error, refetch: loadServices };
}

/**
 * 특정 서비스 조회 훅
 */
export function useService(serviceId: string | null) {
  const [service, setService] = useState<ServiceWithOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!serviceId) {
      setService(null);
      setLoading(false);
      return;
    }

    async function loadService() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchService(serviceId);
        setService(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    loadService();
  }, [serviceId]);

  return { service, loading, error };
}
