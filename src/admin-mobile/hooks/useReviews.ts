import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Review } from '@/types/database'

export function useReviews(searchQuery: string = '') {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingReviewId, setTogglingReviewId] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setReviews(data || [])
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const togglePublic = async (review: Review) => {
    try {
      setTogglingReviewId(review.id)

      const { error } = await supabase
        .from('reviews')
        .update({ is_public: !review.is_public })
        .eq('id', review.id)

      if (!error) {
        setReviews(reviews.map((r) => (r.id === review.id ? { ...r, is_public: !r.is_public } : r)))
      } else {
        throw error
      }
    } catch (err) {
      console.error('Failed to toggle public:', err)
      // 에러 발생 시 원래 상태로 복구하기 위해 재조회
      fetchReviews()
    } finally {
      setTogglingReviewId(null)
    }
  }

  const deleteReview = async (reviewId: string) => {
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId)

    if (!error) {
      setReviews(reviews.filter((r) => r.id !== reviewId))
    }
  }

  // Client-side search filter
  const filteredReviews = searchQuery
    ? reviews.filter(
        (review) =>
          review.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.service_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : reviews

  return {
    reviews: filteredReviews,
    loading,
    togglingReviewId,
    error,
    refetch: fetchReviews,
    togglePublic,
    deleteReview,
  }
}
