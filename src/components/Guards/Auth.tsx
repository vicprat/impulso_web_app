'use client'

import { Login } from '@/components/Auth/Login'
import { useAuthGuard } from '@/modules/auth/hooks/useAuthGuard'

interface Props {
  children: React.ReactNode
  requiredPermission?: string
  requiredRole?: string
  fallback?: React.ReactNode
}

export const Auth: React.FC<Props> = ({ children, fallback, requiredPermission, requiredRole }) => {
  const { hasAccess, isLoading } = useAuthGuard({
    requiredPermission,
    requiredRole,
  })

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='size-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      fallback ?? (
        <div className='py-12 text-center'>
          <h2 className='mb-4 text-xl font-semibold text-gray-700'>Acceso Requerido</h2>
          <p className='mb-6 text-gray-600'>
            Necesitas iniciar sesión para acceder a esta sección.
          </p>
          <Login />
        </div>
      )
    )
  }

  return <>{children}</>
}
