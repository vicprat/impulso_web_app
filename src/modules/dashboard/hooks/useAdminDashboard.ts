import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/modules/auth/context/useAuth'

export const useAdminDashboard = () => {
  const { user } = useAuth()

  return useQuery({
    enabled: !!user && (user.roles.includes('admin') || user.roles.includes('manager')),
    queryFn: async () => {
      const response = await fetch('/api/dashboard/admin')
      if (!response.ok) {
        throw new Error('Failed to fetch admin dashboard data')
      }
      const data = await response.json()
      return data.data
    },
    queryKey: ['adminDashboard', user?.id],
    refetchInterval: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  })
}

export const useProductMetrics = () => {
  return useQuery({
    queryFn: async () => {
      const response = await fetch('/api/dashboard/product-metrics')
      if (!response.ok) {
        throw new Error('Failed to fetch product metrics data')
      }
      const data = await response.json()
      return data.data
    },
    queryKey: ['productMetrics'],
    staleTime: 10 * 60 * 1000,
  })
}
export const useAdvancedAnalytics = () => {
  const { user } = useAuth()
  return useQuery({
    enabled: !!user,
    queryFn: async () => {
      const response = await fetch('/api/dashboard/advanced-analytics')
      if (!response.ok) {
        throw new Error('Failed to fetch advanced analytics data')
      }
      const data = await response.json()
      return data.data
    },
    queryKey: ['advancedAnalytics', user?.id],
    staleTime: 15 * 60 * 1000,
  })
}
