import { useState } from 'react';
import { createRepairRequest } from '../lib/api';
import type { CreateRepairRequestParams } from '../lib/api';
import type { RepairRequest } from '../types/database';

/**
 * 수리 의뢰 생성 훅
 */
export function useRepairRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [repairRequest, setRepairRequest] = useState<RepairRequest | null>(null);

  const submit = async (params: CreateRepairRequestParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await createRepairRequest(params);
      setRepairRequest(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setRepairRequest(null);
    setError(null);
    setLoading(false);
  };

  return {
    submit,
    reset,
    loading,
    error,
    repairRequest
  };
}
