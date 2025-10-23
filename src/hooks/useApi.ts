import { useState, useEffect, useCallback } from 'react'
import { apiClient, ApiResponse } from '@/lib/api-client'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiCall()
      
      if (response.success) {
        setData(response.data || null)
      } else {
        setError(response.error || 'API call failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

// Supported hooks tied to real APIs only
export function useRooms() {
  return useApi(() => apiClient.getRooms())
}

export function useRoomTypes() {
  return useApi(() => apiClient.getRoomTypes())
}

export function useBookings() {
  return useApi(() => apiClient.getBookings())
}

export function useServices() {
  return useApi(() => apiClient.getServices())
}

// Dashboard stats derived from real endpoints
export function useDashboardStats() {
  return useApi(() => apiClient.getDashboardStats())
}

export function useOccupancyStats() {
  return useApi(() => apiClient.getOccupancyStats())
}

export function useBookingStats() {
  return useApi(() => apiClient.getBookingStats())
}

export function usePaymentStats() {
  return useApi(() => apiClient.getPaymentStats())
}
