'use client'

import { useAuth } from '../../modules/auth/context/useAuth'

interface Props {
  role: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const Role: React.FC<Props> = ({ children, fallback, role }) => {
  const { hasRole, isLoading } = useAuth()

  if (isLoading) {
    return <div className='h-8 animate-pulse rounded bg-gray-200'></div>
  }

  if (!hasRole(role)) {
    return fallback || null
  }

  return <>{children}</>
}
