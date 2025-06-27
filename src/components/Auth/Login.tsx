'use client'

import { useAuth } from '@/modules/auth/context/useAuth'

export function Login() {
  const { isLoading, login } = useAuth()

  return (
    <button
      onClick={login}
      disabled={isLoading}
      className='rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400'
    >
      {isLoading ? 'Cargando...' : 'Iniciar Sesión con Shopify'}
    </button>
  )
}
