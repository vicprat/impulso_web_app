'use client'

import { useState } from 'react'

import { Guard } from '@/components/Guards'
import { useAuth } from '@/modules/auth/context/useAuth'

import { useCurrentUser } from '@/modules/user/hooks/management'

import { EnhancedUserProfile } from './components/EnhancedUserProfile'
import { RolePermissionsGuide } from './components/RolePermissionsGuide'
import { UserManagementAdmin } from './components/UserManagementAdmin'

function DashboardContent() {
  const { hasPermission, hasRole } = useAuth()
  const { currentUser, isLoading: userLoading } = useCurrentUser()
  const [activeSection, setActiveSection] = useState<'overview' | 'profile' | 'admin'>(
    'overview'
  )

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
    {
      description: 'Gestionar información personal',
      icon: '👤',
      id: 'profile',
      label: 'Perfil',
    },
    
  ]

  // Agregar sección de administración si tiene permisos
  if (hasPermission('manage_users') || hasRole('admin') || hasRole('super_admin')) {
    navigationItems.push({
      description: 'Panel de administración',
      icon: '⚙️',
      id: 'admin',
      label: 'Administración',
    })
  }

  

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Navigation */}
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        <div className='mb-6 rounded-lg bg-white p-2 shadow-sm'>
          <nav className='flex space-x-1'>
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`flex flex-1 items-center justify-center space-x-3 rounded-lg px-4 py-3 transition-colors ${
                  activeSection === item.id
                    ? 'border border-blue-200 bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <span className='text-xl'>{item.icon}</span>
                <div className='text-left'>
                  <div className='font-medium'>{item.label}</div>
                  <div className='text-xs opacity-75'>{item.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Sections */}
        <div className='space-y-6'>
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
              {/* Stats Cards */}
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-2'>
                <div className='rounded-lg bg-white p-6 shadow-sm'>
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

                <div className='rounded-lg bg-white p-6 shadow-sm'>
                  <div className='flex items-center'>
                    <div className='rounded-lg bg-green-100 p-2'>
                      <span className='text-xl text-green-600'>🛍️</span>
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-600'>Órdenes Recientes</p>
                      <p className='text-2xl font-semibold text-gray-900'>
                        {currentUser.shopifyData?.orderCount || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='rounded-lg bg-white p-6 shadow-sm'>
                  <div className='flex items-center'>
                    <div className='rounded-lg bg-purple-100 p-2'>
                      <span className='text-xl text-purple-600'>🏠</span>
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-600'>Direcciones</p>
                      <p className='text-2xl font-semibold text-gray-900'>
                        {currentUser.shopifyData?.addresses.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='rounded-lg bg-white p-6 shadow-sm'>
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
                <div className='rounded-lg bg-white p-6 shadow-sm'>
                  <h3 className='mb-4 text-lg font-medium text-gray-900'>Acciones Rápidas</h3>
                  <div className='space-y-3'>
                    <button
                      onClick={() => setActiveSection('profile')}
                      className='flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50'
                    >
                      <div className='flex items-center'>
                        <span className='mr-3 text-blue-600'>👤</span>
                        <span className='text-sm font-medium'>Editar Perfil</span>
                      </div>
                      <span className='text-gray-400'>→</span>
                    </button>

                    

                    {hasPermission('manage_users') && (
                      <button
                        onClick={() => setActiveSection('admin')}
                        className='flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50'
                      >
                        <div className='flex items-center'>
                          <span className='mr-3 text-purple-600'>⚙️</span>
                          <span className='text-sm font-medium'>Administración</span>
                        </div>
                        <span className='text-gray-400'>→</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Section */}
          {activeSection === 'profile' && <EnhancedUserProfile />}

          

          {/* Admin Section */}
          {activeSection === 'admin' && (
            <Guard.Permission
              permission='manage_users'
              fallback={
                <div className='rounded-lg bg-white p-6 shadow-md'>
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
              <UserManagementAdmin />
              <RolePermissionsGuide />
            </Guard.Permission>
          )}
        </div>
      </div>
    </div>
  )
}

export default function IntegratedDashboard() {
  return (
    <Guard.Auth>
      <DashboardContent />
    </Guard.Auth>
  )
}
