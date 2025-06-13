'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/modules/auth/context/useAuth';
import { getRouteMeta, isPublicRoute } from '@/config/routes';

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Route: React.FC<Props>= ({ children, fallback }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, hasPermission, hasRole } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const routeMeta = getRouteMeta(pathname);
    
    if (isPublicRoute(pathname)) return;

    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (routeMeta.requiredRoles) {
      const hasRequiredRole = routeMeta.requiredRoles.some(role => hasRole(role));
      if (!hasRequiredRole) {
        router.push('/unauthorized');
        return;
      }
    }

    if (routeMeta.requiredPermissions) {
      const hasRequiredPermissions = routeMeta.requiredPermissions.every(
        permission => hasPermission(permission)
      );
      if (!hasRequiredPermissions) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [pathname, user, isLoading, hasPermission, hasRole, router]);

  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};
