
'use client';

import { Login } from '@/components/Auth/Login';
import { useAuthGuard } from '@/modules/auth/hooks/useAuthGuard';

type Props = {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

export const Auth: React.FC<Props> = ({ 
  children, 
  requiredPermission, 
  requiredRole, 
  fallback 
}) => {
  const { isLoading, hasAccess } = useAuthGuard({
    requiredPermission,
    requiredRole,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return fallback || (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Acceso Requerido
        </h2>
        <p className="text-gray-600 mb-6">
          Necesitas iniciar sesión para acceder a esta sección.
        </p>
        <Login />
      </div>
    );
  }

  return <>{children}</>;
}
