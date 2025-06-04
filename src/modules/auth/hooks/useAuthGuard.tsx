'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UseAuthGuardOptions } from '../types';
import { useAuth } from '../context/useAuth';

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { 
    redirectTo = '/auth/login', 
    requiredPermission, 
    requiredRole 
  } = options;
  
  const { user, isLoading, isAuthenticated, hasPermission, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      router.push('/unauthorized');
      return;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      router.push('/unauthorized');
      return;
    }
  }, [
    isLoading, 
    isAuthenticated, 
    requiredPermission, 
    requiredRole, 
    hasPermission, 
    hasRole, 
    router, 
    redirectTo
  ]);

  return {
    user,
    isLoading,
    isAuthenticated,
    hasAccess: isAuthenticated && 
      (!requiredPermission || hasPermission(requiredPermission)) &&
      (!requiredRole || hasRole(requiredRole))
  };
}
