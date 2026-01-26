import { useState, useEffect } from 'react'
import { fetchControllerServices } from '../lib/api'
import type { ControllerServiceWithOptions } from '../types/database'

export function useServices() {
  const [services, setServices] = useState<ControllerServiceWithOptions[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [controllerModelId, setControllerModelId] = useState<string | null>(null)

  const loadServices = async (modelId: string) => {
    try {
      setLoading(true)
      setError(null)
      setControllerModelId(modelId)
      const data = await fetchControllerServices(modelId)
      setServices(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return { services, loading, error, refetch: loadServices, controllerModelId }
}

export function useService(serviceId: string | null, controllerModelId: string | null) {
  const [service, setService] = useState<ControllerServiceWithOptions | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!serviceId || !controllerModelId) {
      setService(null)
      setLoading(false)
      return
    }

    async function loadService() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchControllerServices(controllerModelId!)
        const foundService = data.find((s) => s.service_id === serviceId)
        setService(foundService || null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    loadService()
  }, [serviceId, controllerModelId])

  return { service, loading, error }
}
