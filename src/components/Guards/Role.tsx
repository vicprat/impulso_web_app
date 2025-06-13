
'use client';

import { useAuth } from "../../modules/auth/context/useAuth";



type Props = {
  role: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Role: React.FC<Props> = ({ 
  role, 
  children, 
  fallback 
}) => {
  const { hasRole, isLoading } = useAuth();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-8 rounded"></div>;
  }

  if (!hasRole(role)) {
    return fallback || null;
  }

  return <>{children}</>;
}
