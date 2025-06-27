'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useAuth } from '../context/useAuth'
import { type UseAuthGuardOptions } from '../types'

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { redirectTo = '/auth/login', requiredPermission, requiredRole } = options

  const { hasPermission, hasRole, isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push(redirectTo)
      return
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      router.push('/unauthorized')
      return
    }

    if (requiredRole && !hasRole(requiredRole)) {
      router.push('/unauthorized')
      return
    }
  }, [
    isLoading,
    isAuthenticated,
    requiredPermission,
    requiredRole,
    hasPermission,
    hasRole,
    router,
    redirectTo,
  ])

  return {
    hasAccess:
      isAuthenticated &&
      (!requiredPermission || hasPermission(requiredPermission)) &&
      (!requiredRole || hasRole(requiredRole)),
    isAuthenticated,
    isLoading,
    user,
  }
}
