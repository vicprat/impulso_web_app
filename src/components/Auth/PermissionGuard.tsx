
'use client';

import { useAuth } from "@/modules/auth/hooks/useAuth";


interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ 
  permission, 
  children, 
  fallback 
}: PermissionGuardProps) {
  const { hasPermission, isLoading } = useAuth();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-8 rounded"></div>;
  }

  if (!hasPermission(permission)) {
    return fallback || null;
  }

  return <>{children}</>;
}