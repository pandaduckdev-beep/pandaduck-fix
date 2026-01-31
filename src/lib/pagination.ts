import { useState, useCallback, useRef } from 'react'

interface UsePaginatedDataOptions<T> {
  fetchData: (page: number, limit: number) => Promise<{
    data: T[]
    hasMore: boolean
  }>
  initialLimit?: number
}

export function usePaginatedData<T>({
  fetchData,
  initialLimit = 20,
}: UsePaginatedDataOptions<T>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const loadingRef = useRef(false)

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return

    loadingRef.current = true
    setLoading(true)

    try {
      const result = await fetchData(page + 1, initialLimit)

      setData((prev) => [...prev, ...result.data])
      setHasMore(result.hasMore)
      setPage((p) => p + 1)
    } catch (error) {
      console.error('Failed to load more data:', error)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [fetchData, page, initialLimit, hasMore])

  const refresh = useCallback(async () => {
    setData([])
    setPage(0)
    setHasMore(true)
    loadMore()
  }, [loadMore])

  return {
    data,
    loading,
    hasMore,
    loadMore,
    refresh,
  }
}

/**
 * Hook for infinite scroll with Intersection Observer
 */
export function useInfiniteScroll(
  loadMore: () => void,
  hasMore: boolean
) {
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 1.0 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [loadMore, hasMore])

  return observerTarget
}
