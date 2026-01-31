/**
 * Simple in-memory cache with TTL support
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class Cache {
  private store: Map<string, CacheEntry<any>> = new Map()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Set cached data with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    })
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.store.delete(key)
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.store.size
  }
}

// Singleton instance
export const cache = new Cache()

/**
 * Helper function to fetch with cache
 */
export async function fetchWithCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  const data = await fn()
  cache.set(key, data, ttl)
  return data
}
