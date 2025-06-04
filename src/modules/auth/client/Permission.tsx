
'use client';

import { useAuth } from "../context/useAuth";



type Props = {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Permission: React.FC<Props> = ({ 
  permission, 
  children, 
  fallback 
}) => {
  const { hasPermission, isLoading } = useAuth();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-8 rounded"></div>;
  }

  if (!hasPermission(permission)) {
    return fallback || null;
  }

  return <>{children}</>;
}