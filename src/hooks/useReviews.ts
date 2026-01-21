import { useState, useEffect } from 'react';
import { fetchPublicReviews, fetchAverageRating, submitReview, fetchRepairRequestByToken } from '../lib/api';
import type { Review, RepairRequest } from '../types/database';
import type { SubmitReviewParams } from '../lib/api';

/**
 * 공개 리뷰 조회 훅
 */
export function useReviews(limit = 20) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reviewsData, avgRating] = await Promise.all([
        fetchPublicReviews(limit),
        fetchAverageRating()
      ]);
      setReviews(reviewsData);
      setAverageRating(avgRating);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [limit]);

  return { reviews, averageRating, loading, error, refetch: loadReviews };
}

/**
 * 리뷰 작성 훅
 */
export function useReviewSubmit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (params: SubmitReviewParams) => {
    try {
      setLoading(true);
      setError(null);
      await submitReview(params);
      setSubmitted(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setError(null);
    setLoading(false);
  };

  return { submit, reset, loading, error, submitted };
}

/**
 * 리뷰 토큰으로 수리 의뢰 조회 훅
 */
export function useRepairRequestByToken(token: string | null) {
  const [repairRequest, setRepairRequest] = useState<RepairRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!token) {
      setRepairRequest(null);
      setLoading(false);
      return;
    }

    async function loadRepairRequest() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchRepairRequestByToken(token);
        setRepairRequest(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    loadRepairRequest();
  }, [token]);

  return { repairRequest, loading, error };
}
