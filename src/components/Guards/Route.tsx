'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { getRouteMeta, isPublicRoute } from '@/config/routes'
import { useAuth } from '@/modules/auth/context/useAuth'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const Route: React.FC<Props> = ({ children, fallback }) => {
  const router = useRouter()
  const pathname = usePathname()
  const { hasPermission, hasRole, isLoading, user } = useAuth()

  useEffect(() => {
    if (isLoading) return

    const routeMeta = getRouteMeta(pathname)

    if (isPublicRoute(pathname)) return

    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    if (routeMeta.requiredRoles) {
      const hasRequiredRole = routeMeta.requiredRoles.some((role) => hasRole(role))
      if (!hasRequiredRole) {
        router.push('/unauthorized')
        return
      }
    }

    if (routeMeta.requiredPermissions) {
      const hasRequiredPermissions = routeMeta.requiredPermissions.every((permission) =>
        hasPermission(permission)
      )
      if (!hasRequiredPermissions) {
        router.push('/unauthorized')
        return
      }
    }
  }, [pathname, user, isLoading, hasPermission, hasRole, router])

  if (isLoading) {
    return (
      fallback ?? (
        <div className='flex min-h-screen items-center justify-center'>
          <div className='size-12 animate-spin rounded-full border-b-2 border-primary'></div>
        </div>
      )
    )
  }

  return <>{children}</>
}
