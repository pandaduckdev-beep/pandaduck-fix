import { useState, useEffect } from 'react';
import { fetchServiceCombos } from '../lib/api';
import type { ServiceCombo } from '../types/database';

/**
 * 서비스 콤보/할인 조회 훅
 */
export function useServiceCombos() {
  const [combos, setCombos] = useState<ServiceCombo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCombos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchServiceCombos();
      setCombos(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCombos();
  }, []);

  return { combos, loading, error, refetch: loadCombos };
}
