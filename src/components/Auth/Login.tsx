'use client'

import { LoaderIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/modules/auth/context/useAuth'

export function Login() {
  const { isLoading, login } = useAuth()

  return (
    <Button onClick={login} disabled={isLoading} className='w-full font-semibold text-white '>
      {isLoading ? <LoaderIcon className='size-8 animate-spin' /> : 'Iniciar Sesión'}
    </Button>
  )
}
