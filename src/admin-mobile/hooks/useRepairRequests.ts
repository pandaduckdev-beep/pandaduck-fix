import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { RepairStatus, RepairRequest } from '@/types/database'

interface RepairRequestWithModel extends RepairRequest {
  controller_models?: {
    model_name: string
  }
  has_review?: boolean
}

interface UseRepairRequestsOptions {
  status?: RepairStatus | 'all'
  searchQuery?: string
  enabled?: boolean
}

export function useRepairRequests(options: UseRepairRequestsOptions = {}) {
  const { status = 'all', searchQuery = '', enabled = true } = options
  const [requests, setRequests] = useState<RepairRequestWithModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled) {
      setRequests([])
      setLoading(false)
      return
    }

    fetchRequests()
  }, [status, enabled])

  // Separate effect for search to avoid excessive refetches
  useEffect(() => {
    if (requests.length > 0 && searchQuery) {
      // Search is done client-side for better UX
      // Could be moved to server-side if needed
    }
  }, [searchQuery, requests])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('repair_requests')
        .select(`
          *,
          controller_models!repair_requests_controller_model_fkey (
            model_name
          )
        `)
        .order('created_at', { ascending: false })

      if (status !== 'all') {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error

      if (data) {
        // FIX N+1: Batch fetch all reviews at once
        const requestIds = data.map((r) => r.id)
        const { data: reviews } = await supabase
          .from('reviews')
          .select('repair_request_id')
          .in('repair_request_id', requestIds)

        // Create a Set for O(1) lookup
        const reviewRequestIds = new Set(
          reviews?.map((r) => r.repair_request_id) || []
        )

        // Add has_review flag without additional queries
        const requestsWithReviews = data.map((request) => ({
          ...request,
          has_review: reviewRequestIds.has(request.id),
        }))

        setRequests(requestsWithReviews)
      }
    } catch (err) {
      console.error('Failed to fetch repair requests:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  // Client-side search filter
  const filteredRequests = searchQuery
    ? requests.filter(
        (req) =>
          req.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.controller_model.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : requests

  return {
    requests: filteredRequests,
    loading,
    error,
    refetch: fetchRequests,
  }
}
