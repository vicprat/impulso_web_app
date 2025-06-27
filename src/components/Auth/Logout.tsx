'use client'

import { useAuth } from '@/modules/auth/context/useAuth'

export function Logout() {
  const { isLoading, logout } = useAuth()

  return (
    <button
      onClick={logout}
      disabled={isLoading}
      className='rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:bg-red-400'
    >
      {isLoading ? 'Cerrando...' : 'Cerrar Sesión'}
    </button>
  )
}
