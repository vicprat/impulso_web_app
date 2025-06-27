'use client'

import { useAuth } from '../../modules/auth/context/useAuth'

interface Props {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const Permission: React.FC<Props> = ({ children, fallback, permission }) => {
  const { hasPermission, isLoading } = useAuth()

  if (isLoading) {
    return <div className='h-8 animate-pulse rounded bg-gray-200'></div>
  }

  if (!hasPermission(permission)) {
    return fallback || null
  }

  return <>{children}</>
}
