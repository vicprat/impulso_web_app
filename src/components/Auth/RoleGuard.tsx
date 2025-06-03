
'use client';

import { useAuth } from "@/modules/auth/hooks/useAuth";


interface RoleGuardProps {
  role: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ 
  role, 
  children, 
  fallback 
}: RoleGuardProps) {
  const { hasRole, isLoading } = useAuth();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-8 rounded"></div>;
  }

  if (!hasRole(role)) {
    return fallback || null;
  }

  return <>{children}</>;
}
