import { useState, useEffect } from 'react'
import { getServicesWithPricing } from '../services/pricingService'
import type { ControllerServiceWithPricing } from '../types/database'

export function useServicesWithPricing(controllerModelId: string | null) {
  const [services, setServices] = useState<ControllerServiceWithPricing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!controllerModelId) {
      setServices([])
      setLoading(false)
      return
    }

    async function loadServices() {
      try {
        setLoading(true)
        setError(null)

        const data = await getServicesWithPricing(controllerModelId!)
        setServices(data)
      } catch (err) {
        console.error('Error loading services with pricing:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [controllerModelId])

  return { services, loading, error, controllerModelUuid: controllerModelId }
}
