'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { Login } from '@/components/Auth/Login'
import { useAuth } from '@/modules/auth/context/useAuth'

export const Client = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirect)
    }
  }, [isAuthenticated, isLoading, router, redirect])

  if (isAuthenticated) {
    return null
  }

  return (
    <div>
      <div className='w-full max-w-md space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold '>Iniciar Sesión</h2>
          <p className='mt-2 text-center text-sm text-gray-600'>Accede a tu cuenta de cliente</p>
        </div>

        <div className='mt-8 space-y-6'>
          <div className='text-center'>
            <Login />
          </div>

          <div className='text-center text-sm text-gray-500'>
            <p>Al iniciar sesión, serás redirigido a Shopify para autenticarte de forma segura.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
