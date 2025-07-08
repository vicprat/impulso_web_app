'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

import {
  buildBreadcrumbs,
  getAllRoutes,
  getDashboardNavRoutes,
  getRouteMeta,
  getStoreNavRoutes,
  isPublicRoute,
  type RouteConfig,
} from '@/config/routes'
import { useAuth } from '@/modules/auth/context/useAuth'

export const useRoutes = () => {
  const pathname = usePathname()
  const { hasPermission, hasRole, user } = useAuth()

  const storeNavRoutes = useMemo(() => getStoreNavRoutes(), [])

  const dashboardNavRoutes = useMemo(() => {
    if (!user) return []
    return getDashboardNavRoutes(user.roles, user.permissions)
  }, [user])

  const currentRouteMeta = useMemo(() => {
    return getRouteMeta(pathname)
  }, [pathname])

  const breadcrumbs = useMemo(() => {
    const allRoutes = getAllRoutes()
    return buildBreadcrumbs(pathname, allRoutes)
  }, [pathname])

  const canAccessRoute = (route: RouteConfig): boolean => {
    if (route.IS_PUBLIC) return true
    if (!user) return false

    const hasRequiredRole = !route.ROLES || route.ROLES.some((role) => hasRole(role))

    const hasRequiredPermission =
      !route.PERMISSIONS || route.PERMISSIONS.every((permission) => hasPermission(permission))

    return hasRequiredRole && hasRequiredPermission
  }

  const isCurrentRoutePublic = useMemo(() => isPublicRoute(pathname), [pathname])

  return {
    breadcrumbs,
    canAccessRoute,
    currentRouteMeta,
    dashboardNavRoutes,
    isCurrentRoutePublic,
    isDashboardPage:
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/profile') ||
      pathname.startsWith('/orders') ||
      pathname.startsWith('/admin'),
    isStorePage: pathname.startsWith('/store') || pathname === '/',
    storeNavRoutes,
  }
}
