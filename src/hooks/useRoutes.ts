'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/modules/auth/context/useAuth';
import {
  getStoreNavRoutes,
  getDashboardNavRoutes,
  getRouteMeta,
  buildBreadcrumbs,
  isPublicRoute,
  RouteConfig,
  CustomerRoutes,
  VipRoutes,
  SupportRoutes,
  AdminRoutes,
  PublicStoreRoutes
} from '@/config/routes';

export const useRoutes = () => {
  const pathname = usePathname();
  const { user, hasPermission, hasRole } = useAuth();

  const storeNavRoutes = useMemo(() => getStoreNavRoutes(), []);

  const dashboardNavRoutes = useMemo(() => {
    if (!user) return [];
    return getDashboardNavRoutes(user.roles, user.permissions);
  }, [user]);

  const currentRouteMeta = useMemo(() => {
    return getRouteMeta(pathname);
  }, [pathname]);

  const breadcrumbs = useMemo(() => {
    const allRoutes = [
      ...PublicStoreRoutes,
      ...CustomerRoutes,
      ...VipRoutes,
      ...SupportRoutes,
      ...AdminRoutes
    ];
    return buildBreadcrumbs(pathname, allRoutes);
  }, [pathname]);

  const canAccessRoute = (route: RouteConfig): boolean => {
    if (route.isPublic) return true;
    if (!user) return false;

    const hasRequiredRole = !route.roles || 
      route.roles.some(role => hasRole(role));
    
    const hasRequiredPermission = !route.permissions || 
      route.permissions.every(permission => hasPermission(permission));

    return hasRequiredRole && hasRequiredPermission;
  };

  const isCurrentRoutePublic = useMemo(() => isPublicRoute(pathname), [pathname]);

  return {
    storeNavRoutes,
    dashboardNavRoutes,
    currentRouteMeta,
    breadcrumbs,
    canAccessRoute,
    isCurrentRoutePublic,
    isStorePage: pathname.startsWith('/store') || pathname === '/',
    isDashboardPage: pathname.startsWith('/dashboard') || 
                     pathname.startsWith('/profile') || 
                     pathname.startsWith('/orders') ||
                     pathname.startsWith('/admin')
  };
};
