'use client'

import { useAuth } from '@/modules/auth/context/useAuth'

import { Logout } from './Logout'

export function UserProfile() {
  const { isLoading, user } = useAuth()

  if (isLoading) {
    return <div className='h-20 animate-pulse rounded-lg bg-gray-200'></div>
  }

  if (!user) {
    return null
  }

  return (
    <div className='rounded-lg bg-white p-6 shadow-md'>
      <h2 className='mb-4 text-xl font-semibold'>Perfil de Usuario</h2>

      <div className='space-y-3'>
        <div>
          <span className='font-medium text-gray-600'>Nombre:</span>
          <span className='ml-2'>
            {user.firstName} {user.lastName}
          </span>
        </div>

        <div>
          <span className='font-medium text-gray-600'>Email:</span>
          <span className='ml-2'>{user.email}</span>
        </div>

        <div>
          <span className='font-medium text-gray-600'>Roles:</span>
          <div className='ml-2 flex flex-wrap gap-2'>
            {user.roles.map((role) => (
              <span key={role} className='rounded-full bg-blue-100 px-2 py-1 text-sm text-blue-800'>
                {role}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className='font-medium text-gray-600'>Permisos:</span>
          <div className='ml-2 flex max-h-32 flex-wrap gap-2 overflow-y-auto'>
            {user.permissions.map((permission) => (
              <span
                key={permission}
                className='rounded-full bg-green-100 px-2 py-1 text-xs text-green-800'
              >
                {permission}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className='mt-6'>
        <Logout />
      </div>
    </div>
  )
}
