'use client'

import Link from 'next/link'

import { Guard } from '@/components/Guards'
import { useAuth } from '@/modules/auth/context/useAuth'
import { useCurrentUser } from '@/modules/user/hooks/management'

import { RolePermissionsGuide } from './components/RolePermissionsGuide'

export default function IntegratedDashboard() {
  const { hasPermission, hasRole } = useAuth()
  const { currentUser, isLoading: userLoading } = useCurrentUser()

  if (userLoading || !currentUser) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='animate-pulse space-y-4 text-center'>
          <div className='mx-auto h-8 w-48 rounded bg-gray-200'></div>
          <div className='mx-auto h-6 w-32 rounded bg-gray-200'></div>
          <div className='mx-auto h-16 w-full max-w-md rounded bg-gray-200'></div>
        </div>
      </div>
    )
  }

  const navigationItems = [
    {
      description: 'Vista general de tu cuenta',
      icon: '📊',
      id: 'overview',
      label: 'Resumen',
    },
  ]

  // Agregar sección de administración si tiene permisos
  const canManageUsers = hasPermission('manage_users') || hasRole('admin') || hasRole('super_admin')
  if (canManageUsers) {
    navigationItems.push({
      description: 'Panel de administración',
      icon: '⚙️',
      id: 'admin',
      label: 'Administración',
    })
  }

  return (
    <div className='container mx-auto min-h-screen px-4 py-8'>
      {/* Content Sections */}
      <div className='space-y-6'>
        {/* Overview Section - Siempre visible */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Stats Cards */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-2'>
            <div className='rounded-lg bg-surface-container-high p-6 shadow-sm'>
              <div className='flex items-center'>
                <div className='rounded-lg bg-blue-100 p-2'>
                  <span className='text-xl text-blue-600'>👤</span>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>Estado de Cuenta</p>
                  <p className='text-2xl font-semibold text-gray-900'>
                    {currentUser.isActive ? 'Activa' : 'Inactiva'}
                  </p>
                </div>
              </div>
            </div>

            <div className='rounded-lg bg-surface-container-high p-6 shadow-sm'>
              <div className='flex items-center'>
                <div className='rounded-lg bg-green-100 p-2'>
                  <span className='text-xl text-green-600'>🛍️</span>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>Órdenes Recientes</p>
                  <p className='text-2xl font-semibold text-gray-900'>
                    {currentUser.shopifyData?.orderCount ?? 0}
                  </p>
                </div>
              </div>
            </div>

            <div className='rounded-lg bg-surface-container-high p-6 shadow-sm'>
              <div className='flex items-center'>
                <div className='rounded-lg bg-purple-100 p-2'>
                  <span className='text-xl text-purple-600'>🏠</span>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>Direcciones</p>
                  <p className='text-2xl font-semibold text-gray-900'>
                    {currentUser.shopifyData?.addresses.length ?? 0}
                  </p>
                </div>
              </div>
            </div>

            <div className='rounded-lg bg-surface-container-high p-6 shadow-sm'>
              <div className='flex items-center'>
                <div className='rounded-lg bg-orange-100 p-2'>
                  <span className='text-xl text-orange-600'>🔑</span>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>Permisos</p>
                  <p className='text-2xl font-semibold text-gray-900'>
                    {currentUser.permissions.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className='lg:col-span-1'>
            <div className='rounded-lg bg-surface-container-high p-6 shadow-sm'>
              <h3 className='mb-4 text-lg font-medium text-gray-900'>Acciones Rápidas</h3>
              <div className='space-y-3'>
                <Link href='/profile'>
                  <div className='flex items-center'>
                    <span className='mr-3 text-blue-600'>👤</span>
                    <span className='text-sm font-medium'>Editar Perfil</span>
                  </div>
                  <span className='text-gray-400'>→</span>
                </Link>

                {canManageUsers && (
                  <Link href='/admin/users'>
                    {' '}
                    {/* Asumiendo una ruta de admin para usuarios */}
                    <div className='flex items-center'>
                      <span className='mr-3 text-purple-600'>⚙️</span>
                      <span className='text-sm font-medium'>Administración</span>
                    </div>
                    <span className='text-gray-400'>→</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Section - Condicionalmente visible */}
        {canManageUsers && (
          <Guard.Permission
            permission='manage_users'
            fallback={
              <div className='rounded-lg bg-surface-container-high p-6 shadow-md'>
                <div className='py-8 text-center'>
                  <span className='text-6xl'>🔒</span>
                  <h2 className='mt-4 text-xl font-semibold text-gray-800'>Acceso Restringido</h2>
                  <p className='mt-2 text-gray-600'>
                    No tienes permisos para acceder al panel de administración
                  </p>
                </div>
              </div>
            }
          >
            <RolePermissionsGuide />
          </Guard.Permission>
        )}
      </div>
    </div>
  )
}
