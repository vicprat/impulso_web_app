'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

import {
  getStoreNavRoutes,
  getDashboardNavRoutes,
  getRouteMeta,
  buildBreadcrumbs,
  isPublicRoute,
  type RouteConfig,
  CustomerRoutes,
  VipRoutes,
  SupportRoutes,
  AdminRoutes,
  PublicStoreRoutes,
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
    const allRoutes = [
      ...PublicStoreRoutes,
      ...CustomerRoutes,
      ...VipRoutes,
      ...SupportRoutes,
      ...AdminRoutes,
    ]
    return buildBreadcrumbs(pathname, allRoutes)
  }, [pathname])

  const canAccessRoute = (route: RouteConfig): boolean => {
    if (route.isPublic) return true
    if (!user) return false

    const hasRequiredRole = !route.roles || route.roles.some((role) => hasRole(role))

    const hasRequiredPermission =
      !route.permissions || route.permissions.every((permission) => hasPermission(permission))

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
